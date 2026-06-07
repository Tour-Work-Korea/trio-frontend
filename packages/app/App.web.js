import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import RootNavigation from '@navigations/RootNavigation';
import {COLORS} from '@constants/colors';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.appFrame}>
          <RootNavigation />
        </View>
        <Toast />
        <GlobalAlertModal />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    height: '100vh',
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
