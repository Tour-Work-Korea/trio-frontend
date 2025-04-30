import {View, Text, SafeAreaView, ScrollView} from 'react-native';
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header';
import styles from './Intro.styles';
import {FONTS} from '@constants/fonts';
import Logo from '@assets/images/Logo.svg';
// 유저 회원가입 초기 페이지
const Intro = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={[styles.body, FONTS.fs_h2]}>
        <View style={styles.titleContainer}>
          <Logo width={100} height={100} />
        </View>
        <View style={styles.buttonContainer}>
          <ButtonWhite title="카카오로 시작하기" to="UserRegisterAgree" />
          <ButtonWhite title="네이버로 시작하기" to="UserRegisterAgree" />
          <ButtonWhite title="이메일로 시작하기" to="UserRegisterAgree" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Intro;
