import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {tryLogin} from '@utils/auth/login';
import KakaoLoginButton from '@assets/images/kakao_login_medium_wide.png';
import {FONTS} from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import ErrorModal from '@components/modals/ErrorModal';
import useUserStore from '@stores/userStore';
import Loading from '@components/Loading';

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });
  const userRole = useUserStore.getState()?.userRole;
  const navigation = useNavigation();

  useEffect(() => {
    if (userRole === undefined) return;

    if (userRole === 'USER' || userRole === 'HOST') {
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    }
  }, [userRole]);

  if (userRole === undefined || userRole === 'USER' || userRole === 'HOST') {
    return <Loading title="로그인 상태 확인 중..." />;
  }

  const handleLogin = async (email, password, role) => {
    try {
      await tryLogin(email, password, role);
      navigation.navigate('MainTabs');
    } catch (error) {
      console.warn(`${role} 로그인 실패:`, error);
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message || '로그인 중 오류가 발생했습니다',
      });
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
      <Text style={styles.title}>로그인</Text>
      <View style={{gap: 20}}>
        <View>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            value={emailInput}
            onChangeText={setEmailInput}
            placeholderTextColor={COLORS.grayscale_400}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={COLORS.grayscale_400}
            value={passwordInput}
            onChangeText={setPasswordInput}
            secureTextEntry
          />
        </View>
      </View>

      <View style={{gap: 20, flexDirection: 'column'}}>
        <ButtonScarlet
          onPress={() => handleLogin(emailInput, passwordInput, 'USER')}
          title={'알바 로그인'}
        />
        <ButtonWhite
          onPress={() => handleLogin(emailInput, passwordInput, 'HOST')}
          title={'사장님 로그인'}
        />

        <TouchableOpacity
          style={{
            borderBottomWidth: 1,
            borderBottomColor: COLORS.grayscale_400,
            alignSelf: 'center',
          }}
          onPress={() => navigation.navigate('Register')}>
          <Text style={{color: COLORS.grayscale_400}}>회원가입하러 가기</Text>
        </TouchableOpacity>
      </View>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText="확인"
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />

      {/* 
        <Text>
          임시로 계정 안 만들고 테스트할 때 쓰세요! 미리 계정 넣어뒀어요
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleHostLogin}>
          <Text style={styles.buttonText}>사장님 자동 로그인하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUserLogin}>
          <Text style={styles.buttonText}>유저 자동 로그인하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={() => navigation.navigate('SocialLogin')}>
          <Image source={KakaoLoginButton} resizeMode="contain" />
        </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    gap: 60,
  },
  title: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_800,
    textAlign: 'center',
  },
  label: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 12,
    borderRadius: 20,
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
