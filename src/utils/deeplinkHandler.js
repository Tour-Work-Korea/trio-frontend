import React, {useEffect, useRef} from 'react';
import {Linking, Alert} from 'react-native';
import {navigate, reset} from './navigationService';
import useUserStore from '@stores/userStore';

const deeplinkHandler = () => {
  const accessToken = useUserStore(state => state.accessToken);
  const userRole = useUserStore(state => state.userRole);
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
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [accessToken, userRole]);

  const shouldRequireLogin = parts => parts[0] === 'reservation';

  const promptLogin = (message = '서비스 이용을 위해 로그인 해주세요.') => {
    if (promptingRef.current) return;

    promptingRef.current = true;
    Alert.alert(
      '로그인이 필요합니다',
      message,
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
          promptingRef.current = false;
        },
      },
    );
  };

  const parseDeeplink = url => {
    const parsedUrl = new URL(url);
    const host = parsedUrl.host || '';
    const pathname = (parsedUrl.pathname || '').replace(/^\/+/, '');
    const rawPath = [host, pathname].filter(Boolean).join('/');
    const parts = rawPath ? rawPath.split('/') : [];

    return {
      parts,
      searchParams: parsedUrl.searchParams,
    };
  };

  const resetToGuesthouseReservationFlow = reservationId => {
    reset([
      {
        name: 'MainTabs',
        params: {
          screen: '마이',
          params: {screen: 'UserMyPage'},
        },
      },
      {name: 'UserReservationCheck'},
      {name: 'GuesthousePaymentReceipt', params: {reservationId}},
    ]);
  };

  const resetToPartyReservationFlow = reservationId => {
    reset([
      {
        name: 'MainTabs',
        params: {
          screen: '마이',
          params: {screen: 'UserMyPage'},
        },
      },
      {name: 'UserMeetReservationCheck'},
      {name: 'MeetPaymentReceipt', params: {reservationId}},
    ]);
  };

  const handleUrl = url => {
    console.log('딥링크 URL 받음:', url);

    try {
      const {parts, searchParams} = parseDeeplink(url);

      // 경로별 로그인 필요 여부 분리
      if (shouldRequireLogin(parts) && (!accessToken || userRole !== 'USER')) {
        const message =
          !accessToken
            ? '서비스 이용을 위해 로그인 해주세요.'
            : '유저 계정으로 로그인 후 이용해주세요.';
        promptLogin(message);
        return;
      }

      // 게하 디테일 화면 (로그인 불필요)
      if (parts[0] === 'guesthouse' && parts[1]) {
        const guesthouseId = parts[1];
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = date => {
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
        navigate('EXHome');
      }
      // 이벤트 디테일 화면 (로그인 불필요)
      else if (parts[0] === 'party' && parts[1]) {
        const partyId = parts[1];
        navigate('MeetDetail', {
          partyId: partyId,
          isFromDeeplink: true,
        });
        console.log('이벤트 디테일 화면으로 이동');
      }
      // 게하 예약내역 상세 (로그인 필요)
      else if (
        parts[0] === 'reservation' &&
        parts[1] === 'guesthouse' &&
        parts[2] === 'detail'
      ) {
        const reservationId = searchParams.get('reservationId');
        if (!reservationId) {
          console.warn('reservationId 누락', url);
          return;
        }
        resetToGuesthouseReservationFlow(reservationId);
      }
      // 이벤트 예약내역 상세 (로그인 필요)
      else if (
        parts[0] === 'reservation' &&
        parts[1] === 'party' &&
        parts[2] === 'detail'
      ) {
        const reservationId = searchParams.get('reservationId');
        if (!reservationId) {
          console.warn('reservationId 누락', url);
          return;
        }
        resetToPartyReservationFlow(reservationId);
      }
    } catch (e) {
      console.warn('딥링크 파싱 실패', e);
    }
  };

  // 화면에 아무것도 렌더링 안 함
  return null;
};

export default deeplinkHandler;
