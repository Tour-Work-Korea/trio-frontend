import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {useNavigation} from '@react-navigation/native';
import {tryLogin} from '@utils/auth/login';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import api from '@utils/api/axiosInstance';

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleRefreshToken = async () => {
    console.log('[Auth] 🎯 Token refresh start');
    try {
      //refreshToken 쿠키로 /auth/refresh 호출
      console.log('[Auth] ▶️ Calling authApi.refreshToken()');
      const res = await authApi.refreshToken();
      console.log('[Auth] ✅ refreshToken response received', res);

      const accessToken = res.data.accessToken;
      let refreshToken;
      const rawCookies = res.headers['set-cookie'] || res.headers['Set-Cookie'];
      if (rawCookies && rawCookies.length > 0) {
        const cookie = rawCookies[0];
        const match = cookie.match(/refreshToken=([^;]+);?/);
        if (match) {
          refreshToken = match[1];
        }
      }
      console.log('[Auth] 🔐 New tokens:', {
        accessToken: accessToken?.slice(0, 10) + '…',
        refreshToken,
      });
      useUserStore.getState().setTokens({accessToken, refreshToken});
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;

      console.log(
        '[Auth] 📡 Updated axios default header with new accessToken',
      );
      //대기 중이던 요청들에 토큰 전달 및 재시도
      console.log('[Auth] 📝 Resolved pending requests queue with new token');

      //원래 요청에 새 토큰 붙여서 다시 호출
      console.log('[Auth] 🔁 Retrying original request');
    } catch (error) {
      console.error('[Auth] ❌ refreshToken failed or expired', error);

      console.log('[Auth] 🚫 Cleared pending requests queue with error');

      useUserStore.getState().clearUser();
      console.log('[Auth] 👤 Cleared user state (logged out)');

      // navigation.replace('Login');
      console.log('[Auth] 🔄 Redirect to Login suggested');

      return Promise.reject(error);
    } finally {
      console.log('[Auth] 🔁 isRefreshing flag set to false');
    }
  };

  const handleLogin = role => {
    tryLogin(email, password, role);
    navigation.goBack();
  };

  const handleHostLogin = () => {
    tryLogin(
      // email: 'hostTest@gmail.com',
      // password: 'Hostpassword1!',
      'sal091625@gmail.com',
      'Pw123456!',
      'HOST',
    );
  };
  const handleUserLogin = () => {
    tryLogin('test@gmail.com', 'Testpassword1!', 'USER');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EXLogin Screen</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleLogin('USER')}>
        <Text style={styles.buttonText}>유저 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleLogin('HOST')}>
        <Text style={styles.buttonText}>사장님 로그인</Text>
      </TouchableOpacity>

      <Text>
        임시로 계정 안 만들고 테스트할 때 쓰세요! 미리 계정 넣어뒀어요
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleHostLogin}>
        <Text style={styles.buttonText}>사장님 자동 로그인하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>유저 자동 로그인하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRefreshToken}>
        <Text style={styles.buttonText}>토큰 재발급 로직 확안</Text>
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
});

export default EXLogin;
