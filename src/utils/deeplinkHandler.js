import {useCallback, useEffect, useRef} from 'react';
import {Linking, Alert} from 'react-native';
import {navigate, reset, navigationRef} from './navigationService';
import useUserStore from '@stores/userStore';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const waitForNavigationReady = async () => {
  let tries = 0;

  while (!navigationRef.isReady() && tries < 100) {
    await wait(30);
    tries += 1;
  }

  return navigationRef.isReady();
};

const shouldRequireLogin = parts => parts[0] === 'reservation';

const getQueryParam = (searchParams, keys) => {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) {
      return value;
    }
  }

  return null;
};

const parseDeeplink = url => {
  const normalized = String(url || '').trim();
  const withoutScheme = normalized.replace(
    /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//,
    '',
  );
  const [pathPart = '', queryPart = ''] = withoutScheme.split('?');
  const rawPath = pathPart.replace(/^\/+|\/+$/g, '');
  const parts = rawPath ? rawPath.split('/').filter(Boolean) : [];
  const searchParams = new URLSearchParams(queryPart);

  return {
    parts,
    searchParams,
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
    {
      name: 'GuesthousePaymentReceipt',
      params: {reservationId, isFromDeeplink: true},
    },
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
    {
      name: 'MeetPaymentReceipt',
      params: {reservationId, isFromDeeplink: true},
    },
  ]);
};

const resetToEventThenDetail = (name, params) => {
  reset([
    {
      name: 'MainTabs',
      params: {
        screen: '콘텐츠',
        params: {screen: 'MeetMain'},
      },
    },
    {
      name,
      params: {
        ...params,
        isFromDeeplink: true,
      },
    },
  ]);
};

const resetToHomeThenDetail = (name, params) => {
  reset([
    {
      name: 'MainTabs',
      params: {
        screen: '홈',
        params: {screen: 'HomeMain'},
      },
    },
    {
      name,
      params: {
        ...params,
        isFromDeeplink: true,
      },
    },
  ]);
};

const DeeplinkHandler = () => {
  const accessToken = useUserStore(state => state.accessToken);
  const userRole = useUserStore(state => state.userRole);
  const promptingRef = useRef(false); // 중복 알림/네비게이션 가드

  const promptLogin = useCallback((message = '서비스 이용을 위해 로그인 해주세요.') => {
    if (promptingRef.current) {
      return;
    }

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
  }, []);

  const handleUrl = useCallback(async url => {
    console.log('딥링크 URL 받음:', url);

    try {
      const navReady = await waitForNavigationReady();
      if (!navReady) {
        console.warn('네비게이션 준비 전이라 딥링크 이동을 건너뜀', url);
        return;
      }

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
      // 스탭 공고 디테일 화면 (로그인 불필요)
      else if (parts[0] === 'employ' && parts[1]) {
        const employId = parts[1];

        resetToHomeThenDetail('EmployDetail', {
          id: employId,
        });
        console.log('스탭 공고 디테일 화면으로 이동');
      }
      // 이벤트 디테일 화면 (로그인 불필요)
      else if (parts[0] === 'party' && parts[1]) {
        const partyId =
          parts[1] === 'detail'
            ? getQueryParam(searchParams, ['partyId', 'id'])
            : parts[1];

        if (!partyId) {
          console.warn('partyId 누락', url);
          return;
        }

        resetToEventThenDetail('MeetDetail', {
          partyId,
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
  }, [accessToken, promptLogin, userRole]);

  // 최초 실행시 (앱이 딥링크로 켜질 때)
  useEffect(() => {
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleUrl(initialUrl);
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
  }, [handleUrl]);

  // 화면에 아무것도 렌더링 안 함
  return null;
};

export default DeeplinkHandler;
