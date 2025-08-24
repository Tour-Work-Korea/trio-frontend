import React, { useEffect, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import { navigate } from './navigationService';
import useUserStore from '@stores/userStore';

const deeplinkHandler = () => {
  const accessToken = useUserStore(state => state.accessToken);
  const promptingRef = useRef(false); // 중복 알림/네비게이션 가드

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
  }, [accessToken]);

  const handleUrl = (url) => {
    console.log('딥링크 URL 받음:', url);

    // 로그인 여부 확인
    if (!accessToken) {
      if (promptingRef.current) return; // 이미 알림 띄웠으면 무시
      promptingRef.current = true;
      Alert.alert(
        '로그인이 필요합니다',
        '서비스 이용을 위해 로그인 해주세요.',
        [
          {
            text: '확인',
            onPress: () => {
              navigate('Login');
              promptingRef.current = false;
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            // 뒤로가기/외부 터치로 닫힌 경우도 가드 해제
            promptingRef.current = false;
          },
        }
      );
      return;
    }
    
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

        navigate('GuesthouseDetail', {
          id: guesthouseId,
          checkIn,
          checkOut,
          guestCount,
          isFromDeeplink: true,
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
