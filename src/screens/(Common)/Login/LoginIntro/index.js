import {View, TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';

import styles from './LoginIntro.styles';
import KakaoLogo from '@assets/images/kakao_logo.svg';
import NaverLogo from '@assets/images/naver_logo.svg';
import MailBlue from '@assets/images/mail_fill_blue.svg';
import MailGray from '@assets/images/mail_fill_gray.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import { COLORS } from '@constants/colors';

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
            {/* <ButtonWhite
              title="카카오로 시작하기"
              onPress={() => navigation.navigate('SocialLogin', {provider: 'KAKAO'})}
              Icon={KakaoLogo}
              backgroundColor="#fee500"
            /> */}
            {/* <ButtonWhite
              title="네이버로 시작하기"
              onPress={() =>
                setErrorModal({
                  visible: true,
                  message: '네이버 로그인 기능은\n구현 중입니다',
                })
              }
              Icon={NaverLogo}
              backgroundColor="#00de5a"
            /> */}
            <ButtonWhite
              title="이메일로 시작하기"
              onPress={() =>
                navigation.navigate('LoginByEmail', {userRole: 'USER'})
              }
              Icon={MailGray}
              outlined={true}
              textColor={COLORS.grayscale_400}
              borderColor={COLORS.grayscale_400}
            />
            <ButtonWhite
              title="비즈니스 회원으로 시작하기"
              onPress={() =>
                navigation.navigate('LoginByEmail', {userRole: 'HOST'})
              }
              Icon={MailBlue}
              outlined={true}
              textColor={COLORS.primary_blue}
              borderColor={COLORS.primary_blue}
            />
          </View>
        </View>
        <AlertModal
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
