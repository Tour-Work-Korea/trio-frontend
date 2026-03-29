import {View, TouchableOpacity, Text} from 'react-native';
import {useNavigation, CommonActions} from '@react-navigation/native';
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

import { tryKakaoLoginNative } from '@utils/auth/authFlow';

const LoginIntro = () => {
  const navigation = useNavigation();

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  const handleKakaoLoginClick = async () => {
    // 앱 유무를 파악하고 1초 만에 로그인하는 네이티브 통신
    const result = await tryKakaoLoginNative('USER');

    if (result.success) {
      if (result.isNewUser) {
        // 신규 유저: 약관 동의 화면으로 이동
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RegisterAgree',
              params: {
                user: 'USER',
                isSocial: true,
                externalId: result.externalId,
              },
            },
          ],
        });
      } else {
        // 기존 유저: 메인 화면으로 이동
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'MainTabs'}],
          }),
        );
      }
    } else {
      // 에러 발생 시 처리 (사용자가 도중에 취소한 경우는 제외)
      if (!result.message?.toLowerCase().includes('cancel')) {
        setErrorModal({
          visible: true,
          message: '카카오 로그인 중 오류가 발생했습니다.\n다시 시도해주세요.',
        });
      }
    }
  };

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
              onPress={handleKakaoLoginClick} 
              Icon={KakaoLogo}
              backgroundColor="#fee500"
            />
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