import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import ButtonScarletLogo from '@components/ButtonScarletLogo';
import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';
import LogoOrange from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';
import authApi from '@utils/api/authApi';
import {storeLoginTokens, storeWebSessionInfo} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';

import styles from '../../Login/Login.styles';

const PROVIDER_LABELS = {
  KAKAO: i18n.t('common.cacao'),
  NAVER: i18n.t('common.naver'),
  GOOGLE: i18n.t('common.google'),
};

const SOCIAL_SMS_STATUS_MESSAGES = {
  EXISTING_USER_LINK_REQUIRED: i18n.t(
    'auth.verifyYourMobilePhoneToLinkYourSocialAccountTo',
  ),

  NEW_USER_SIGNUP_REQUIRED: i18n.t(
    'auth.mobilePhoneVerificationIsRequiredToRegisterAsANew',
  ),
};

/**
 * NICE 기반 USER 본인인증/가입 보조 경로는 백엔드에서 제거되어 비활성화함.
 *
 * 기존 흐름 요약:
 * - <UserPhone />에서 POST /auth/nice/init 호출
 * - NICE WebView 완료 후 niceAuthToken 수신
 * - authApi.checkSignUpStatus(niceAuthToken)
 * - authApi.completeUserSignUp({niceAuthToken, ...})
 *
 * 현재 일반 USER 가입 흐름:
 * - 이메일 인증 완료
 * - SMS 인증 USER + SIGN_UP 완료
 * - UserRegisterProfile에서 /auth/user/signup 호출
 */
const PhoneCertificate = ({route}) => {
  const {t} = useTranslation();
  const {
    user = 'USER',
    agreements = [],
    email = '',
    isSocial = false,
    socialSignupToken = null,
    provider = null,
    socialProfile = {},
  } = route.params || {};
  const userRole = user || 'USER';
  const navigation = useNavigation();
  const providerLabel = PROVIDER_LABELS[provider] || t('common.social');

  const [smsPurpose, setSmsPurpose] = useState('SIGN_UP');
  const [socialSmsStatus, setSocialSmsStatus] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRequestedCode, setHasRequestedCode] = useState(false);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    onPress: null,
  });

  const MainLogo = LogoOrange;
  const mainColor = COLORS.primary_orange;
  const socialProfileEmail = socialProfile.email || '';
  const socialProfileName = socialProfile.name || '';
  const socialProfileBirthday = socialProfile.birthday || '';
  const socialProfileGender = socialProfile.gender || '';
  const hasCompleteSocialProfile =
    !!socialProfileName &&
    /^\d{4}-\d{2}-\d{2}$/.test(socialProfileBirthday) &&
    (socialProfileGender === 'M' || socialProfileGender === 'F');

  const moveToSocialProfileFallback = useCallback(() => {
    navigation.navigate('UserRegisterProfile', {
      prevData: {
        userRole,
        agreements,
        email: email || socialProfileEmail,
        phoneNum: phoneNumber,
        isSocial,
        socialSignupToken,
        provider,
        name: socialProfileName,
        birthday: socialProfileBirthday,
        gender: socialProfileGender,
        password: '',
        passwordConfirm: '',
      },
    });
  }, [
    agreements,
    email,
    isSocial,
    navigation,
    phoneNumber,
    provider,
    socialProfileBirthday,
    socialProfileEmail,
    socialProfileGender,
    socialProfileName,
    socialSignupToken,
    userRole,
  ]);

  const isSocialProfileCompletionError = error => {
    const data = error?.response?.data;
    const errorCode = data?.code || data?.errorCode || data?.status || '';
    const message = data?.message || error?.message || '';

    return (
      errorCode.includes('PROFILE') ||
      errorCode.includes('REQUIRED') ||
      message.includes(t('auth.required'))
    );
  };

  const completeSocialSignUp = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authApi.completeSocialSignUp({
        provider,
        socialSignupToken,
        userRole,
        phoneNum: phoneNumber,
        name: socialProfileName,
        birthday: socialProfileBirthday,
        gender: socialProfileGender,
        agreements,
      });

      const data = res.data || {};

      if (Platform.OS === 'web') {
        await storeWebSessionInfo(data.session || data, userRole);
      } else {
        const {accessToken, refreshToken} = data;

        if (!accessToken || !refreshToken) {
          throw new Error(t('common.theSocialSignupTokenResponseIsEmpty'));
        }

        await storeLoginTokens({
          accessToken,
          refreshToken,
          userRole,
        });
      }
      await storeLastLoginProvider(provider);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'MainTabs', params: {screen: '홈'}}],
        }),
      );
    } catch (error) {
      if (isSocialProfileCompletionError(error)) {
        setErrorModal({
          visible: true,
          message:
            error?.response?.data?.message ||
            t('auth.pleaseCheckTheInformationReceivedFromValue', {
              providerLabel: providerLabel,
            }),
          buttonText: t('common.confirm'),
          onPress: moveToSocialProfileFallback,
        });
        return;
      }

      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('auth.socialMembershipRegistrationFailed'),

        buttonText: t('common.confirm'),
        onPress: null,
      });
    } finally {
      setLoading(false);
    }
  }, [
    agreements,
    navigation,
    phoneNumber,
    provider,
    providerLabel,
    moveToSocialProfileFallback,
    socialProfileBirthday,
    socialProfileGender,
    socialProfileName,
    socialSignupToken,
    userRole,
    t,
  ]);

  useFocusEffect(
    useCallback(() => {
      setPhoneNumber('');
      setIsPhoneNumberValid(false);
      setCode('');
      setIsCodeValid(false);
      setIsCodeSent(false);
      setIsCodeVerified(false);
      setTimeLeft(300);
      setIsTimerActive(false);
      setLoading(false);
      setHasRequestedCode(false);
      setIsResendEnabled(false);
      setSmsPurpose('SIGN_UP');
      setSocialSmsStatus(null);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
        onPress: null,
      });
    }, []),
  );

  useEffect(() => {
    setIsPhoneNumberValid(phoneNumber.length === 11);
  }, [phoneNumber]);

  useEffect(() => {
    setIsCodeValid(code.length === 6);
  }, [code]);

  useEffect(() => {
    if (!isCodeVerified) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (isSocial) {
        if (agreements.length === 0) {
          navigation.navigate('RegisterAgree', {
            user: userRole,
            isSocial: true,
            provider,
            socialSignupToken,
            socialProfile,
            phoneNum: phoneNumber,
            socialPhoneVerified: true,
          });
          return;
        }

        if (hasCompleteSocialProfile) {
          completeSocialSignUp();
          return;
        }

        moveToSocialProfileFallback();
        return;
      }

      moveToSocialProfileFallback();
    }, 850);

    return () => clearTimeout(timeoutId);
  }, [
    agreements,
    completeSocialSignUp,
    hasCompleteSocialProfile,
    email,
    isCodeVerified,
    isSocial,
    moveToSocialProfileFallback,
    navigation,
    phoneNumber,
    provider,
    socialProfile,
    socialSmsStatus,
    socialSignupToken,
    userRole,
  ]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsTimerActive(false);
      setErrorModal({
        visible: true,
        message: t('common.theAuthenticationValidityPeriodHasExpired'),
        buttonText: t('common.confirm'),
      });
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, t]);

  const sendVerificationCode = async (purpose = smsPurpose) => {
    try {
      const response = isSocial
        ? await authApi.sendSocialSignUpSms({
            socialSignupToken,
            phoneNum: phoneNumber,
          })
        : await authApi.sendSms(phoneNumber, userRole, purpose);
      const responseData = response?.data || {};
      const nextSmsPurpose = responseData.smsPurpose || purpose;

      setSmsPurpose(nextSmsPurpose);
      if (isSocial && responseData.status) {
        setSocialSmsStatus(responseData.status);
      }
      setHasRequestedCode(true);
      setIsCodeSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);

      setErrorModal({
        visible: true,
        message:
          SOCIAL_SMS_STATUS_MESSAGES[responseData.status] ||
          responseData.message ||
          t('common.aVerificationNumberHasBeenSentToValue', {
            phoneNumber: phoneNumber,
          }),
        buttonText: t('common.confirm'),
      });

      setIsResendEnabled(false);
      setTimeout(() => setIsResendEnabled(true), 30000);
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          t('common.failedToSendAuthenticationNumber'),
        buttonText: t('common.confirm'),
        onPress: null,
      });
    }
  };

  const resendVerificationCode = () => {
    setCode('');
    sendVerificationCode();
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const response = isSocial
        ? await authApi.verifySocialSignUpSms({
            socialSignupToken,
            phoneNum: phoneNumber,
            code,
          })
        : await authApi.verifySms(phoneNumber, code, userRole, smsPurpose);
      const responseData = response?.data || {};

      if (responseData.smsPurpose) {
        setSmsPurpose(responseData.smsPurpose);
      }
      if (isSocial && responseData.status) {
        setSocialSmsStatus(responseData.status);
      }
      if (isSocial && responseData.verified === false) {
        throw new Error(responseData.message || t('auth.authenticationFailed'));
      }

      setIsTimerActive(false);
      setIsCodeVerified(true);
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message || t('auth.authenticationFailed'),
        buttonText: t('common.authenticateAgain'),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            <View style={styles.groupParent}>
              <View style={styles.titleContainer}>
                <MainLogo width={60} height={29} />
              </View>
              <Text style={styles.titleText}>
                {t('common.phoneNumberVerification')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('common.phoneNumber')}</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('common.pleaseEnterYourPhoneNumber')}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={phoneNumber}
                    onChangeText={text => {
                      const filtered = text.replace(/[^0-9]/g, '');
                      setPhoneNumber(filtered);
                      setHasRequestedCode(false);
                      setIsCodeSent(false);
                      setIsResendEnabled(false);
                      setSmsPurpose('SIGN_UP');
                      setSocialSmsStatus(null);
                    }}
                    keyboardType="number-pad"
                    maxLength={11}
                  />

                  <TouchableOpacity
                    onPress={() => sendVerificationCode()}
                    disabled={!isPhoneNumberValid || hasRequestedCode}>
                    <Text
                      style={[
                        styles.inputButton,
                        isPhoneNumberValid && !hasRequestedCode
                          ? {color: COLORS.primary_orange}
                          : '',
                      ]}>
                      {t('common.authenticationRequest')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {t('common.certificationNumber')}
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t(
                      'common.pleaseEnterYourAuthenticationNumber',
                    )}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={code}
                    onChangeText={text => {
                      const filtered = text.replace(/[^0-9]/g, '');
                      setCode(filtered);
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={isCodeSent}
                  />

                  <Text
                    style={[
                      styles.inputButton,
                      isCodeSent ? {color: COLORS.primary_orange} : '',
                    ]}>
                    {isCodeSent ? formatTime(timeLeft) : '00:00'}
                  </Text>
                </View>
                <View style={styles.resendContainer}>
                  <TouchableOpacity
                    onPress={resendVerificationCode}
                    disabled={!hasRequestedCode || !isResendEnabled}>
                    <Text
                      style={[
                        styles.resendText,
                        hasRequestedCode && isResendEnabled
                          ? {color: COLORS.primary_orange}
                          : '',
                      ]}>
                      {t('common.resendAuthenticationNumber')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.frameParent}>
            <View style={styles.frameGroup}>
              {loading ? (
                <ButtonScarletLogo disabled={true} />
              ) : isCodeVerified ? (
                <ButtonWhite
                  title={t('common.authenticationSuccessful')}
                  backgroundColor={mainColor}
                  textColor={COLORS.grayscale_0}
                />
              ) : isCodeValid ? (
                <ButtonWhite
                  title={t('common.verify')}
                  onPress={verifyCode}
                  backgroundColor={mainColor}
                  textColor={COLORS.grayscale_0}
                />
              ) : (
                <ButtonWhite title={t('common.verify')} disabled={true} />
              )}
            </View>
          </View>
        </View>

        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={() => {
            if (typeof errorModal.onPress === 'function') {
              errorModal.onPress();
              return;
            }
            setErrorModal(prev => ({...prev, visible: false}));
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PhoneCertificate;
