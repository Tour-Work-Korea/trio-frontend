import {useTranslation} from 'react-i18next';
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarletLogo from '@components/ButtonScarletLogo';
import AlertModal from '@components/modals/AlertModal';

import styles from '../Login.styles';
import {COLORS} from '@constants/colors';
import LogoOrange from '@assets/images/logo_orange.svg';

const VerifyPhone = ({route}) => {
  const {t} = useTranslation();
  const {find, originPhone} = route.params;
  const userRole = 'USER';
  const smsPurpose = 'FIND_ACCOUNT';
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 타이머
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const [loading, setLoading] = useState(false);
  const [hasRequestedCode, setHasRequestedCode] = useState(false); // 인증 요청 누름 여부
  const [isResendEnabled, setIsResendEnabled] = useState(false); // 재전송 버튼 활성 여부

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
      setErrorModal({visible: false, message: '', buttonText: ''});
      setLoading(false);
    }, []),
  );

  //휴대폰 번호 유효성 확인
  useEffect(() => {
    if (phoneNumber.length === 11) {
      setIsPhoneNumberValid(true);
    } else {
      setIsPhoneNumberValid(false);
    }
  }, [phoneNumber]);

  //인증 번호 유효성 확인
  useEffect(() => {
    if (code.length === 6) {
      setIsCodeValid(true);
    } else {
      setIsCodeValid(false);
    }
  }, [code]);

  useEffect(() => {
    if (isCodeVerified) {
      setTimeout(() => {
        if (find === 'email') {
          navigation.navigate('FindId', {
            userRole,
            phoneNumber,
          });
        } else {
          navigation.navigate('FindPassword', {
            userRole,
            phoneNumber,
            updateProfile: originPhone ? true : false,
          });
        }
      }, 850);
    }
  }, [find, isCodeVerified, navigation, originPhone, phoneNumber, userRole]);

  // 타이머 기능
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
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

  //인증번호 발송
  const sendVerificationCode = async () => {
    if (originPhone) {
      //로그인 상태에서 비밀번호 변경 시, 프로필의 전화번호와 같아야 함
      if (originPhone !== phoneNumber) {
        setErrorModal({
          visible: true,
          message: t('auth.doesNotMatchYourPhoneNumber'),
          buttonText: t('common.confirm'),
        });
        return;
      }
    }
    try {
      await authApi.sendSms(phoneNumber, userRole, smsPurpose);
      setHasRequestedCode(true);
      setIsCodeSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);

      setErrorModal({
        visible: true,
        message: t('common.aVerificationNumberHasBeenSentToValue', {
          phoneNumber: phoneNumber,
        }),
        buttonText: t('common.confirm'),
      });

      setIsResendEnabled(false);
      setTimeout(() => setIsResendEnabled(true), 30000);
    } catch (error) {
      console.error('인증번호 전송 실패: ', error?.response?.data?.message);
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          t('common.failedToSendAuthenticationNumber'),
        buttonText: t('common.confirm'),
      });
    }
  };

  // 인증번호 재전송
  const resendVerificationCode = () => {
    setCode('');
    sendVerificationCode();
  };

  //인증번호 확인
  const verifyCode = async () => {
    setLoading(true);
    try {
      await authApi.verifySms(phoneNumber, code, userRole, smsPurpose);
      setIsTimerActive(false);
      setIsCodeVerified(true);
    } catch (error) {
      console.error(error);
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message,
        buttonText: t('common.authenticateAgain'),
      });
    } finally {
      setLoading(false);
    }
  };
  // 타이머 포맷 함수
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const MainLogo = LogoOrange;
  const mainColor = COLORS.primary_orange;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <View style={styles.titleContainer}>
                <MainLogo width={60} height={29} />
              </View>
              <Text style={[styles.titleText]}>
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
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerifyPhone;
