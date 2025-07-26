import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '@assets/images/logo_orange.svg';
import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarletLogo from '@components/ButtonScarletLogo';
import ErrorModal from '@components/modals/ErrorModal';
import styles from '../Login.styles';
import {COLORS} from '@constants/colors';

const VerifyPhone = ({route}) => {
  const {userRole, find} = route.params;
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
          });
        }
      }, 850);
    }
  }, [isCodeVerified]);

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
        message: '인증 유효 시간이 만료되었습니다.',
        buttonText: '확인',
      });
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  //인증번호 발송
  const sendVerificationCode = async () => {
    try {
      await authApi.sendSms(phoneNumber, user);
      setHasRequestedCode(true);
      setIsCodeSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);
      setIsResendEnabled(false);
      setTimeout(() => setIsResendEnabled(true), 30000);
    } catch (error) {
      console.error('인증번호 전송 실패: ', error?.response?.data?.message);
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message,
        buttonText: '확인',
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
      await authApi.verifySms(phoneNumber, code);
      setIsTimerActive(false);
      setIsCodeVerified(true);
    } catch (error) {
      console.error(error);
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message,
        buttonText: '다시 인증하기',
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

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={[styles.viewFlexBox, {justifyContent: 'space-between'}]}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <Logo width={60} height={29} />
              <Text style={[styles.titleText]}>전화번호 인증</Text>
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
                      setHasRequestedCode(false); // 전화번호 변경 → 인증 요청 초기화
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
                          ? {color: COLORS.scarlet}
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
                      isCodeSent ? {color: COLORS.scarlet} : '',
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
            {/* <View style={styles.frameGroup}>
              {loading ? (
                <ButtonScarletLogo disabled={true} />
              ) : isCodeVerified ? (
                <ButtonScarlet title="인증 성공!" />
              ) : isCodeValid ? (
                <ButtonScarlet title="인증하기" onPress={verifyCode} />
              ) : (
                <ButtonWhite title="인증하기" disabled={true} />
              )}
            </View> */}
            {/* 테스트용 */}
            <View style={styles.frameGroup}>
              <ButtonScarlet
                title="인증 성공!"
                onPress={() => {
                  if (find === 'email') {
                    navigation.navigate('FindId', {
                      userRole,
                      phoneNumber,
                    });
                  } else {
                    navigation.navigate('FindPassword', {
                      userRole,
                      phoneNumber,
                    });
                  }
                }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </>
  );
};

export default VerifyPhone;
