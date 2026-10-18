import {useTranslation} from 'react-i18next';
import {View, TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';

import Loading from '@components/Loading';
import AlertModal from '@components/modals/AlertModal';

import styles from './Intro.styles';
import KakaoLogo from '@assets/images/kakao_logo.svg';
import NaverLogo from '@assets/images/naver_logo.svg';
import Mail from '@assets/images/mail_black.svg';
import LogoWithText from '@assets/images/logo_orange_with_text.svg';
import ButtonWhite from '@components/ButtonWhite';

const RegisterIntro = () => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  const navigation = useNavigation();

  if (loading) {
    return <Loading title={t('common.loading')} />;
  }
  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoWithText width={143} />
        </View>
        <View style={styles.frameParent}>
          <View style={styles.buttonParent}>
            {/**<ButtonWhite
               title="카카오로 시작하기"
               // to="SocialLogin"
               onPress={() =>
                 setErrorModal({
                   visible: true,
                   message: '카카오 회원가입 기능은\n구현 중입니다',
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
                   message: '네이버 회원가입 기능은\n구현 중입니다',
                 })
               }
               Icon={NaverLogo}
               backgroundColor="#00de5a"
              />**/}
            <ButtonWhite
              title={t('common.getStartedWithEmail')}
              onPress={() =>
                navigation.navigate('RegisterAgree', {user: 'USER'})
              }
              Icon={Mail}
            />
          </View>
        </View>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={t('common.confirm')}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </View>
  );
};

export default RegisterIntro;
