import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import 'react-native-gesture-handler';

import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';
import DeeplinkHandler from '@utils/deeplinkHandler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';
import LottieView from 'lottie-react-native';
import {navigationRef} from '@utils/navigationService';

import crashlytics from '@react-native-firebase/crashlytics';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LoginErrorModal from '@components/LoginErrorModal';



const toastConfig = {
  success: props => <BasicToast {...props} />,
  error: props => <ErrorToast {...props} />,
};

function SplashOverlay({onFinish}) {
  return (
    <View style={styles.splashOverlay}>
      <LottieView
        source={require('@assets/lottie/splash.json')}
        style={{width: 180, height: 153}}
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
        await tryAutoLogin();
      } finally {
        setAppLoaded(true); // 스플래시 제거
      }
    };

    bootstrap();
    crashlytics().log('App mounted - Crashlytics initialized');
  }, []);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={[
          styles.container,
          Platform.OS === 'android' && {paddingBottom: insets.bottom},
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

      <LoginErrorModal />
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
