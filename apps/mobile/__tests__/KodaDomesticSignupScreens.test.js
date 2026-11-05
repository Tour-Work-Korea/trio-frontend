import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Platform, Text, TextInput, TouchableOpacity} from 'react-native';
import authApi from '@utils/api/authApi';
import {storeLoginTokens, storeWebSessionInfo} from '@utils/auth/login';
import RegisterAgree from '@screens/(Common)/Register/RegisterAgree';
import PhoneCertificate from '@screens/(Common)/Register/PhoneCertificate';
import UserRegisterProfile from '@screens/(User)/UserRegister/UserRegisterProfile';

const mockTranslate = key => key;
const mockNavigation = {navigate: jest.fn(), dispatch: jest.fn()};
let mockRoute;
jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: mockTranslate}),
}));
jest.mock('@trio/app/src/i18n', () => ({t: key => key}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useFocusEffect: effect => require('react').useEffect(effect, [effect]),
  CommonActions: {reset: payload => ({type: 'RESET', payload})},
}));
jest.mock('@utils/api/authApi', () => ({
  completeSocialSignUp: jest.fn(),
  completeForeignSocialSignUp: jest.fn(),
  sendSocialSignUpSms: jest.fn(),
  verifySocialSignUpSms: jest.fn(),
  checkNickname: jest.fn(),
}));
jest.mock('@utils/auth/login', () => ({
  storeLoginTokens: jest.fn(),
  storeWebSessionInfo: jest.fn(),
  tryLogin: jest.fn(),
}));
jest.mock('@utils/auth/lastLoginProvider', () => ({
  storeLastLoginProvider: jest.fn(),
}));
jest.mock('@hooks/useKeyboardAwareScrollView', () => () => ({
  scrollRef: {current: null},
  contentContainerStyle: {},
  registerInput: () => ({}),
}));
jest.mock('@components/modals/AlertModal', () => 'AlertModal');
jest.mock('@components/ButtonWhite', () => 'ButtonWhite');
jest.mock('@components/ButtonScarlet', () => 'ButtonScarlet');
jest.mock('@components/ButtonScarletLogo', () => 'ButtonScarletLogo');

const originalPlatform = Platform.OS;
const signupParams = {
  user: 'USER',
  isSocial: true,
  isForeign: false,
  provider: 'GOOGLE',
  socialSignupToken: 'google-signup-session',
  socialProfile: {name: 'Min Kim', birthday: '1995-05-12', gender: 'F'},
};
const agreements = [{agreementType: 'TERMS_OF_SERVICE', agreed: true}];
const phoneNum = '01012345678';
const tokens = {accessToken: 'access', refreshToken: 'refresh'};
const profileRoute = {
  params: {
    prevData: {
      userRole: 'USER',
      isSocial: true,
      provider: 'GOOGLE',
      socialSignupToken: signupParams.socialSignupToken,
      phoneNum,
      agreements,
      ...signupParams.socialProfile,
    },
  },
};
let screen;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  Platform.OS = 'ios';
  mockRoute = profileRoute;
  authApi.sendSocialSignUpSms.mockReset().mockResolvedValue({
    data: {status: 'NEW_USER_SIGNUP_REQUIRED', smsPurpose: 'SIGN_UP'},
  });
  authApi.verifySocialSignUpSms.mockReset().mockResolvedValue({
    data: {verified: true, status: 'NEW_USER_SIGNUP_REQUIRED'},
  });
  authApi.completeSocialSignUp.mockReset().mockResolvedValue({data: tokens});
});

afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  screen = undefined;
  jest.clearAllTimers();
  jest.useRealTimers();
  Platform.OS = originalPlatform;
});

async function mount(element) {
  await act(async () => { screen = Renderer.create(element); });
}

async function pressText(label) {
  const button = screen.root.findAllByType(TouchableOpacity).find(node =>
    node.findAllByType(Text).some(text => text.props.children === label),
  );
  expect(button).toBeDefined();
  await act(async () => button.props.onPress());
}

async function submitSms() {
  const inputs = () => screen.root.findAllByType(TextInput);
  await act(async () => inputs()[0].props.onChangeText(phoneNum));
  await pressText('common.authenticationRequest');
  await act(async () => screen.root.findByType('AlertModal').props.onPress());
  await act(async () => inputs()[1].props.onChangeText('123456'));
  const verify = screen.root.findAllByType('ButtonWhite').find(node =>
    node.props.title === 'common.verify',
  );
  expect(verify.props.disabled).not.toBe(true);
  await act(async () => verify.props.onPress());
  await act(async () => jest.advanceTimersByTime(850));
}

test.each([false, true])(
  'domestic agreements keep phone verification and route through the supplied navigator when managed=%s',
  async managed => {
    const navigation = {navigate: jest.fn()};
    await mount(<RegisterAgree
      route={{params: signupParams}}
      {...(managed ? {navigation} : {})}
    />);
    expect(screen.root.findByType('ButtonWhite').props.disabled).toBe(true);
    await pressText('common.view');
    const target = managed ? navigation : mockNavigation;
    expect(target.navigate).toHaveBeenCalledWith('AgreeDetail', {
      id: 'TERMS_OF_SERVICE', who: 'USER',
    });
    await act(async () =>
      screen.root.findAllByType(TouchableOpacity)[0].props.onPress(),
    );
    const next = screen.root.findByType('ButtonWhite');
    expect(next.props.disabled).not.toBe(true);
    await act(async () => next.props.onPress());
    expect(target.navigate).toHaveBeenLastCalledWith('PhoneCertificate',
      expect.objectContaining({
        provider: 'GOOGLE',
        socialSignupToken: signupParams.socialSignupToken,
        isSocial: true,
        agreements: expect.arrayContaining([
          {agreementType: 'TERMS_OF_SERVICE', agreed: true},
        ]),
      }),
    );
    if (managed) {
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    }
  },
);

test.each(['rejected code', 'unverified response'])(
  '%s cannot advance domestic registration or call signup completion',
  async failure => {
    const navigation = {navigate: jest.fn()};
    const onRegistered = jest.fn();
    if (failure === 'rejected code') {
      authApi.verifySocialSignUpSms.mockRejectedValueOnce(new Error('Invalid code'));
    } else {
      authApi.verifySocialSignUpSms.mockResolvedValueOnce({data: {verified: false}});
    }
    await mount(<PhoneCertificate
      route={{params: {...signupParams, agreements}}}
      navigation={navigation}
      onRegistered={onRegistered}
    />);
    await submitSms();
    expect(authApi.verifySocialSignUpSms).toHaveBeenCalledWith({
      socialSignupToken: signupParams.socialSignupToken,
      phoneNum, code: '123456',
    });
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(authApi.completeSocialSignUp).not.toHaveBeenCalled();
    expect(onRegistered).not.toHaveBeenCalled();
    expect(storeLoginTokens).not.toHaveBeenCalled();
    expect(storeWebSessionInfo).not.toHaveBeenCalled();
  },
);

test('verified SMS with an incomplete Google profile stays inside the managed profile flow', async () => {
  const navigation = {navigate: jest.fn()};
  await mount(<PhoneCertificate
    route={{params: {...signupParams, agreements, socialProfile: {}}}}
    navigation={navigation}
  />);
  await submitSms();
  expect(navigation.navigate).toHaveBeenCalledWith('UserRegisterProfile', {
    prevData: expect.objectContaining({
      phoneNum, provider: 'GOOGLE',
      socialSignupToken: signupParams.socialSignupToken,
      agreements, isSocial: true,
    }),
  });
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  expect(authApi.completeSocialSignUp).not.toHaveBeenCalled();
});

test.each([false, true])(
  'successful SMS signup delegates completion only when managed=%s',
  async managed => {
    const onRegistered = jest.fn().mockResolvedValue(undefined);
    const navigation = {navigate: jest.fn()};
    if (managed) {
      Platform.OS = 'web';
      authApi.completeSocialSignUp.mockResolvedValueOnce({data: {registered: true}});
    }
    await mount(<PhoneCertificate
      route={{params: {...signupParams, agreements}}}
      {...(managed ? {navigation, onRegistered} : {})}
    />);
    await submitSms();
    expect(authApi.completeSocialSignUp).toHaveBeenCalledWith(expect.objectContaining({
      phoneNum, provider: 'GOOGLE', agreements,
      socialSignupToken: signupParams.socialSignupToken,
    }));
    if (managed) {
      expect(onRegistered).toHaveBeenCalledWith({registered: true});
      expect(storeLoginTokens).not.toHaveBeenCalled();
      expect(storeWebSessionInfo).not.toHaveBeenCalled();
      expect(mockNavigation.dispatch).not.toHaveBeenCalled();
    } else {
      expect(storeLoginTokens).toHaveBeenCalledWith({...tokens, userRole: 'USER'});
      expect(mockNavigation.dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'RESET'}));
    }
  },
);

test.each([false, true])(
  'domestic profile completion uses hook fallbacks or managed route/callback when managed=%s',
  async managed => {
    const onRegistered = jest.fn().mockResolvedValue(undefined);
    const navigation = {navigate: jest.fn()};
    if (managed) {
      mockRoute = {params: {prevData: {}}};
      authApi.completeSocialSignUp.mockResolvedValueOnce({data: {registered: true}});
    }
    await mount(<UserRegisterProfile
      {...(managed ? {route: profileRoute, navigation, onRegistered} : {})}
    />);
    const submit = screen.root.findByType('ButtonScarlet');
    expect(submit.props.disabled).toBe(false);
    await act(async () => submit.props.onPress());
    expect(authApi.completeSocialSignUp).toHaveBeenCalledWith({
      provider: 'GOOGLE', socialSignupToken: signupParams.socialSignupToken,
      userRole: 'USER', phoneNum, agreements, ...signupParams.socialProfile,
    });
    expect(authApi.completeForeignSocialSignUp).not.toHaveBeenCalled();
    if (managed) {
      expect(onRegistered).toHaveBeenCalledWith({registered: true});
      expect(storeLoginTokens).not.toHaveBeenCalled();
      expect(mockNavigation.dispatch).not.toHaveBeenCalled();
    } else {
      expect(storeLoginTokens).toHaveBeenCalledWith({...tokens, userRole: 'USER'});
      expect(mockNavigation.dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'RESET'}));
    }
  },
);

test('profile signup blocks repeated presses until both signup and login completion finish', async () => {
  let finishSignup;
  let finishLogin;
  authApi.completeSocialSignUp.mockImplementationOnce(() => new Promise(resolve => {
    finishSignup = resolve;
  }));
  const onRegistered = jest.fn(() => new Promise(resolve => {
    finishLogin = resolve;
  }));
  await mount(<UserRegisterProfile route={profileRoute} onRegistered={onRegistered} />);
  const press = screen.root.findByType('ButtonScarlet').props.onPress;
  let request;
  await act(async () => {
    request = press();
    await press();
  });
  expect(authApi.completeSocialSignUp).toHaveBeenCalledTimes(1);
  expect(screen.root.findByType('ButtonScarlet').props.disabled).toBe(true);

  await act(async () => finishSignup({data: tokens}));
  await act(async () => press());
  expect(onRegistered).toHaveBeenCalledTimes(1);
  expect(authApi.completeSocialSignUp).toHaveBeenCalledTimes(1);
  expect(screen.root.findByType('ButtonScarlet').props.disabled).toBe(true);
  await act(async () => {
    finishLogin();
    await request;
  });
});

test('profile signup can be retried after a failed request', async () => {
  authApi.completeSocialSignUp.mockRejectedValueOnce(new Error('Network unavailable'));
  const onRegistered = jest.fn().mockResolvedValue(undefined);
  await mount(<UserRegisterProfile route={profileRoute} onRegistered={onRegistered} />);
  await act(async () => screen.root.findByType('ButtonScarlet').props.onPress());
  expect(onRegistered).not.toHaveBeenCalled();
  expect(screen.root.findByType('ButtonScarlet').props.disabled).toBe(false);
  await act(async () => screen.root.findByType('ButtonScarlet').props.onPress());
  expect(authApi.completeSocialSignUp).toHaveBeenCalledTimes(2);
  expect(onRegistered).toHaveBeenCalledTimes(1);
});

test('linking an existing phone account completes only after FIND_ACCOUNT SMS verification', async () => {
  const onRegistered = jest.fn().mockResolvedValue(undefined);
  const navigation = {navigate: jest.fn()};
  authApi.sendSocialSignUpSms.mockResolvedValueOnce({
    data: {status: 'EXISTING_USER_LINK_REQUIRED', smsPurpose: 'FIND_ACCOUNT'},
  });
  authApi.verifySocialSignUpSms.mockResolvedValueOnce({
    data: {verified: true, status: 'EXISTING_USER_LINK_REQUIRED', smsPurpose: 'FIND_ACCOUNT'},
  });
  await mount(<PhoneCertificate
    route={{params: {...signupParams, agreements}}}
    navigation={navigation}
    onRegistered={onRegistered}
  />);
  expect(authApi.completeSocialSignUp).not.toHaveBeenCalled();
  await submitSms();
  expect(authApi.completeSocialSignUp).toHaveBeenCalledTimes(1);
  expect(onRegistered).toHaveBeenCalledWith(tokens);
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(mockNavigation.dispatch).not.toHaveBeenCalled();
});
