import React, {useRef} from 'react';
import {Alert, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import authApi from '@utils/api/authApi';
import {useNavigation} from '@react-navigation/native';

const KAKAO_CLIENT_ID = 'c9f983fd4f8dc0509b66b4d2ffa99e71';
const REDIRECT_URI = 'https://workaway.kr:8080/api/v1/auth/user/social-login'; // 포트 제거

const getQueryParam = (url, param) => {
  const match = url.match(new RegExp('[?&]' + param + '=([^&]+)'));
  return match ? decodeURIComponent(match[1]) : null;
};

export default function SocialLogin() {
  const navigation = useNavigation();
  const webviewRef = useRef(null);
  const alreadyHandled = useRef(false); // ✅ 중복 방지 플래그

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

  const handleNavigationChange = async navState => {
    const {url} = navState;

    if (
      url.startsWith(REDIRECT_URI) &&
      url.includes('code=') &&
      !alreadyHandled.current
    ) {
      alreadyHandled.current = true; // ✅ 중복 호출 방지

      const code = getQueryParam(url, 'code');
      console.log(code);

      webviewRef.current?.stopLoading(); // optional

      try {
        const res = await authApi.loginKakao(code);
        console.log('Login Success:', res.data);
        navigation.replace('EXHome');
      } catch (error) {
        Alert.alert('로그인 실패', error?.message || '알 수 없는 에러');
        alreadyHandled.current = false; // 실패 시 다시 로그인 가능하도록 초기화
      }
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        ref={webviewRef}
        source={{uri: kakaoAuthUrl}}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled
      />
    </SafeAreaView>
  );
}
