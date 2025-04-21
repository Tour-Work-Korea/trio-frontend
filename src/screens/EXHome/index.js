import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Logo from '@assets/images/Logo.svg'; // svg이미지 불러오기
import styles from './Home.styles';
import ButtonScarlet from '@components/ButtonScarlet'; // 버튼 컴포넌트 불러오기
import ButtonWhite from '@components/ButtonWhite';

const EXHome = () => {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate('Login');
  }; // 화면 이동 예시 함수

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧡 Welcome to Trio App</Text>
      </View>
      <View style={styles.body}>
        <Logo width={100} height={100} />  {/* svg 이미지 */}
        <Text style={styles.text}>이 홈 화면은 예시 화면</Text>
      </View>
      <ButtonScarlet title="로그인 페이지로 이동" to="Login" /> {/* 버튼 컴포넌트 사용 */}
      <ButtonWhite title="하단바 있는 페이지로 이동" to="BottomTabs" />
    </SafeAreaView>
  );
};

export default EXHome;
