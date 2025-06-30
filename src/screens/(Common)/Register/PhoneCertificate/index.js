import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '@assets/images/logo_orange.svg';
import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const PhoneCertificate = ({route}) => {
  const {user} = route.params;
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 타이머
  const [isTimerActive, setIsTimerActive] = useState(false);

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
      Alert.alert('인증 시간이 만료되었습니다. 인증번호를 재전송해주세요.');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  //인증번호 발송
  const sendVerificationCode = async () => {
    try {
      await authApi.sendSms(phoneNumber);
      setIsCodeSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);
    } catch (error) {
      console.error('인증번호 전송 실패', error);
    }
  };

  // 인증번호 재전송
  const resendVerificationCode = () => {
    setCode('');
    sendVerificationCode();
  };

  //인증번호 확인
  const verifyCode = async () => {
    try {
      await authApi.verifySms(phoneNumber, code);
      setIsTimerActive(false);
      navigation.navigate('EmailCertificate', {user, phoneNumber});
    } catch (error) {
      console.error(error);
    }
  };

  // 타이머 포맷 함수
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.viewFlexBox]}>
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
                  }}
                  keyboardType="number-pad"
                  maxLength={11}
                />
                <TouchableOpacity
                  onPress={sendVerificationCode}
                  disabled={!isPhoneNumberValid}>
                  <Text
                    style={[
                      styles.inputButton,
                      isPhoneNumberValid ? {color: COLORS.scarlet} : '',
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
                <TouchableOpacity onPress={resendVerificationCode}>
                  <Text style={styles.resendText}>인증번호 재전송</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.frameParent}>
          <View style={styles.frameGroup}>
            {isCodeValid ? (
              <ButtonScarlet title="인증하기" onPress={verifyCode} />
            ) : (
              <ButtonWhite title="인증하기" disabled={true} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
    color: COLORS.grayscale_900,
  },
  viewFlexBox: {
    gap: 0,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  groupParent: {
    paddingVertical: 0,
    gap: 12,
    alignSelf: 'stretch',
  },
  titleText: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_900,
  },
  inputGroup: {
    marginTop: 40,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  inputLabel: {...FONTS.fs_16_semibold},
  inputBox: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_900,
  },
  inputButton: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
  },
  resendText: {...FONTS.fs_12_medium, color: COLORS.grayscale_400},
  resendContainer: {
    textAlign: 'right',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
  },
});

export default PhoneCertificate;
