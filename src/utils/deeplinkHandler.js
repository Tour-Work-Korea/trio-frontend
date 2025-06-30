import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const deeplinkHandler = () => {
  const navigation = useNavigation();

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
    
    try {
      const path = url.replace('workaway://', '');
      const parts = path.split('/');

      // 게하 디테일 화면
      if (parts[0] === 'guesthouse' && parts[1]) {
        const guesthouseId = parts[1];
        navigation.navigate('GuesthouseDetail', { id: guesthouseId });
        console.log('게하 디테일 화면으로 이동');
      } 
      // 홈 화면 (예시)
      else if (parts[0] === 'exDeeplink' && parts[1]) {
        const id = parts[1];
        navigation.navigate('EXHome');
      }
      // 다른 딥링크 패스 추가
    } catch (e) {
      console.warn('딥링크 파싱 실패', e);
    }
  };

  // 화면에 아무것도 렌더링 안 함
  return null;
};

export default deeplinkHandler;
