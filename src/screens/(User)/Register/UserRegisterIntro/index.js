import {View, Alert, SafeAreaView, ScrollView} from 'react-native';
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header';
import styles from './Intro.styles';
import {FONTS} from '@constants/fonts';
import Logo from '@assets/images/Logo.svg';
import {useNavigation} from '@react-navigation/native';

const UserRegisterIntro = () => {
  const navigation = useNavigation();

  const handleKakaoButton = () => {
    Alert.alert('카카오 회원가입 기능은 구현 중입니다.');
  };
  const handleNaverButton = () => {
    Alert.alert('네이버 회원가입 기능은 구현 중입니다.');
  };
  const handleEmailButton = () => {
    navigation.navigate('UserRegisterAgree');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={[styles.body, FONTS.fs_h2]}>
        <View style={styles.titleContainer}>
          <Logo width={100} height={100} />
        </View>
        <View style={styles.buttonContainer}>
          <ButtonWhite title="카카오로 시작하기" onPress={handleKakaoButton} />
          <ButtonWhite title="네이버로 시작하기" onPress={handleNaverButton} />
          <ButtonWhite title="이메일로 시작하기" onPress={handleEmailButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserRegisterIntro;
