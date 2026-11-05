import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Text, TextInput, TouchableOpacity} from 'react-native';
import i18n from '@trio/app/src/i18n';
import authApi from '@utils/api/authApi';
import {storeLoginTokens} from '@utils/auth/login';
import ForeignRegisterProfile from '@screens/(Common)/Register/ForeignRegisterProfile';

const mockNavigation = {navigate: jest.fn(), replace: jest.fn()};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('@utils/api/authApi', () => ({
  checkNickname: jest.fn(),
  completeForeignSocialSignUp: jest.fn(),
}));
jest.mock('@utils/auth/login', () => ({storeLoginTokens: jest.fn()}));
jest.mock('@utils/auth/lastLoginProvider', () => ({
  storeLastLoginProvider: jest.fn(),
}));
jest.mock('@components/modals/AlertModal', () => 'AlertModal');
jest.mock('@components/ButtonScarlet', () => 'ButtonScarlet');

let screen;
const inputs = () => screen.root.findAllByType(TextInput);
const submit = () => screen.root.findByType('ButtonScarlet');
const pressLabel = async label => {
  const button = screen.root.findAllByType(TouchableOpacity).find(node =>
    node.findAllByType(Text).some(text =>
      [text.props.children].flat().join('') === label,
    ),
  );
  expect(button).toBeDefined();
  await act(async () => button.props.onPress());
};
const mount = async (language, props = {}) => {
  await i18n.changeLanguage(language);
  await act(async () => {
    screen = Renderer.create(
      <ForeignRegisterProfile
        route={{params: {provider: 'GOOGLE', socialSignupToken: 'signup-session'}}}
        {...props}
      />,
    );
  });
};
const fillProfile = async () => {
  await act(async () => {
    inputs()[0].props.onChangeText(' Alex Kim ');
    inputs()[1].props.onChangeText('alex2026');
    inputs()[2].props.onChangeText('19950512');
    inputs()[3].props.onChangeText('u1s');
  });
  await pressLabel(i18n.t('auth.female'));
  await pressLabel(i18n.t('language.english'));
};
const acceptRequiredAgreements = async () => {
  for (const key of [
    'auth.iAgreeToTheTermsOfService',
    'auth.iConfirmThatIAmAtLeast14YearsOld',
    'auth.iAgreeToThePrivacyPolicy',
  ]) {
    await pressLabel(`${i18n.t(key)} *`);
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  authApi.checkNickname.mockResolvedValue({data: 'Available'});
  authApi.completeForeignSocialSignUp.mockResolvedValue({
    data: {accessToken: 'access', refreshToken: 'refresh'},
  });
});
afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  screen = null;
});

test.each(['ko', 'en'])(
  '%s profile inputs produce a foreign Google signup without a phone or password',
  async language => {
    await mount(language);
    expect(submit().props.disabled).toBe(true);
    await fillProfile();
    expect(inputs().map(input => input.props.value)).toEqual([
      ' Alex Kim ',
      'alex2026',
      '1995-05-12',
      'US',
    ]);
    expect(inputs()[3].props.autoCapitalize).toBe('characters');
    expect(submit().props.disabled).toBe(true);
    await acceptRequiredAgreements();
    expect(submit().props.disabled).toBe(false);
    await act(async () => submit().props.onPress());

    expect(authApi.checkNickname).toHaveBeenCalledWith('alex2026');
    expect(authApi.completeForeignSocialSignUp).toHaveBeenCalledWith({
      provider: 'GOOGLE',
      socialSignupToken: 'signup-session',
      userRole: 'USER',
      name: 'Alex Kim',
      nickname: 'alex2026',
      birthday: '1995-05-12',
      gender: 'F',
      nationalityCountryCode: 'US',
      preferredLanguage: 'EN',
      agreements: [
        {agreementType: 'TERMS_OF_SERVICE', agreed: true},
        {agreementType: 'AGE_OVER_14_CONFIRMATION', agreed: true},
        {agreementType: 'PRIVACY_POLICY', agreed: true},
        {agreementType: 'LOCATION_BASED_SERVICE', agreed: false},
        {agreementType: 'MARKETING_NOTIFICATION', agreed: false},
      ],
    });
    expect(storeLoginTokens).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
      userRole: 'USER',
    });
    expect(mockNavigation.replace).toHaveBeenCalledWith(
      'ForeignSignupComplete',
      {
        name: 'Alex Kim',
        nickname: 'alex2026',
        nationalityCountryCode: 'US',
        preferredLanguage: 'EN',
      },
    );
  },
);

test('a changed nickname is checked again and duplicate nicknames cannot finish signup', async () => {
  await mount('en');
  await fillProfile();
  await acceptRequiredAgreements();
  await pressLabel(i18n.t('common.confirm_468266'));
  expect(authApi.checkNickname).toHaveBeenCalledWith('alex2026');

  await act(async () => inputs()[1].props.onChangeText('takenname'));
  authApi.checkNickname.mockRejectedValueOnce({
    response: {data: {message: 'Nickname is already in use'}},
  });
  await act(async () => submit().props.onPress());

  expect(authApi.checkNickname).toHaveBeenLastCalledWith('takenname');
  expect(authApi.completeForeignSocialSignUp).not.toHaveBeenCalled();
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
  expect(JSON.stringify(screen.toJSON())).toContain('Nickname is already in use');
});

test('a web host can finish registration without native token storage or navigation', async () => {
  const onRegistered = jest.fn().mockResolvedValue(undefined);
  const data = {registered: true};
  authApi.completeForeignSocialSignUp.mockResolvedValueOnce({data});
  await mount('en', {onRegistered});
  await fillProfile();
  await acceptRequiredAgreements();
  await act(async () => submit().props.onPress());

  expect(authApi.completeForeignSocialSignUp).toHaveBeenCalledTimes(1);
  expect(onRegistered).toHaveBeenCalledWith(data);
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(mockNavigation.replace).not.toHaveBeenCalled();
  expect(screen.root.findByType('AlertModal').props.visible).toBe(false);
});

test('a web host can show terms without navigating away from entered profile values', async () => {
  const onViewAgreement = jest.fn();
  await mount('en', {onViewAgreement});
  await fillProfile();
  await pressLabel(i18n.t('auth.view'));

  expect(onViewAgreement).toHaveBeenCalledWith('TERMS_OF_SERVICE');
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  expect(inputs().map(input => input.props.value)).toEqual([
    ' Alex Kim ',
    'alex2026',
    '1995-05-12',
    'US',
  ]);
});

test('native terms retain the existing agreement detail navigation', async () => {
  await mount('ko');
  await pressLabel(i18n.t('auth.view'));

  expect(mockNavigation.navigate).toHaveBeenCalledWith('AgreeDetail', {
    id: 'TERMS_OF_SERVICE',
    who: 'USER',
  });
});
