import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Logo from '@assets/images/Logo.svg'; // svg이미지 불러오기
import styles from './Home.styles';
import ButtonScarlet from '@components/ButtonScarlet'; // 버튼 컴포넌트 불러오기
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header'; //헤더 컴포넌트 불러오기
import { FONTS } from '@constants/fonts'; // 폰트 크기, 볼드 지정해놓은거 불러오기

const EXHome = () => {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate('Login');
  }; // 화면 이동 예시 함수

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 불러오기 2가지 */}
      <Header />
      {/* <Header title="지원자 조회" /> */}
      <View style={styles.body}>
        <Logo width={100} height={100} />  {/* svg 이미지 */}
        <Text style={[FONTS.fs_h2_bold, styles.text]}>이 홈 화면은 예시 화면</Text> {/* 텍스트 크기,볼드 지정한거 사용 */}
      </View>
      <ButtonScarlet title="로그인 페이지로 이동" to="Login" /> {/* 버튼 컴포넌트 사용 */}
      <ButtonWhite title="하단바 있는 페이지로 이동" to="BottomTabs" />
    </SafeAreaView>
  );
};

export default EXHome;
