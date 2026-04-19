import 'react-native-reanimated';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';

import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';
import DeeplinkHandler from '@utils/deeplinkHandler';
import { COLORS } from '@constants/colors';
import { tryAutoLogin } from '@utils/auth/login';
import useUserStore from '@stores/userStore';
import LottieView from 'lottie-react-native';
import { navigationRef } from '@utils/navigationService';
import messaging from '@react-native-firebase/messaging';
import { syncFcmToken, setupTokenRefreshListener } from '@utils/fcmService';

import crashlytics from '@react-native-firebase/crashlytics';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';



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
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('🚨 API_BASE_URL (runtime):', process.env.API_BASE_URL);
    const bootstrap = async () => {
      try {
        await wait(120);
        await waitForNavReady();

        // 1. 자동 로그인(토큰 갱신 등)을 먼저 수행
        await tryAutoLogin();

        // 2. 이후 FCM 토큰 동기화 및 갱신 리스너 등록 (로그인 여부에 따라 헤더 삽입 결정)
        await syncFcmToken();
        const unsubscribeTokenRefresh = setupTokenRefreshListener();

        return () => {
          if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
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
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || '알림',
        text2: remoteMessage.notification?.body || '새로운 알림이 도착했습니다.',
        position: 'top',
        topOffset: 60,
        onPress: () => {
          handleNotificationTap(remoteMessage);
          Toast.hide();
        }
      });
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

      const { type, reservationId } = remoteMessage.data || {};
      const { userRole } = useUserStore.getState();

      if (type === 'GUESTHOUSE_RESERVATION') {
        if (userRole === 'HOST') {
          navigationRef.navigate('MyGuesthouseReservationDetail', { reservationId });
        } else {
          navigationRef.navigate('UserReservationCheck');
        }
      } else if (type === 'PARTY_RESERVATION') {
        if (userRole === 'HOST') {
          // TODO: 추후 사장님용 파티 예약 상세 화면이 만들어지면 예약 상세 컴포넌트로 연결하세요.
          // 현재는 백엔드에서 reservationId를 정상적으로 주지만 화면이 없어 앱만 실행되도록 둠
        } else {
          navigationRef.navigate('UserMeetReservationCheck');
        }
      }
    };

    return () => {
      unsubscribeFCM();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);

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
      <Toast config={toastConfig} />

      <GlobalAlertModal />
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
