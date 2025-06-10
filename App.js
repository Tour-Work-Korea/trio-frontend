import 'react-native-reanimated';
import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import RootNavigation from '@navigations/RootNavigation';
import 'react-native-gesture-handler';
import {COLORS} from '@constants/colors';
import {tryAutoLogin} from '@utils/auth/login';

const App = () => {
  //자동 로그인
  useEffect(() => {
    const init = async () => {
      await tryAutoLogin();
    };
    init();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bb} />
      <RootNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default App;
