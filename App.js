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

    // 포그라운드 메시지 리스너
    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      console.log('Foreground FCM message:', remoteMessage);
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || '알림',
        text2: remoteMessage.notification?.body || '새로운 알림이 도착했습니다.',
        position: 'top',
        topOffset: 60,
      });
    });

    return () => {
      unsubscribeFCM();
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
