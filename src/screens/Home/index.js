import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@constants/colors';
import Logo from '@assets/images/Logo.svg';
import styles from './Home.styles';

const Home = () => {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bb} />
      <View style={styles.header}>
        <Text style={styles.title}>🧡 Welcome to Trio App</Text>
      </View>
      <View style={styles.body}>
        <Logo width={100} height={100} />
        <Text style={styles.text}>이 홈 화면은 COLORS 상수로 스타일링된 예시</Text>
        <Button title="로그인 페이지로 이동" onPress={goToLogin} />
      </View>
    </SafeAreaView>
  );
};

export default Home;
