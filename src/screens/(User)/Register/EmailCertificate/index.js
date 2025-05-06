import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './EmailCertificate.styles';
import Header from '@components/Header';

const EmailCertificate = ({route}) => {
  const {user} = route.params;
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
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
      Alert.alert(
        '알림',
        '인증 시간이 만료되었습니다. 인증번호를 재전송해주세요.',
      );
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  // 이메일 유효성 검사 함수
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 인증번호 전송 함수
  const sendVerificationCode = () => {
    // 이메일 유효성 검사
    if (!email || !isValidEmail(email)) {
      Alert.alert('알림', '유효한 이메일 주소를 입력해주세요.');
      return;
    }

    // 인증번호 전송 로직 (실제로는 API 호출)
    setIsCodeSent(true);
    setTimeLeft(180);
    setIsTimerActive(true);
    Alert.alert('알림', '인증번호가 전송되었습니다.');
  };

  // 인증번호 재전송 함수
  const resendVerificationCode = () => {
    setVerificationCode('');
    setTimeLeft(180);
    setIsTimerActive(true);
    Alert.alert('알림', '인증번호가 재전송되었습니다.');
  };

  // 인증 확인 함수
  const verifyCode = () => {
    // 인증번호 유효성 검사
    // if (!verificationCode || verificationCode.length < 4) {
    //   Alert.alert('알림', '유효한 인증번호를 입력해주세요.');
    //   return;
    // }

    // 인증번호 확인 로직 (실제로는 API 호출)
    // 성공 시 다음 화면으로 이동
    if (user == 'User') {
      navigation.navigate('UserRegisterInfo');
    } else {
      navigation.navigate('HostRegister');
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
          <Text style={styles.title}>이메일 인증</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailInput}
                placeholder="이메일 입력"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={sendVerificationCode}
                disabled={isCodeSent}>
                <Text style={styles.verifyButtonText}>인증하기</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>인증번호</Text>
            <View style={styles.verificationContainer}>
              <TextInput
                style={styles.verificationInput}
                placeholder="인증번호 입력"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
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

        <TouchableOpacity
          style={[
            styles.nextButton,
            (!isCodeSent || !verificationCode) && styles.disabledButton,
          ]}
          onPress={verifyCode}
          //   disabled={!isCodeSent || !verificationCode}
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EmailCertificate;
