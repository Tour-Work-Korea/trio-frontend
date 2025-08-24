import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import 'react-native-gesture-handler';

import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import DeeplinkHandler from '@utils/deeplinkHandler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';
import LottieView from 'lottie-react-native';
import {navigationRef} from '@utils/navigationService';
import {CommonActions} from '@react-navigation/native';

import crashlytics from '@react-native-firebase/crashlytics';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const toastConfig = {
  success: props => <BasicToast {...props} />,
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
// 네비 준비 대기 (RootNavigation의 NavigationContainer가 ref에 연결될 때까지)
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
    const bootstrap = async () => {
      try {
        await wait(120);
        await waitForNavReady();
        const ok = await tryAutoLogin();
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: ok ? 'MainTabs' : 'Login'}],
          }),
        );
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
