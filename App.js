import 'react-native-reanimated';
import React, { useState, useEffect } from 'react';
import { AppState, Platform, StatusBar, StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';

import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';
import InAppNotificationBanner from '@components/InAppNotificationBanner';
import DeeplinkHandler from '@utils/deeplinkHandler';
import { COLORS } from '@constants/colors';
import { tryAutoLogin } from '@utils/auth/login';
import LottieView from 'lottie-react-native';
import { navigationRef } from '@utils/navigationService';
import messaging from '@react-native-firebase/messaging';
import { syncFcmToken, setupTokenRefreshListener } from '@utils/fcmService';
import { publishForegroundNotification } from '@utils/notifications';

import crashlytics from '@react-native-firebase/crashlytics';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';
import AlertModal from '@components/modals/AlertModal';
import LogoOrange from '@assets/images/meet_reservation_success.svg';
import useUserStore from '@stores/userStore';
import authApi from '@utils/api/authApi';
import { checkForceUpdate, openAppStoreForUpdate } from '@utils/appUpdate';
import { API_BASE_URL } from '@env';


const toastConfig = {
  success: props => <BasicToast {...props} />,
  error: props => <ErrorToast {...props} />,
};

function SplashOverlay({ onFinish }) {
  return (
    <View style={styles.splashOverlay}>
      <LottieView
        source={require('@assets/lottie/splash.json')}
        style={{ width: 180, height: 153 }}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
      />
    </View>
  );
}

const wait = ms => new Promise(r => setTimeout(r, ms));
const waitForNavReady = async () => {
  let tries = 0;
  while (!navigationRef.isReady() && tries < 100) {
    await wait(30);
    tries++;
  }
};

function AppContent() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [forceUpdateState, setForceUpdateState] = useState({
    visible: false,
    minVersion: '',
  });
  const insets = useSafeAreaInsets();
  const accessToken = useUserStore(state => state.accessToken);

  useEffect(() => {
    console.log('🚨 API_BASE_URL (runtime):', API_BASE_URL);

    const syncForceUpdateState = async () => {
      const result = await checkForceUpdate();

      setForceUpdateState({
        visible: result.shouldUpdate,
        minVersion: result.minVersion,
      });

      return result;
    };

    const bootstrap = async () => {
      try {
        await wait(120);
        await waitForNavReady();

        const forceUpdateResult = await syncForceUpdateState();

        if (forceUpdateResult.shouldUpdate) {
          return undefined;
        }

        // 1. 자동 로그인(토큰 갱신 등)을 먼저 수행
        await tryAutoLogin();

        // 2. 이후 FCM 토큰 동기화 및 갱신 리스너 등록 (로그인 여부에 따라 헤더 삽입 결정)
        await syncFcmToken();
        const unsubscribeTokenRefresh = setupTokenRefreshListener();

        return () => {
          if (unsubscribeTokenRefresh) {
            unsubscribeTokenRefresh();
          }
        };
      } finally {
        setAppLoaded(true); // 스플래시 제거
      }
    };

    bootstrap();
    crashlytics().log('App mounted - Crashlytics initialized');

    // 1. 포그라운드 메시지 리스너
    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      console.log('Foreground FCM message:', remoteMessage);
      publishForegroundNotification(remoteMessage);
    });

    // 2. 백그라운드 상태에서 알림 배너 터치 시 앱 진입 리스너
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Background FCM message tap:', remoteMessage);
      handleNotificationTap(remoteMessage);
    });

    // 3. 완전히 앱이 파괴(Killed)된 상태에서 탭하여 앱 부팅 시
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Killed FCM message tap:', remoteMessage);
        handleNotificationTap(remoteMessage);
      }
    });

    // 화면 이동을 처리해 주는 헬퍼 로직
    const handleNotificationTap = async (remoteMessage) => {
      // 내비게이션 레퍼런스가 활성화될 때까지 잠깐 대기
      let tries = 0;
      while (!navigationRef.isReady() && tries < 100) {
        await wait(30);
        tries++;
      }

      const { type } = remoteMessage.data || {};

      if (type === 'GUESTHOUSE_RESERVATION') {
        navigationRef.navigate('UserReservationCheck');
      } else if (type === 'PARTY_RESERVATION') {
        navigationRef.navigate('UserMeetReservationCheck');
      }
    };

    return () => {
      unsubscribeFCM();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (appState !== 'active' || !accessToken) {
      return undefined;
    }

    let cancelled = false;

    const sendHeartbeat = async () => {
      try {
        await authApi.heartbeat();
      } catch (error) {
        if (__DEV__ && !cancelled) {
          console.warn('heartbeat request failed:', error?.message);
        }
      }
    };

    sendHeartbeat();
    const intervalId = setInterval(sendHeartbeat, 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [appState, accessToken]);

  useEffect(() => {
    if (appState !== 'active') {
      return undefined;
    }

    let cancelled = false;

    const refreshForceUpdateState = async () => {
      const result = await checkForceUpdate();

      if (!cancelled) {
        setForceUpdateState({
          visible: result.shouldUpdate,
          minVersion: result.minVersion,
        });
      }
    };

    refreshForceUpdateState();

    return () => {
      cancelled = true;
    };
  }, [appState]);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={[
          styles.container,
          Platform.OS === 'android' && { paddingBottom: insets.bottom },
        ]}>
        <StatusBar
          translucent={false}
          backgroundColor={COLORS.grayscale_100}
          barStyle="dark-content"
        />

        <RootNavigation />
        <DeeplinkHandler />
      </SafeAreaView>

      {!appLoaded && (
        <SplashOverlay
          onFinish={() => {
            /* 부팅 로직 끝날 때 숨김 */
          }}
        />
      )}
      <InAppNotificationBanner />
      <Toast config={toastConfig} />

      <GlobalAlertModal />
      <AlertModal
        visible={forceUpdateState.visible}
        title="새로운 버전이 출시되었습니다!"
        message={`더욱 안정적인 서비스 이용을 위해\n최신 버전으로 업데이트가 필요합니다.\n\n최신 버전: V${forceUpdateState.minVersion}`}
        buttonText="업데이트 하기"
        onPress={openAppStoreForUpdate}
        onRequestClose={() => {}}
        iconElement={<LogoOrange width={180} height={150} />}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
