import 'react-native-reanimated';
import React, {useState, useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View, Text} from 'react-native';
import RootNavigation from '@navigations/RootNavigation';
import 'react-native-gesture-handler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';
import LottieView from 'lottie-react-native';

const App = () => {
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    tryAutoLogin();
  }, []);

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
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.grayscale_0}
      />
      <RootNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default App;
