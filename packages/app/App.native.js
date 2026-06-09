import React, {useEffect, useState} from 'react';
import {
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';
import InAppNotificationBanner from '@components/InAppNotificationBanner';
import DeeplinkHandler from '@utils/deeplinkHandler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';
import LottieView from 'lottie-react-native';
import {navigationRef} from '@utils/navigationService';
import messaging from '@react-native-firebase/messaging';
import {syncFcmToken, setupTokenRefreshListener} from '@utils/fcmService';
import {
  openNotificationTarget,
  publishForegroundNotification,
} from '@utils/notifications';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';
import AlertModal from '@components/modals/AlertModal';
import LogoOrange from '@assets/images/meet_reservation_success.svg';
import useUserStore from '@stores/userStore';
import authApi from '@utils/api/authApi';
import {checkForceUpdate, openAppStoreForUpdate} from '@utils/appUpdate';
import {API_BASE_URL} from '@env';
import mobileAds from 'react-native-google-mobile-ads';

const toastConfig = {
  success: props => <BasicToast {...props} />,
  error: props => <ErrorToast {...props} />,
};

function SplashOverlay({onFinish}) {
  return (
    <View style={styles.splashOverlay}>
      <LottieView
        source={require('@assets/lottie/splash.json')}
        style={styles.splashAnimation}
        resizeMode="cover"
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
      />
    </View>
  );
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    mobileAds().initialize();
    console.log('API_BASE_URL (runtime):', API_BASE_URL);

    const syncForceUpdateState = async () => {
      const result = await checkForceUpdate();

      setForceUpdateState({
        visible: result.shouldUpdate,
        minVersion: result.minVersion,
      });

      return result;
    };

    const handleNotificationTap = async remoteMessage => {
      await waitForNavReady();
      await openNotificationTarget(remoteMessage.data || {});
    };

    let unsubscribeTokenRefresh;

    const bootstrap = async () => {
      try {
        await wait(120);
        await waitForNavReady();

        const forceUpdateResult = await syncForceUpdateState();

        if (forceUpdateResult.shouldUpdate) {
          return;
        }

        await tryAutoLogin();
        await syncFcmToken();
        unsubscribeTokenRefresh = setupTokenRefreshListener();
      } finally {
        setAppLoaded(true);
      }
    };

    bootstrap();
    crashlytics().log('App mounted - Crashlytics initialized');

    const unsubscribeFCM = messaging().onMessage(async remoteMessage => {
      console.log('Foreground FCM message:', remoteMessage);
      publishForegroundNotification(remoteMessage);
    });

    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Background FCM message tap:', remoteMessage);
        handleNotificationTap(remoteMessage);
      });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Killed FCM message tap:', remoteMessage);
          handleNotificationTap(remoteMessage);
        }
      });

    return () => {
      unsubscribeFCM();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeTokenRefresh?.();
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
    if (appState !== 'active' || !appLoaded) {
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
  }, [appState, appLoaded]);

  return (
    <>
      <View
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
        <DeeplinkHandler enabled={appLoaded && !forceUpdateState.visible} />
      </View>

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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AppContent />
      </SafeAreaView>
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
  splashAnimation: {
    width: '100%',
    height: '100%',
  },
});
