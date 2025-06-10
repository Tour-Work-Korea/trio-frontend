import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import useUserStore from '@stores/userStore'; // store 만든거 불러옴
import authApi from '../../utils/api/authApi';

const EXLogin = () => {
  // 토큰과 역할 읽어오기 예시
  const accessToken = useUserStore(state => state.accessToken);
  const userRole = useUserStore(state => state.userRole);
  const refreshToken = useUserStore(state => state.refreshToken);

  // 로그인 함수 예시
  const login = async ({email, password, userRole}) => {
    try {
      // 로그인 요청
      const response = await authApi.login(email, password);

      const authorizationHeader = response.headers?.authorization;
      const accessToken = authorizationHeader?.replace('Bearer ', '');

      if (!accessToken) {
        console.error('토큰 없음');
        return;
      }

      const {setTokens, setUserRole} = useUserStore.getState();

      // 토큰과 역할 저장
      setTokens({accessToken, refreshToken: null}); // refreshToken은 없는 것으로 간주
      setUserRole(userRole);

      // 토큰과 역할 읽어오기 예시
      const {
        accessToken: savedAccess,
        refreshToken: savedRefresh,
        userRole: savedRole,
      } = useUserStore.getState();

      console.log('accessToken:', savedAccess);
      console.log('refreshToken:', savedRefresh);
      console.log('userRole:', savedRole);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleHostLogin = () => {
    login({
      email: 'hostTest@gmail.com',
      password: 'Hostpassword1!',
      // email: 'sal091625@gmail.com',
      // password: 'Pw123456!',
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
    <View>
      <Text style={{marginBottom: 30}}>EXLogin Screen</Text>
      <TouchableOpacity onPress={handleHostLogin}>
        <Text>사장님 자동 로그인하기</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUserLogin}>
        <Text>유저 자동 로그인하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EXLogin;
