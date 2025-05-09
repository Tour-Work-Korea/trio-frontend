import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import useUserStore from '@stores/userStore'; // store 만든거 불러옴
import { API_BASE_URL } from '@env'; // api 백 주소 불러오기

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const accessToken = useUserStore((state) => state.accessToken);
  const userRole = useUserStore((state) => state.userRole);

  // 로그인 함수 예시
  const login = async ({ email, password, userRole }) => {
    try {
      // 로그인 요청
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        userRole,
      });

      // 응답에서 accessToken, refreshToken 추출
      const { accessToken, refreshToken } = response.data;

      // store의 setter 가져오기
      const { setTokens, setUserRole } = useUserStore.getState();

      // zustand에 토큰 및 사용자 역할 저장
      setTokens({ accessToken, refreshToken });
      setUserRole(userRole);

      // persist로 인해 앱 껐다 켜도 로그인 정보 유지됨
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  useEffect(() => {
    // 더미 데이터로 로그인 호출
    login({
      email: 'test@example.com',
      password: '12345678',
      userRole: 'USER',
    });
  }, []);

  return (
    <View>
      <Text>EXLogin Screen</Text>
    </View>
  );
};

export default EXLogin;
