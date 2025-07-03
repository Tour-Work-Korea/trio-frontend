import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {useNavigation} from '@react-navigation/native';
import {tryLogin} from '@utils/auth/login';
import KakaoLoginButton from '@assets/images/kakao_login_medium_wide.png';

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const navigation = useNavigation();

  const handleLogin = async (email, password, role) => {
    try {
      await tryLogin(email, password, role);
      navigation.goBack();
    } catch (error) {
      console.warn(`${role} 로그인 실패:`, error);
    }
  };

  const handleHostLogin = async () => {
    handleLogin('sal091625@gmail.com', 'Pw123456!', 'HOST');
  };

  const handleUserLogin = async () => {
    handleLogin('test@gmail.com', 'Testpassword1!', 'USER');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EXLogin Screen</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={emailInput}
        onChangeText={setEmailInput}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={passwordInput}
        onChangeText={setPasswordInput}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleLogin(emailInput, passwordInput, 'USER')}>
        <Text style={styles.buttonText}>유저 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleLogin(emailInput, passwordInput, 'HOST')}>
        <Text style={styles.buttonText}>사장님 로그인</Text>
      </TouchableOpacity>

      {/* <Text>
        임시로 계정 안 만들고 테스트할 때 쓰세요! 미리 계정 넣어뒀어요
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleHostLogin}>
        <Text style={styles.buttonText}>사장님 자동 로그인하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>유저 자동 로그인하기</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.kakaoButton}
        onPress={() => navigation.navigate('SocialLogin')}>
        <Image source={KakaoLoginButton} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: COLORS.scarlet,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE500',
    borderRadius: 12,
    justifyContent: 'center',
  },
});

export default EXLogin;
