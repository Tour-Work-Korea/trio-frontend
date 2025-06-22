import React, { useEffect } from 'react';
import { Linking, Alert } from 'react-native';

const deeplinkHandler = () => {

  // 최초 실행시 (앱이 딥링크로 켜질 때)
  useEffect(() => {
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleUrl(initialUrl);
      }
    };

    checkInitialUrl();

    // 앱이 켜져있는 상태에서 새로 딥링크 들어올 때
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUrl = (url) => {
    console.log('딥링크 URL 받음:', url);
    Alert.alert('딥링크 수신', url);
    // 여기서 파라미터 파싱해서 화면 이동
  };

  // 화면에 아무것도 렌더링 안 함
  return null;
};

export default deeplinkHandler;
