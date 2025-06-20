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
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import hostMyApi from '@utils/api/hostMyApi';

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const navigation = useNavigation();
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);

  const handleLogin = role => {
    tryLogin(emailInput, passwordInput, role);
    navigation.goBack();
  };

  const handleHostLogin = async () => {
    try {
      await tryLogin(
        // email: 'hostTest@gmail.com',
        // password: 'Hostpassword1!',
        'sal091625@gmail.com',
        'Pw123456!',
        'HOST',
      );

      const res = await hostMyApi.getMyProfile();
      const {name, photoUrl, phone, email, businessNum} = res.data;

      setHostProfile({
        name: name ?? '',
        profileImage:
          photoUrl && photoUrl !== '사진을 추가해주세요' ? photoUrl : null,
        phone: phone ?? '',
        email: email ?? '',
        businessNum: businessNum ?? '',
      });

      navigation.goBack();
    } catch (error) {
      console.warn('자동 호스트 로그인 실패:', error);
    }
  };

  const handleUserLogin = async () => {
    try {
      await tryLogin('test@gmail.com', 'Testpassword1!', 'USER');

      const res = await userMyApi.getMyProfile();
      const {name, photoUrl, phone, email, mbti, instagramId} = res.data;

      setUserProfile({
        name: name ?? '',
        profileImage:
          photoUrl && photoUrl !== '사진을 추가해주세요' ? photoUrl : null,
        phone: phone ?? '',
        email: email ?? '',
        mbti: mbti ?? '',
        instagramId: instagramId ?? '',
      });

      navigation.goBack();
    } catch (error) {
      console.warn('자동 유저 로그인 실패:', error);
    }
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
