import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { navigate } from './navigationService';

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
    
    try {
      const path = url.replace('workaway://', '');
      const parts = path.split('/'); 

      // 게하 디테일 화면
      if (parts[0] === 'guesthouse' && parts[1]) {
        const guesthouseId = parts[1];
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };

        const checkIn = formatDate(today);
        const checkOut = formatDate(tomorrow);
        const guestCount = 1;

        navigate('MainTabs', {
          screen: '게하',
          params: {
            screen: 'GuesthouseDetail',
            params: {
              id: guesthouseId,
              checkIn,
              checkOut,
              guestCount,
              isFromDeeplink: true,
            },
          },
        });
        console.log('게하 디테일 화면으로 이동');
      } 
      // 홈 화면 (예시)
      else if (parts[0] === 'exDeeplink' && parts[1]) {
        const id = parts[1];
        navigate('EXHome');
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
