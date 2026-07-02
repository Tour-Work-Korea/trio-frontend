import React, {useCallback, useEffect, useState} from 'react';
import {
  Keyboard,
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
import {storeLoginTokens} from '@utils/auth/login';

import styles from '../../Login/Login.styles';

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

  const [smsPurpose, setSmsPurpose] = useState('SIGN_UP');
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
      message.includes('필수')
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

      const {accessToken, refreshToken} = res.data || {};

      if (!accessToken || !refreshToken) {
        throw new Error('소셜 회원가입 토큰 응답이 비어있습니다.');
      }

      await storeLoginTokens({
        accessToken,
        refreshToken,
        userRole,
      });

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
            '카카오에서 받은 정보를 확인해주세요.',
          buttonText: '확인',
          onPress: moveToSocialProfileFallback,
        });
        return;
      }

      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          '소셜 회원가입에 실패했습니다.',
        buttonText: '확인',
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
    moveToSocialProfileFallback,
    socialProfileBirthday,
    socialProfileGender,
    socialProfileName,
    socialSignupToken,
    userRole,
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
      if (isSocial && hasCompleteSocialProfile) {
        completeSocialSignUp();
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
        message: '인증 유효 시간이 만료되었습니다.',
        buttonText: '확인',
      });
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const openPhoneAlreadyExistsForSocial = () => {
    setErrorModal({
      visible: true,
      message:
        '이미 가입된 전화번호입니다.\n기존 계정에 소셜 계정을 연결하려면 인증을 진행해주세요.',
      buttonText: '연동 인증하기',
      onPress: async () => {
        setErrorModal(prev => ({...prev, visible: false, onPress: null}));
        setSmsPurpose('FIND_ACCOUNT');
        await sendVerificationCode('FIND_ACCOUNT');
      },
    });
  };

  const isPhoneAlreadyExistsError = error => {
    const data = error?.response?.data;
    const errorCode = data?.code || data?.errorCode || data?.status;
    const message = data?.message || '';
    return (
      errorCode === 'PHONE_ALREADY_EXISTS' || message.includes('이미 가입')
    );
  };

  const sendVerificationCode = async (purpose = smsPurpose) => {
    try {
      await authApi.sendSms(phoneNumber, userRole, purpose);
      setHasRequestedCode(true);
      setIsCodeSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);

      setErrorModal({
        visible: true,
        message: `${phoneNumber}으로\n인증 번호가 발송 되었습니다`,
        buttonText: '확인',
      });

      setIsResendEnabled(false);
      setTimeout(() => setIsResendEnabled(true), 30000);
    } catch (error) {
      if (
        isSocial &&
        purpose === 'SIGN_UP' &&
        isPhoneAlreadyExistsError(error)
      ) {
        openPhoneAlreadyExistsForSocial();
        return;
      }

      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message || '인증번호 전송에 실패했습니다',
        buttonText: '확인',
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
      await authApi.verifySms(phoneNumber, code, userRole, smsPurpose);
      setIsTimerActive(false);
      setIsCodeVerified(true);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message || '인증에 실패했습니다.',
        buttonText: '다시 인증하기',
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
              <Text style={styles.titleText}>전화번호 인증</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="전화번호를 입력해주세요"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={phoneNumber}
                    onChangeText={text => {
                      const filtered = text.replace(/[^0-9]/g, '');
                      setPhoneNumber(filtered);
                      setHasRequestedCode(false);
                      setIsCodeSent(false);
                      setIsResendEnabled(false);
                      setSmsPurpose('SIGN_UP');
                    }}
                    keyboardType="number-pad"
                    maxLength={11}
                  />
                  <TouchableOpacity
                    onPress={sendVerificationCode}
                    disabled={!isPhoneNumberValid || hasRequestedCode}>
                    <Text
                      style={[
                        styles.inputButton,
                        isPhoneNumberValid && !hasRequestedCode
                          ? {color: COLORS.primary_orange}
                          : '',
                      ]}>
                      인증요청
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>인증번호</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="인증번호를 입력해주세요"
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
                      인증번호 재전송
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
                  title="인증 성공!"
                  backgroundColor={mainColor}
                  textColor={COLORS.grayscale_0}
                />
              ) : isCodeValid ? (
                <ButtonWhite
                  title="인증하기"
                  onPress={verifyCode}
                  backgroundColor={mainColor}
                  textColor={COLORS.grayscale_0}
                />
              ) : (
                <ButtonWhite title="인증하기" disabled={true} />
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
