import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import authApi from '@utils/api/authApi';
import {storeWebSessionInfo} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';
import KodaGoogleLogin from '../../web/src/features/koda/components/KodaGoogleLogin';

const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
};
let mockLanguage = 'en';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('@stores/localeStore', () => selector =>
  selector({language: mockLanguage}),
);
jest.mock('@utils/api/authApi', () => ({loginGoogle: jest.fn()}));
jest.mock('@utils/auth/login', () => ({storeWebSessionInfo: jest.fn()}));
jest.mock('@utils/auth/lastLoginProvider', () => ({
  storeLastLoginProvider: jest.fn(),
}));
jest.mock('@screens/(Common)/Register/ForeignRegisterProfile', () =>
  'ForeignRegisterProfile',
);
jest.mock('@screens/(Common)/Register/SocialOriginSelect', () => 'SocialOriginSelect');
jest.mock('@screens/(Common)/Register/RegisterAgree', () => 'RegisterAgree');
jest.mock('@screens/(Common)/Register/PhoneCertificate', () => 'PhoneCertificate');
jest.mock('@screens/(User)/UserRegister/UserRegisterProfile', () => 'UserRegisterProfile');
jest.mock('../../web/src/features/koda/components/KodaLogo', () => 'KodaLogo');
jest.mock('../../web/src/features/koda/components/KodaAgreementDialog', () =>
  'KodaAgreementDialog',
);
jest.mock('../../web/src/features/koda/styles/koda-auth.css', () => ({}));

const originalWindow = global.window;
const originalDocument = global.document;
const originalEnvironment = global.__TRIO_ENV__;
const credential = 'test-google-credential';
const signupResponse = {
  data: {
    isNewUser: true,
    status: 'SOCIAL_ACCOUNT_NOT_LINKED',
    socialSignupToken: 'test-signup-session',
    session: null,
  },
};
const session = {email: 'member@example.com', name: 'Member', role: 'USER'};
const linkedResponse = {
  data: {isNewUser: false, status: 'LINKED', session},
};
let screen;
let identity;
let storage;

beforeEach(() => {
  jest.clearAllMocks();
  authApi.loginGoogle.mockReset();
  storeWebSessionInfo.mockReset().mockResolvedValue(undefined);
  storeLastLoginProvider.mockReset().mockResolvedValue(undefined);
  mockLanguage = 'en';
  identity = {initialize: jest.fn(), renderButton: jest.fn()};
  storage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  global.window = {
    google: {accounts: {id: identity}},
    sessionStorage: storage,
    localStorage: storage,
    history: {pushState: jest.fn(), replaceState: jest.fn()},
  };
  global.document = {
    title: 'KODA CLUB',
    createElement: jest.fn(),
    head: {appendChild: jest.fn()},
  };
  global.__TRIO_ENV__ = {GOOGLE_CLIENT_ID: 'test-web-client-id'};
});

afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  screen = undefined;
  global.window = originalWindow;
  global.document = originalDocument;
  global.__TRIO_ENV__ = originalEnvironment;
});

async function renderScreen() {
  await act(async () => {
    screen = Renderer.create(<KodaGoogleLogin />, {
      createNodeMock: () => ({clientWidth: 290, replaceChildren: jest.fn()}),
    });
  });
}

async function googleSignIn(value = credential) {
  const options = identity.initialize.mock.calls.at(-1)[0];
  await act(async () => options.callback({credential: value}));
}

const forms = () => screen.root.findAllByType('ForeignRegisterProfile');
const originSelectors = () => screen.root.findAllByType('SocialOriginSelect');

async function chooseOrigin(value = 'FOREIGN') {
  await act(async () => originSelectors()[0].props.onSelectOrigin(value));
}

test('a new Google member reuses the foreign form without putting credentials in navigation or storage', async () => {
  authApi.loginGoogle.mockResolvedValue(signupResponse);
  await renderScreen();
  await googleSignIn();

  expect(authApi.loginGoogle).toHaveBeenCalledWith(credential);
  expect(forms()).toHaveLength(0);
  expect(originSelectors()).toHaveLength(1);
  await chooseOrigin();
  expect(forms()).toHaveLength(1);
  expect(forms()[0].props.route.params).toEqual(
    expect.objectContaining({
      provider: 'GOOGLE',
      socialSignupToken: 'test-signup-session',
    }),
  );
  expect(JSON.stringify(forms()[0].props.route.params)).not.toContain(credential);
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
  expect(mockNavigation.reset).not.toHaveBeenCalled();
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(window.history.pushState).not.toHaveBeenCalled();
  expect(window.history.replaceState).not.toHaveBeenCalled();
  expect(storeWebSessionInfo).not.toHaveBeenCalled();
});

test('successful registration obtains a cookie session through a second Google login before returning', async () => {
  authApi.loginGoogle
    .mockResolvedValueOnce(signupResponse)
    .mockResolvedValueOnce(linkedResponse);
  await renderScreen();
  await googleSignIn();
  await chooseOrigin();
  const onRegistered = forms()[0].props.onRegistered;
  await act(async () => onRegistered());

  expect(forms()).toHaveLength(0);
  expect(authApi.loginGoogle.mock.calls).toEqual([[credential], [credential]]);
  expect(storeWebSessionInfo).toHaveBeenCalledWith(session, 'USER');
  expect(storeLastLoginProvider).toHaveBeenCalledWith('GOOGLE');
  expect(mockNavigation.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{name: 'MainTabs'}],
  });
  expect(storage.setItem).not.toHaveBeenCalled();
});

test('viewing and closing terms preserves the same signup form and Google session', async () => {
  authApi.loginGoogle.mockResolvedValue(signupResponse);
  await renderScreen();
  await googleSignIn();
  await chooseOrigin();
  const originalForm = forms()[0];

  await act(async () =>
    originalForm.props.onViewAgreement('TERMS_OF_SERVICE'),
  );
  const dialog = screen.root.findByType('KodaAgreementDialog');
  expect(dialog.props.id).toBe('TERMS_OF_SERVICE');
  expect(dialog.props.language).toBe('en');
  expect(forms()[0]).toBe(originalForm);

  await act(async () => dialog.props.onClose());
  expect(screen.root.findAllByType('KodaAgreementDialog')).toHaveLength(0);
  expect(forms()[0]).toBe(originalForm);
  expect(forms()[0].props.route.params.socialSignupToken).toBe(
    'test-signup-session',
  );
  expect(authApi.loginGoogle).toHaveBeenCalledTimes(1);
  expect(identity.initialize).toHaveBeenCalledTimes(1);
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
});

test('an existing Google member gets a web session without a signup form', async () => {
  authApi.loginGoogle.mockResolvedValue(linkedResponse);
  await renderScreen();
  await googleSignIn();

  expect(forms()).toHaveLength(0);
  expect(originSelectors()).toHaveLength(0);
  expect(authApi.loginGoogle).toHaveBeenCalledTimes(1);
  expect(storeWebSessionInfo).toHaveBeenCalledWith(session, 'USER');
  expect(mockNavigation.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{name: 'MainTabs'}],
  });
});

test('login failure after registration keeps signup complete and allows fresh Google login without resubmission', async () => {
  authApi.loginGoogle
    .mockResolvedValueOnce(signupResponse)
    .mockRejectedValueOnce(new Error('Session request failed'))
    .mockResolvedValueOnce(linkedResponse);
  await renderScreen();
  await googleSignIn();
  await chooseOrigin();
  const onRegistered = forms()[0].props.onRegistered;
  await act(async () => onRegistered());

  expect(forms()).toHaveLength(0);
  expect(mockNavigation.reset).not.toHaveBeenCalled();
  expect(storeWebSessionInfo).not.toHaveBeenCalled();
  expect(screen.root.findByType('h1').props.children).toBe('Your account is ready');
  expect(JSON.stringify(screen.toJSON())).toContain(
    'Log in with the Google account you used to register.',
  );
  expect(identity.renderButton.mock.calls.length).toBeGreaterThan(1);

  await googleSignIn('fresh-google-credential');
  expect(forms()).toHaveLength(0);
  expect(authApi.loginGoogle.mock.calls).toEqual([
    [credential],
    [credential],
    ['fresh-google-credential'],
  ]);
  expect(storeWebSessionInfo).toHaveBeenCalledWith(session, 'USER');
  expect(mockNavigation.reset).toHaveBeenCalledTimes(1);
});

test('registration is not offered again if post-registration authentication still reports a new account', async () => {
  authApi.loginGoogle
    .mockResolvedValueOnce(signupResponse)
    .mockRejectedValueOnce(new Error('Session request failed'))
    .mockResolvedValueOnce(signupResponse);
  await renderScreen();
  await googleSignIn();
  await chooseOrigin();
  const onRegistered = forms()[0].props.onRegistered;
  await act(async () => onRegistered());
  await googleSignIn('fresh-google-credential');

  expect(forms()).toHaveLength(0);
  expect(storeWebSessionInfo).not.toHaveBeenCalled();
  expect(mockNavigation.reset).not.toHaveBeenCalled();
  expect(screen.root.findAllByProps({role: 'alert'}).length).toBeGreaterThan(0);
});

test.each(['ko', 'en'])('new Google users explicitly choose their member type in %s', async language => {
  mockLanguage = language;
  authApi.loginGoogle.mockResolvedValue(signupResponse);
  await renderScreen();
  await googleSignIn();

  expect(originSelectors()).toHaveLength(1);
  expect(forms()).toHaveLength(0);
  expect(screen.root.findAllByType('PhoneCertificate')).toHaveLength(0);
  await chooseOrigin('UNKNOWN');
  expect(originSelectors()).toHaveLength(1);
  await chooseOrigin('DOMESTIC');
  expect(forms()).toHaveLength(0);
  const agreementScreen = screen.root.findByType('RegisterAgree');
  expect(agreementScreen.props.route.params).toMatchObject({
    provider: 'GOOGLE',
    isSocial: true,
    isForeign: false,
    socialSignupToken: 'test-signup-session',
  });

  mockLanguage = language === 'ko' ? 'en' : 'ko';
  await act(async () => screen.update(<KodaGoogleLogin />));
  expect(screen.root.findByType('RegisterAgree')).toBe(agreementScreen);
  expect(forms()).toHaveLength(0);
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  expect(storage.setItem).not.toHaveBeenCalled();
});

test.each(['PhoneCertificate', 'UserRegisterProfile'])(
  'domestic completion from %s obtains the web cookie session without putting signup details in the URL',
  async finalScreen => {
    authApi.loginGoogle.mockResolvedValueOnce(signupResponse).mockResolvedValueOnce(linkedResponse);
    await renderScreen();
    await googleSignIn();
    await chooseOrigin('DOMESTIC');
    const agreementScreen = screen.root.findByType('RegisterAgree');
    const params = {
      ...agreementScreen.props.route.params,
      agreements: [{agreementType: 'TERMS_OF_SERVICE', agreed: true}],
    };
    await act(async () => agreementScreen.props.navigation.navigate('PhoneCertificate', params));
    expect(screen.root.findAllByType('UserRegisterProfile')).toHaveLength(0);
    const phoneScreen = screen.root.findByType('PhoneCertificate');
    expect(phoneScreen.props.route.params).toEqual(params);
    expect(forms()).toHaveLength(0);
    if (finalScreen === 'UserRegisterProfile') {
      await act(async () => phoneScreen.props.navigation.navigate('UserRegisterProfile', {
        prevData: {...params, phoneNum: '01012345678'},
      }));
    }
    await act(async () => screen.root.findByType(finalScreen).props.onRegistered({accessToken: 'native-token'}));

    expect(authApi.loginGoogle.mock.calls).toEqual([[credential], [credential]]);
    expect(storeWebSessionInfo).toHaveBeenCalledWith(session, 'USER');
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
    expect(mockNavigation.replace).not.toHaveBeenCalled();
    expect(mockNavigation.reset).toHaveBeenCalledWith({index: 0, routes: [{name: 'MainTabs'}]});
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
  },
);

test('domestic terms open in a dialog without unmounting the agreement screen or losing signup state', async () => {
  authApi.loginGoogle.mockResolvedValue(signupResponse);
  await renderScreen();
  await googleSignIn();
  await chooseOrigin('DOMESTIC');
  const agreementScreen = screen.root.findByType('RegisterAgree');
  await act(async () => agreementScreen.props.navigation.navigate('AgreeDetail', {id: 'PRIVACY_POLICY'}));
  const dialog = screen.root.findByType('KodaAgreementDialog');
  expect(dialog.props.id).toBe('PRIVACY_POLICY');
  expect(screen.root.findByType('RegisterAgree')).toBe(agreementScreen);
  await act(async () => dialog.props.onClose());
  expect(screen.root.findByType('RegisterAgree')).toBe(agreementScreen);
  expect(authApi.loginGoogle).toHaveBeenCalledTimes(1);
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
});

test.each([{}, {status: 'REJECTED'}, {status: 'SOCIAL_ACCOUNT_NOT_LINKED'}])(
  'an invalid authentication response never opens signup or marks a user logged in: %j',
  async data => {
    authApi.loginGoogle.mockResolvedValue({data});
    await renderScreen();
    await googleSignIn();

    expect(forms()).toHaveLength(0);
    expect(storeWebSessionInfo).not.toHaveBeenCalled();
    expect(mockNavigation.reset).not.toHaveBeenCalled();
    expect(screen.root.findAllByProps({role: 'alert'}).length).toBeGreaterThan(0);
  },
);

test('missing Google client configuration gives an error without calling Google or the backend', async () => {
  global.__TRIO_ENV__ = {};
  await renderScreen();

  expect(identity.initialize).not.toHaveBeenCalled();
  expect(identity.renderButton).not.toHaveBeenCalled();
  expect(authApi.loginGoogle).not.toHaveBeenCalled();
  expect(document.createElement).not.toHaveBeenCalled();
  expect(forms()).toHaveLength(0);
  expect(screen.root.findAllByProps({role: 'alert'}).length).toBeGreaterThan(0);
});
