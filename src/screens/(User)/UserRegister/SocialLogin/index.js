import React, {useRef} from 'react';
import {Alert, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import {tryKakaoLogin} from '@utils/auth/login';

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

      webviewRef.current?.stopLoading(); // optional

      const loginRes = await tryKakaoLogin(code, 'USER');
      if (loginRes.success) {
        navigation.replace('EXHome');
      } else {
        Alert.alert('카카오 로그인에 실패했습니다.');
        alreadyHandled.current = false;
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
        onShouldStartLoadWithRequest={request => {
          const {url} = request;
          if (url.startsWith(REDIRECT_URI)) {
            return false; // ✅ redirect URL로 이동하지 않음 (즉시 차단)
          }
          return true;
        }}
      />
    </SafeAreaView>
  );
}
