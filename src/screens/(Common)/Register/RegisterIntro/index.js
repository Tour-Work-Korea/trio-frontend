import {
  View,
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import styles from './Intro.styles';
import {useNavigation} from '@react-navigation/native';
// import KakaoLoginButton from '@assets/images/kakao_login_medium_wide.png';

// const UserRegisterIntro = () => {
//   const navigation = useNavigation();

//   const handleKakaoButton = () => {
//     navigation.navigate('SocialLogin');
//   };
//   const handleNaverButton = () => {
//     Alert.alert('네이버 회원가입 기능은 구현 중입니다.');
//   };
//   const handleEmailButton = () => {
//     navigation.navigate('UserRegisterAgree');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView style={[styles.body, FONTS.fs_h2]}>
//         <View style={styles.titleContainer}>
//           <Logo width={100} height={100} />
//         </View>
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={styles.kakaoButton}
//             onPress={handleKakaoButton}>
//             <Image source={KakaoLoginButton} resizeMode="contain" />
//           </TouchableOpacity>
//           <ButtonWhite title="네이버로 시작하기" onPress={handleNaverButton} />
//           <ButtonWhite title="이메일로 시작하기" onPress={handleEmailButton} />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default UserRegisterIntro;

import * as React from 'react';

import KakaoLogo from '@assets/images/kakao_logo.svg';
import NaverLogo from '@assets/images/naver_logo.svg';
import Mail from '@assets/images/mail_black.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import ButtonWhite from '@components/ButtonWhite';

const RegisterIntro = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoWithText width={143} />
        </View>
        <View style={styles.frameParent}>
          <View style={styles.buttonParent}>
            <ButtonWhite
              title="카카오로 시작하기"
              to="SocialLogin"
              Icon={KakaoLogo}
              backgroundColor="#fee500"
            />
            <ButtonWhite
              title="네이버로 시작하기"
              // to="UserRegisterAgree"
              Icon={NaverLogo}
              backgroundColor="#00de5a"
            />
            <ButtonWhite
              title="이메일로 시작하기"
              to="UserRegisterAgree"
              Icon={Mail}
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PhoneCertificate', {user: 'Host'})
            }>
            <Text style={[styles.textGray]}>게스트하우스 호스트에요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterIntro;
