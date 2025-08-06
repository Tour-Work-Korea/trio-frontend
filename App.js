import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import 'react-native-gesture-handler';

import RootNavigation from '@navigations/RootNavigation';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import DeeplinkHandler from '@utils/deeplinkHandler';

import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';
import LottieView from 'lottie-react-native';

import firebase from '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';
import {SafeAreaView} from 'react-native-safe-area-context';

const App = () => {
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    tryAutoLogin();
    crashlytics().log('App mounted - Crashlytics initialized');
  }, []);

  const toastConfig = {
    success: props => <BasicToast {...props} />,
  };

  if (!appLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <LottieView
          source={require('@assets/lottie/splash.json')}
          style={{width: 180, height: 153}}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            setAppLoaded(true);
          }}
        />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.grayscale_0}
        />
        <RootNavigation />
        <DeeplinkHandler />
      </SafeAreaView>
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
