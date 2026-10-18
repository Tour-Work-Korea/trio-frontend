import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import RootNavigation from '@navigations/RootNavigation';
import {COLORS} from '@constants/colors';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';
import {tryAutoLogin} from '@utils/auth/login';
import useUserStore from '@stores/userStore';
import WebDownloadBanner from '@components/WebDownloadBanner';
import {I18nextProvider} from 'react-i18next';
import i18n from './src/i18n';
import useLocaleStore, {initializeLocale} from './src/stores/localeStore';

const LOGOUT_HOME_LOCK_KEY = '__TRIO_LOGOUT_HOME_LOCK__';

const PROTECTED_WEB_PATH_PREFIXES = [
  '/my',
  '/settings',
  '/community/write',
  '/guesthouse-payment',
  '/guesthouse-reservation',
  '/contents-payment',
  '/contents-reservation',
  '/employ/apply',
];

const PROTECTED_WEB_PATHS = new Set(['/guesthouses/reviews']);

const isProtectedWebPath = pathname => {
  const normalizedPath = pathname || '/';

  if (PROTECTED_WEB_PATHS.has(normalizedPath)) {
    return true;
  }

  return PROTECTED_WEB_PATH_PREFIXES.some(
    prefix =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
};

const toastConfig = {
  success: props => <BasicToast {...props} />,
  error: props => <ErrorToast {...props} />,
};

export default function App() {
  const localeInitialized = useLocaleStore(state => state.isInitialized);

  useEffect(() => {
    initializeLocale().catch(error => {
      if (__DEV__) {
        console.warn('locale initialization failed:', error?.message);
      }
    });
  }, []);

  useEffect(() => {
    if (!localeInitialized) {
      return;
    }

    const initializeAuth = async () => {
      const restored = await tryAutoLogin();
      const {accessToken, userRole} = useUserStore.getState();
      const isLoggedIn =
        restored ||
        Boolean(accessToken && (userRole === 'USER' || userRole === 'ADMIN'));

      if (
        typeof window !== 'undefined' &&
        !isLoggedIn &&
        isProtectedWebPath(window.location.pathname)
      ) {
        window.location.replace('/login');
      }
    };

    initializeAuth();
  }, [localeInitialized]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = () => {
      if (window.sessionStorage.getItem(LOGOUT_HOME_LOCK_KEY) !== '1') {
        return;
      }

      if (window.location.pathname !== '/') {
        window.history.replaceState({__trioLogoutHomeLock: true}, '', '/');
      }

      window.history.pushState({__trioLogoutHomeLock: true}, '', '/');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" />
          {localeInitialized ? (
            <>
              <View style={styles.appFrame}>
                <WebDownloadBanner />
                <RootNavigation />
              </View>
              <Toast config={toastConfig} />
              <GlobalAlertModal />
            </>
          ) : null}
        </SafeAreaView>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 'var(--trio-vh, 100dvh)',
    height: 'var(--trio-vh, 100dvh)',
    backgroundColor: COLORS.grayscale_100,
  },
  appFrame: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    height: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
});
