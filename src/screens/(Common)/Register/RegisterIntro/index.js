import {View, TouchableOpacity, Text} from 'react-native';
import styles from './Intro.styles';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import React, {useState, useEffect} from 'react';

import KakaoLogo from '@assets/images/kakao_logo.svg';
import NaverLogo from '@assets/images/naver_logo.svg';
import Mail from '@assets/images/mail_black.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import ButtonWhite from '@components/ButtonWhite';
import Loading from '@components/Loading';

const RegisterIntro = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  const navigation = useNavigation();

  if (loading) {
    return <Loading title="로딩 중..." />;
  }
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
              onPress={() =>
                navigation.navigate('RegisterAgree', {user: 'USER'})
              }
              Icon={Mail}
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('RegisterAgree', {user: 'HOST'})
            }>
            <Text style={[styles.textGray]}>게스트하우스 호스트에요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterIntro;
