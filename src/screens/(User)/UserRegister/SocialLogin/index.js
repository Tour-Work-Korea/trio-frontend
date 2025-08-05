import React, {useRef} from 'react';
import {Alert, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import {tryKakaoLogin} from '@utils/auth/login';

import {KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI} from '@env';

const getQueryParam = (url, param) => {
  const match = url.match(new RegExp('[?&]' + param + '=([^&]+)'));
  return match ? decodeURIComponent(match[1]) : null;
};

export default function SocialLogin() {
  const navigation = useNavigation();
  const webviewRef = useRef(null);
  const alreadyHandled = useRef(false);

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

  const handleNavigationChange = async navState => {
    const {url} = navState;

    if (
      url.startsWith(KAKAO_REDIRECT_URI) &&
      url.includes('code=') &&
      !alreadyHandled.current
    ) {
      alreadyHandled.current = true;

      const code = getQueryParam(url, 'code');

      webviewRef.current?.stopLoading();

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
    <View style={{flex: 1}}>
      <WebView
        ref={webviewRef}
        source={{uri: kakaoAuthUrl}}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled
        onShouldStartLoadWithRequest={request => {
          const {url} = request;
          if (url.startsWith(KAKAO_REDIRECT_URI)) {
            return false; // redirect URL로 이동하지 않음 (즉시 차단)
          }
          return true;
        }}
      />
    </View>
  );
}
