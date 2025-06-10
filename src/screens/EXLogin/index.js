import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import useUserStore from '@stores/userStore';
import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from '@utils/api/authApi';
import {COLORS} from '@constants/colors';
import {useNavigation} from '@react-navigation/native';

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const accessToken = useUserStore(state => state.accessToken);
  const userRole = useUserStore(state => state.userRole);
  const refreshToken = useUserStore(state => state.refreshToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  // 로그인 요청
  const login = async ({email, password, userRole}) => {
    try {
      const response = await authApi.login(email, password);
      const authorizationHeader = response.headers?.authorization;
      const accessToken = authorizationHeader?.replace('Bearer ', '');

      if (!accessToken) {
        console.error('토큰 없음');
        return;
      }

      const {setTokens, setUserRole} = useUserStore.getState();

      await EncryptedStorage.setItem(
        'user-credentials',
        JSON.stringify({email, password, userRole}),
      );

      setTokens({accessToken, refreshToken: null}); // refreshToken은 없는 것으로 간주
      setUserRole(userRole);

      navigation.goBack();

      // // 토큰과 역할 읽어오기 예시
      // const {
      //   accessToken: savedAccess,
      //   refreshToken: savedRefresh,
      //   userRole: savedRole,
      // } = useUserStore.getState();

      // console.log('accessToken:', savedAccess);
      // console.log('refreshToken:', savedRefresh);
      // console.log('userRole:', savedRole);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleLogin = role => {
    login({
      email,
      password,
      userRole: role,
    });
  };

  const handleHostLogin = () => {
    login({
      // email: 'hostTest@gmail.com',
      // password: 'Hostpassword1!',
      email: 'sal091625@gmail.com',
      password: 'Pw123456!',
      userRole: 'HOST',
    });
  };
  const handleUserLogin = () => {
    login({
      email: 'test@gmail.com',
      password: 'Testpassword1!',
      userRole: 'USER',
    });
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
