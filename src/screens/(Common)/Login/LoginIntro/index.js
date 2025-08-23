import {View, TouchableOpacity, Text} from 'react-native';
import styles from './Intro.styles';
import {useNavigation} from '@react-navigation/native';

import React, {useState} from 'react';

import KakaoLogo from '@assets/images/kakao_logo.svg';
import NaverLogo from '@assets/images/naver_logo.svg';
import Mail from '@assets/images/mail_black.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import ButtonWhite from '@components/ButtonWhite';
import ErrorModal from '@components/modals/ErrorModal';

const LoginIntro = () => {
  const navigation = useNavigation();

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoWithText width={143} />
        </View>
        <View style={styles.frameParent}>
          <View style={styles.buttonParent}>
            <ButtonWhite
              title="카카오로 시작하기"
              // to="SocialLogin"
              onPress={() =>
                setErrorModal({
                  visible: true,
                  message: '카카오 로그인 기능은\n구현 중입니다',
                })
              }
              Icon={KakaoLogo}
              backgroundColor="#fee500"
            />
            <ButtonWhite
              title="네이버로 시작하기"
              // to="UserRegisterAgree"
              onPress={() =>
                setErrorModal({
                  visible: true,
                  message: '네이버 로그인 기능은\n구현 중입니다',
                })
              }
              Icon={NaverLogo}
              backgroundColor="#00de5a"
            />
            <ButtonWhite
              title="이메일로 시작하기"
              onPress={() =>
                navigation.navigate('LoginByEmail', {userRole: 'USER'})
              }
              Icon={Mail}
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('LoginByEmail', {userRole: 'HOST'})
            }>
            <Text style={[styles.textGray]}>게스트하우스 호스트에요</Text>
          </TouchableOpacity>
        </View>
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={'확인'}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </View>
  );
};

export default LoginIntro;
