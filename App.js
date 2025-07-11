import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View, Text} from 'react-native';
import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import 'react-native-gesture-handler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';

const App = () => {
  useEffect(() => {
    tryAutoLogin();
  }, []);

  const toastConfig = {
    success: (props) => <BasicToast {...props} />,
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.grayscale_0}
        />
        <RootNavigation />
      </SafeAreaView>
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default App;
