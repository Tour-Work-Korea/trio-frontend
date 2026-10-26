import {useTranslation} from 'react-i18next';
import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {validateRegisterProfile} from '@utils/validation/registerValidation';
import AlertModal from '@components/modals/AlertModal';
import {storeLoginTokens, tryLogin} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import styles from './UserRegisterProfile.styles';
import Logo from '@assets/images/logo_orange.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const normalizeRegisterProfileData = data => ({
  ...data,
  nickname: data?.nickname || '',
  password: data?.password || '',
  passwordConfirm: data?.passwordConfirm || '',
  name: data?.name || '',
  birthday: data?.birthday || '',
  gender: data?.gender || '',
  agreements: data?.agreements || [],
  nationalityCountryCode: data?.nationalityCountryCode || '',
  preferredLanguage: data?.preferredLanguage || '',
});

const UserRegisterProfile = () => {
  const {t} = useTranslation();
  const route = useRoute();
  const {prevData} = route.params;
  const normalizedPrevData = useMemo(
    () => normalizeRegisterProfileData(prevData),
    [prevData],
  );
  const navigation = useNavigation();
  const [formData, setFormData] = useState(normalizedPrevData);
  const isSocialSignUp = !!formData?.isSocial;
  const isForeignSignUp = isSocialSignUp && !!formData?.isForeign;
  const [formValid, setFormValid] = useState(() =>
    validateRegisterProfile(normalizedPrevData),
  );
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameDuplicated, setISNicknameDuplicated] = useState(true);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    onPress: '',
  });

  const [pendingAfterLogin, setPendingAfterLogin] = useState(false);
  const [isIntegrationNoticeShown, setIsIntegrationNoticeShown] =
    useState(false);
  const {
    scrollRef,
    contentContainerStyle: keyboardAwareContentStyle,
    registerInput,
  } = useKeyboardAwareScrollView({
    basePaddingBottom: 32,
    extraScrollOffset: 80,
  });
  const nicknameField = registerInput('nickname');
  const passwordField = registerInput('password');
  const passwordConfirmField = registerInput('passwordConfirm');
  const nameField = registerInput('name');
  const birthdayField = registerInput('birthday');

  useEffect(() => {
    if (pendingAfterLogin) {
      afterSuccessRegister();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAfterLogin]);

  useFocusEffect(
    useCallback(() => {
      setFormData(normalizedPrevData);
      setFormValid(validateRegisterProfile(normalizedPrevData));
      setIsNicknameChecked(false);
      setISNicknameDuplicated(true);
      setNicknameCheckMessage('');
      setIsPasswordVisible(false);
      setIsPasswordCheckVisible(false);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
        onPress: '',
      });
      setPendingAfterLogin(false);
      setIsIntegrationNoticeShown(false);
    }, [normalizedPrevData]),
  );

  const handleNicknameChange = text => {
    updateField('nickname', text);
    setIsNicknameChecked(false);
    setNicknameCheckMessage('');
    const nextValid = {
      ...formValid,
      nickname: validateRegisterProfile({...formData, nickname: text}).nickname,
    };
    setFormValid(nextValid);
  };

  const handleNameChange = text => {
    updateField('name', text);
  };

  const handleBirthdayChange = text => {
    const filtered = text.replace(/[^0-9]/g, '').slice(0, 8);
    const formatted = filtered
      .replace(/^(\d{4})(\d)/, '$1-$2')
      .replace(/^(\d{4}-\d{2})(\d)/, '$1-$2');
    updateField('birthday', formatted);
  };

  const handleGenderChange = gender => {
    updateField('gender', gender);
  };

  const handlePasswordChange = text => {
    updateField('password', text);
    const nextValid = {
      ...formValid,
      password: validateRegisterProfile({...formData, password: text}).password,
      passwordConfirm: {
        isMatched: text === formData.passwordConfirm,
      },
    };
    setFormValid(nextValid);
  };

  const handlePasswordConfirmChange = text => {
    updateField('passwordConfirm', text);
    setFormValid(prev => ({
      ...prev,
      passwordConfirm: {
        isMatched: text === formData.password,
      },
    }));
  };

  const updateField = (key, value) => {
    const updated = {...formData, [key]: value};
    setFormData(updated);
    setFormValid(validateRegisterProfile(updated));
  };

  const checkNicknameDuplicate = async () => {
    try {
      const response = await authApi.checkNickname(formData.nickname);
      setIsNicknameChecked(true);
      setISNicknameDuplicated(false);
      setNicknameCheckMessage(response?.data || t('auth.availableNicknames'));
    } catch (error) {
      setIsNicknameChecked(true);
      setISNicknameDuplicated(true);
      setNicknameCheckMessage(
        error.response?.data?.message ||
          t('auth.thisNicknameAlreadyExistsPleaseEnterADifferentNickname'),
      );
    }
  };

  const isFormValid = () => {
    const nameValid = !!formData.name?.trim();
    const birthdayValid = /^\d{4}-\d{2}-\d{2}$/.test(formData.birthday || '');
    const genderValid = formData.gender === 'M' || formData.gender === 'F';
    const nicknameValid =
      formValid.nickname?.hasNoSpecialChars &&
      formValid.nickname?.isLengthValid &&
      isNicknameChecked &&
      !isNicknameDuplicated;

    const passwordValid =
      formValid.password?.hasUpperLowercase &&
      formValid.password?.hasNumber &&
      formValid.password?.isLengthValid &&
      formValid.password?.hasSpecialChar;

    const confirmValid = formValid.passwordConfirm?.isMatched;

    if (isForeignSignUp) {
      const nationalityValid = /^[A-Z]{2}$/.test(
        formData.nationalityCountryCode || '',
      );
      const languageValid = ['KO', 'EN', 'JA', 'ZH'].includes(
        formData.preferredLanguage,
      );
      return (
        nameValid &&
        birthdayValid &&
        genderValid &&
        nicknameValid &&
        nationalityValid &&
        languageValid
      );
    }

    if (isSocialSignUp) {
      return nameValid && birthdayValid && genderValid;
    }

    return (
      nameValid &&
      birthdayValid &&
      genderValid &&
      nicknameValid &&
      passwordValid &&
      confirmValid
    );
  };

  const handleSubmit = async () => {
    try {
      if (isSocialSignUp) {
        const payload = {
          provider: formData.provider,
          socialSignupToken: formData.socialSignupToken,
          userRole: formData.userRole,
          name: formData.name,
          birthday: formData.birthday,
          gender: formData.gender,
          agreements: formData.agreements,
        };

        if (isForeignSignUp) {
          payload.nickname = formData.nickname;
          payload.nationalityCountryCode = formData.nationalityCountryCode;
          payload.preferredLanguage = formData.preferredLanguage;
        } else {
          payload.phoneNum = formData.phoneNum;
        }

        const res = isForeignSignUp
          ? await authApi.completeForeignSocialSignUp(payload)
          : await authApi.completeSocialSignUp(payload);
        const {accessToken, refreshToken} = res.data || {};

        if (!accessToken || !refreshToken) {
          throw new Error(t('common.theSocialSignupTokenResponseIsEmpty'));
        }

        await storeLoginTokens({
          accessToken,
          refreshToken,
          userRole: 'USER',
        });
        await storeLastLoginProvider(formData.provider);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'MainTabs', params: {screen: '홈'}}],
          }),
        );
        return;
      }

      const payload = {
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        nickname: formData.nickname,
        name: formData.name.trim(),
        birthday: formData.birthday,
        gender: formData.gender,
        userRole: formData.userRole,
        phoneNum: formData.phoneNum,
        agreements: formData.agreements,
      };

      /**
       * 기존 NICE 기반 가입 완료:
       * - niceAuthToken을 /auth/user/signup/complete로 전달
       *
       * 새 일반 USER 가입:
       * - PhoneCertificate에서 SMS USER + SIGN_UP 인증 완료
       * - phoneNum을 /auth/user/signup으로 전달
       */
      await authApi.userSignUp(payload);
      afterSuccessRegister();
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error.response?.data?.message ||
          t('common.anErrorOccurredPleaseTryAgain'),

        buttonText: t('common.confirm'),
        onPress: '',
      });
    }
  };

  const afterSuccessRegister = async () => {
    // 소셜 로그인 연동 안내
    if (formData?.isIntegration && !isIntegrationNoticeShown) {
      setIsIntegrationNoticeShown(true);

      const platforms =
        (formData?.socialTypes || []).join(', ') || t('common.social');
      setErrorModal({
        visible: true,
        message: t(
          'auth.linkMemberInformationWithAnAlreadyExistingAccountLinkedPlatform',
          {platforms: platforms},
        ),
        buttonText: t('common.confirm'),
        onPress: 'integrationConfirm',
      });

      return;
    }
    if (formData?.isIntegration && !pendingAfterLogin) {
      return;
    }

    // 자동 로그인
    const isSuccessLogin = await tryLogin(
      formData.email,
      formData.password,
      'USER',
    );

    if (isSuccessLogin) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'MainTabs', params: {screen: '홈'}}],
        }),
      );
    } else {
      setErrorModal({
        visible: true,
        message: t('auth.automaticLoginFailedGoToLoginPage'),
        buttonText: t('common.confirm'),
        onPress: 'moveToLogin',
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={[styles.viewFlexBox]}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardAwareContentStyle,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled">
          {/* 상단+입력창 */}
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <Logo width={60} height={29} />
              <View>
                <Text style={[styles.titleText]}>
                  {isForeignSignUp
                    ? t('auth.completeProfile')
                    : t('auth.forActivityInDdakji')}
                </Text>
                <Text style={[styles.titleText]}>
                  {isForeignSignUp
                    ? t('auth.pleaseEnterRequiredInformation')
                    : t('auth.pleaseProvideEssentialInformation')}
                </Text>
                {isForeignSignUp && (
                  <Text style={styles.titleDescription}>
                    {t('auth.completeProfileDescription')}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer} onLayout={nameField.onLayout}>
                <Text style={styles.inputLabel}>
                  {isForeignSignUp ? t('auth.nameFullName') : t('common.name')}
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('auth.pleaseEnterYourName')}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={formData.name}
                    onChangeText={handleNameChange}
                    onFocus={nameField.onFocus}
                    maxLength={20}
                  />
                </View>
              </View>

              <View
                style={styles.inputContainer}
                onLayout={birthdayField.onLayout}>
                <Text style={styles.inputLabel}>
                  {isForeignSignUp
                    ? t('auth.dateOfBirth_af774c')
                    : t('common.dateOfBirth')}
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={formData.birthday}
                    onChangeText={handleBirthdayChange}
                    onFocus={birthdayField.onFocus}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {(!isSocialSignUp || isForeignSignUp) && (
                <View
                  style={styles.inputContainer}
                  onLayout={nicknameField.onLayout}>
                  <Text style={styles.inputLabel}>
                    {isForeignSignUp
                      ? t('auth.nicknameNickname')
                      : t('common.nickname')}
                  </Text>
                  <View style={[styles.inputBox, styles.inputRelative]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('common.pleaseEnterYourNickname')}
                      placeholderTextColor={COLORS.grayscale_400}
                      value={formData.nickname}
                      onChangeText={handleNicknameChange}
                      onFocus={nicknameField.onFocus}
                      maxLength={10}
                    />

                    <TouchableOpacity
                      activeOpacity={1}
                      disabled={
                        !formValid.nickname?.hasNoSpecialChars ||
                        !formValid.nickname?.isLengthValid
                      }
                      style={[
                        styles.inputButtonAbsolute,
                        {
                          backgroundColor:
                            formValid.nickname?.hasNoSpecialChars &&
                            formValid.nickname?.isLengthValid
                              ? COLORS.primary_orange
                              : COLORS.grayscale_200,
                        },
                      ]}
                      onPress={checkNicknameDuplicate}>
                      <Text
                        style={{
                          ...FONTS.fs_14_medium,
                          color:
                            formValid.nickname?.hasNoSpecialChars &&
                            formValid.nickname?.isLengthValid
                              ? COLORS.grayscale_0
                              : COLORS.grayscale_400,
                        }}>
                        {t('auth.duplicateCheck')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {isNicknameChecked ? (
                    <View style={styles.validBox}>
                      <Text
                        style={[
                          styles.validDefaultText,
                          !isNicknameDuplicated
                            ? styles.validText
                            : styles.invalidText,
                        ]}>
                        {nicknameCheckMessage}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.validBox}>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.nickname?.hasNoSpecialChars
                            ? styles.validText
                            : '',
                        ]}>
                        {t('auth.excludingSpecialCharacters')}
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.nickname?.isLengthValid
                            ? styles.validText
                            : '',
                        ]}>
                        {t('auth.around210Characters')}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {isForeignSignUp && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('auth.nationality')}
                    </Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('auth.2LetterCountryCodeEGUsJp')}
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.nationalityCountryCode}
                        onChangeText={text =>
                          updateField(
                            'nationalityCountryCode',
                            text
                              .replace(/[^a-zA-Z]/g, '')
                              .toUpperCase()
                              .slice(0, 2),
                          )
                        }
                        autoCapitalize="characters"
                        maxLength={2}
                      />
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('auth.preferredLanguage_3e0de9')}
                    </Text>
                    <View style={styles.languageGroup}>
                      {[
                        ['KO', t('language.korean_6e081b')],
                        ['EN', 'English'],
                        ['JA', '日本語'],
                        ['ZH', '中文'],
                      ].map(([value, label]) => (
                        <TouchableOpacity
                          key={value}
                          style={[
                            styles.languageButton,
                            formData.preferredLanguage === value &&
                              styles.languageButtonActive,
                          ]}
                          onPress={() =>
                            updateField('preferredLanguage', value)
                          }>
                          <Text
                            style={[
                              styles.languageButtonText,
                              formData.preferredLanguage === value &&
                                styles.languageButtonTextActive,
                            ]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
              {!isSocialSignUp && (
                <>
                  <View
                    style={styles.inputContainer}
                    onLayout={passwordField.onLayout}>
                    <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('common.pleaseEnterYourPassword')}
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.password}
                        onChangeText={handlePasswordChange}
                        onFocus={passwordField.onFocus}
                        maxLength={20}
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize="none"
                      />

                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setIsPasswordVisible(prev => !prev)}>
                        {isPasswordVisible ? (
                          <HidePassword width={24} hide={24} />
                        ) : (
                          <ShowPassword width={24} hide={24} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.validBox}>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasUpperLowercase
                            ? styles.validText
                            : '',
                        ]}>
                        {t('common.includesUppercaseAndLowercaseLetters')}
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasNumber ? styles.validText : '',
                        ]}>
                        {t('common.containsNumbers')}
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasSpecialChar
                            ? styles.validText
                            : '',
                        ]}>
                        {t('common.containsSpecialCharacters')}
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.isLengthValid
                            ? styles.validText
                            : '',
                        ]}>
                        {t('common.820CharactersOrLess')}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={styles.inputContainer}
                    onLayout={passwordConfirmField.onLayout}>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('common.pleaseEnterAgain')}
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.passwordConfirm}
                        onChangeText={handlePasswordConfirmChange}
                        onFocus={passwordConfirmField.onFocus}
                        maxLength={20}
                        secureTextEntry={!isPasswordCheckVisible}
                      />

                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() =>
                          setIsPasswordCheckVisible(prev => !prev)
                        }>
                        {isPasswordCheckVisible ? (
                          <HidePassword width={24} hide={24} />
                        ) : (
                          <ShowPassword width={24} hide={24} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.validBox}>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.passwordConfirm.isMatched
                            ? styles.validText
                            : '',
                        ]}>
                        {t('common.passwordMatch')}
                      </Text>
                    </View>
                  </View>
                </>
              )}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {isForeignSignUp
                    ? t('auth.gender_c18e9a')
                    : t('common.gender')}
                </Text>
                <View style={styles.genderGroup}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.genderButton,
                      formData.gender === 'F' && styles.genderButtonActive,
                    ]}
                    onPress={() => handleGenderChange('F')}>
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === 'F' &&
                          styles.genderButtonTextActive,
                      ]}>
                      {t('common.female')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.genderButton,
                      formData.gender === 'M' && styles.genderButtonActive,
                    ]}
                    onPress={() => handleGenderChange('M')}>
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === 'M' &&
                          styles.genderButtonTextActive,
                      ]}>
                      {t('common.male')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View>
            <ButtonScarlet
              title={t('auth.signUp')}
              onPress={handleSubmit}
              disabled={!isFormValid()}
            />
          </View>
        </ScrollView>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={() => {
            if (errorModal.onPress === 'integrationConfirm') {
              setErrorModal(prev => ({...prev, visible: false}));
              setPendingAfterLogin(true);
              return;
            }
            if (errorModal.onPress === 'moveToLogin') {
              setErrorModal(prev => ({...prev, visible: false}));
              navigation.navigate('LoginIntro');
              return;
            } else {
              setErrorModal(prev => ({...prev, visible: false}));
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserRegisterProfile;
