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

import crashlytics from '@react-native-firebase/crashlytics';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const toastConfig = {
  success: props => <BasicToast {...props} />,
};

function AppContent() {
  const [appLoaded, setAppLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    tryAutoLogin();
    crashlytics().log('App mounted - Crashlytics initialized');
  }, []);

  if (!appLoaded) {
    return (
      <View style={styles.splash}>
        <LottieView
          source={require('@assets/lottie/splash.json')}
          style={{width: 180, height: 153}}
          autoPlay
          loop={false}
          onAnimationFinish={() => setAppLoaded(true)}
        />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={[
          styles.container,
          // ✅ 안드로이드에서만 하단 시스템 바 높이만큼 패딩
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
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
