import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import styles from '../Register.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarletLogo from '@components/ButtonScarletLogo';
import ErrorModal from '@components/modals/ErrorModal';
import authApi from '@utils/api/authApi';
import Logo from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';

const EmailCertificate = ({route}) => {
  const {user, agreements, phoneNumber} = route.params;
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
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
      // 화면에 진입할 때 실행됨 (뒤로 갔다가 다시 돌아올 때도 포함)
      setEmail('');
      setIsEmailValid(false);
      setCode('');
      setIsCodeSent(false);
      setIsCodeValid(false);
      setIsCodeVerified(false);
      setTimeLeft(300);
      setIsTimerActive(false);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
      });
      setLoading(false);
    }, []),
  );

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

  // 이메일 유효성 검사
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  }, [email]);

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
        if (user === 'USER') {
          navigation.navigate('UserRegisterInfo', {
            agreements,
            email,
            phoneNumber,
          });
        } else {
          navigation.navigate('HostRegisterInfo', {
            agreements,
            email,
            phoneNumber,
          });
        }
      }, 850);
    }
  }, [isCodeVerified]);

  // 인증번호 전송
  const sendVerificationCode = async () => {
    try {
      await authApi.sendEmail(email, user);
      setHasRequestedCode(true);
      setIsCodeSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);

      // 재전송은 30초 이후에만 활성화
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

  // 인증번호 확인
  const verifyCode = async () => {
    setLoading(true);
    try {
      await authApi.verifyEmail(email, code);
      setIsTimerActive(false);
      setIsCodeVerified(true);
    } catch (error) {
      console.log('모달 띄움');
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message,
        buttonText: '다시 인증하기',
      });
    } finally {
      setLoading(false);
    }
  };

  // 타이머 포맷
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
              <Text style={[styles.titleText]}>이메일 인증</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="이메일을 입력해주세요"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      setHasRequestedCode(false);
                      setIsCodeSent(false);
                      setIsResendEnabled(false);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    maxLength={30}
                  />
                  <TouchableOpacity
                    onPress={sendVerificationCode}
                    disabled={!isEmailValid || hasRequestedCode}>
                    <Text
                      style={[
                        styles.inputButton,
                        isEmailValid && !hasRequestedCode
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
                          ? {color: COLORS.scarlet}
                          : {color: COLORS.grayscale_300},
                      ]}>
                      인증번호 재전송
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.frameGroup}>
              {loading ? (
                <ButtonScarletLogo disabled={true} />
              ) : isCodeVerified ? (
                <ButtonScarlet
                  title="인증 성공!"
                  onPress={() => {
                    if (user === 'USER') {
                      navigation.navigate('UserRegisterInfo', {
                        email,
                        phoneNumber,
                      });
                    } else {
                      navigation.navigate('HostRegisterInfo', {
                        email,
                        phoneNumber,
                      });
                    }
                  }}
                />
              ) : isCodeValid ? (
                <ButtonScarlet title="인증하기" onPress={verifyCode} />
              ) : (
                <ButtonWhite title="인증하기" disabled={true} />
              )}
            </View>
            {/* 임시 */}
            {/* <ButtonScarlet
              title="인증 성공!"
              onPress={() => {
                if (user === 'USER') {
                  navigation.navigate('UserRegisterInfo', {
                    agreements,
                    email: 'sal091625@gmail.com',
                    phoneNumber,
                  });
                } else {
                  navigation.navigate('HostRegisterInfo', {
                    agreements,
                    email: 'sal091625@gmail.com',
                    phoneNumber,
                  });
                }
              }}
            /> */}
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

export default EmailCertificate;
