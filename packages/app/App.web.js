import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import RootNavigation from '@navigations/RootNavigation';
import {COLORS} from '@constants/colors';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';

const toastConfig = {
  success: props => <BasicToast {...props} />,
  error: props => <ErrorToast {...props} />,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.appFrame}>
          <RootNavigation />
        </View>
        <Toast config={toastConfig} />
        <GlobalAlertModal />
      </SafeAreaView>
    </SafeAreaProvider>
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
