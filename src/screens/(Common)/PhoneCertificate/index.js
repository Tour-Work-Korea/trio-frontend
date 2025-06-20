import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './PhoneCertificate.styles';
import Header from '@components/Header';
import authApi from '@utils/api/authApi';

const PhoneCertificate = ({route}) => {
  const {user} = route.params;
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 타이머
  const [isTimerActive, setIsTimerActive] = useState(false);

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
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('유효한 휴대폰 번호를 입력해주세요.');
      return;
    }
    try {
      await authApi.sendSms(phoneNumber);
      setIsCodeSent(true);
      setTimeLeft(180);
      setIsTimerActive(true);
      Alert.alert('인증번호가 전송되었습니다.');
    } catch (error) {
      Alert.alert('인증번호 전송에 실패했습니다.');
      console.error('인증번호 전송 실패', error);
    }
  };

  // 인증번호 재전송
  const resendVerificationCode = () => {
    setVerificationCode('');
    sendVerificationCode();
  };

  //인증번호 확인
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      Alert.alert('유효한 인증번호를 입력해주세요.');
      return;
    }
    try {
      await authApi.verifySms(phoneNumber, verificationCode);
      Alert.alert('인증에 성공했습니다.');
      setIsTimerActive(false);
      navigation.navigate('EmailCertificate', {user, phoneNumber});
    } catch (error) {
      Alert.alert('인증번호 확인에 실패했습니다.');
      console.error(error);
    }
  };

  // 타이머 포맷 함수
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>휴대폰 인증</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>휴대폰 번호</Text>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={styles.phoneInput}
                placeholder="-없이 입력"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={11}
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>인증번호</Text>
            <View style={styles.verificationContainer}>
              <TextInput
                style={styles.verificationInput}
                placeholder="인증번호"
                value={verificationCode}
                onChangeText={setVerificationCode}
                maxLength={6}
                editable={isCodeSent}
              />
              {isTimerActive && (
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={resendVerificationCode}
              disabled={!isCodeSent}>
              <Text
                style={[styles.resendText, !isCodeSent && styles.disabledText]}>
                인증번호 재전송
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={
          isCodeSent && verificationCode ? verifyCode : sendVerificationCode
        }>
        <Text style={styles.nextButtonText}>
          {isCodeSent && verificationCode ? '다음' : '인증번호 받기'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PhoneCertificate;
