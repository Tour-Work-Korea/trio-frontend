import {Platform, Text, TouchableOpacity, View} from 'react-native';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';

import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';

import styles from './LoginIntro.styles';
import KakaoLogo from '@assets/images/kakao_logo.svg';
import NaverLogo from '@assets/images/naver_logo.svg';
import GoogleLogo from '@assets/images/google_logo.svg';
import MailGray from '@assets/images/mail_fill_gray.svg';
import LogoIcon from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';
import {useTranslation} from 'react-i18next';
import useLocaleStore from '@stores/localeStore';

import {tryGoogleLoginNative, tryKakaoLoginNative} from '@utils/auth/login';
import {
  getLastLoginProvider,
  LOGIN_PROVIDERS,
  storeLastLoginProvider,
} from '@utils/auth/lastLoginProvider';

const LoginIntro = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const language = useLocaleStore(state => state.language);

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });
  const [lastLoginProvider, setLastLoginProvider] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      getLastLoginProvider()
        .then(provider => {
          if (isActive) {
            setLastLoginProvider(provider);
          }
        })
        .catch(() => {
          if (isActive) {
            setLastLoginProvider(null);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const renderLoginButton = (provider, button) => (
    <View style={styles.loginButtonWrapper}>
      {lastLoginProvider === provider ? (
        <View style={styles.recentBadge}>
          <Text style={styles.recentBadgeText}>{t('auth.lastLogin')}</Text>
          <View style={styles.recentBadgeTail} />
        </View>
      ) : null}
      {button}
    </View>
  );

  const handleKakaoLoginClick = async () => {
    if (Platform.OS === 'web') {
      navigation.navigate('SocialLogin', {provider: 'KAKAO'});
      return;
    }

    // 앱 유무를 파악하고 1초 만에 로그인하는 네이티브 통신
    const result = await tryKakaoLoginNative('USER');

    if (result.success) {
      if (result.isNewUser) {
        // 미연결 소셜 계정: 휴대폰 인증으로 기존 계정 연동/신규 가입 여부 확인
        navigation.navigate('PhoneCertificate', {
          user: 'USER',
          agreements: [],
          isSocial: true,
          provider: result.provider,
          socialSignupToken: result.socialSignupToken,
          socialProfile: result.socialProfile,
        });
      } else {
        await storeLastLoginProvider(LOGIN_PROVIDERS.KAKAO);
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
          message: t('auth.anErrorOccurredWhileLoggingIntoKakaoPleaseTryAgain'),
        });
      }
    }
  };

  const handleGoogleLoginClick = async () => {
    if (Platform.OS === 'web') {
      return;
    }

    const result = await tryGoogleLoginNative('USER');

    if (result.success) {
      if (result.isNewUser) {
        navigation.navigate('SocialOriginSelect', {
          user: 'USER',
          agreements: [],
          isSocial: true,
          provider: result.provider,
          socialSignupToken: result.socialSignupToken,
          socialProfile: result.socialProfile,
        });
      } else {
        await storeLastLoginProvider(LOGIN_PROVIDERS.GOOGLE);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'MainTabs'}],
          }),
        );
      }
      return;
    }

    if (!result.cancelled) {
      setErrorModal({
        visible: true,
        message: t('auth.anErrorOccurredWhileLoggingInToGooglePleaseTry'),
      });
    }
  };

  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <TouchableOpacity
          accessibilityLabel={t('language.title')}
          style={[
            styles.languageButton,
            language === 'en' && styles.englishLanguageButton,
          ]}
          onPress={() => navigation.navigate('Language')}>
          <Text style={styles.languageButtonText}>
            {language === 'ko' ? '한국어' : 'English'}
          </Text>
        </TouchableOpacity>
        <View style={styles.logoParent}>
          <LogoIcon width={120} height={120} />
        </View>
        <View style={styles.frameParent}>
          <View style={styles.buttonParent}>
            {renderLoginButton(
              LOGIN_PROVIDERS.KAKAO,
              <ButtonWhite
                title={t('auth.startWithKakao')}
                onPress={handleKakaoLoginClick}
                Icon={KakaoLogo}
                backgroundColor="#fee500"
              />,
            )}
            {Platform.OS !== 'web'
              ? renderLoginButton(
                  LOGIN_PROVIDERS.NAVER,
                  <ButtonWhite
                    title={t('auth.startWithNaver')}
                    onPress={() =>
                      navigation.navigate('SocialLogin', {provider: 'NAVER'})
                    }
                    Icon={NaverLogo}
                    backgroundColor="#03A94D"
                    textColor={COLORS.grayscale_0}
                  />,
                )
              : null}
            {Platform.OS !== 'web'
              ? renderLoginButton(
                  LOGIN_PROVIDERS.GOOGLE,
                  <ButtonWhite
                    title={t('auth.getStartedWithGoogle')}
                    onPress={handleGoogleLoginClick}
                    Icon={GoogleLogo}
                    backgroundColor={COLORS.grayscale_0}
                    textColor="#1F1F1F"
                    outlined={true}
                    borderColor="#747775"
                  />,
                )
              : null}
            {renderLoginButton(
              LOGIN_PROVIDERS.EMAIL,
              <ButtonWhite
                title={t('common.getStartedWithEmail')}
                onPress={() =>
                  navigation.navigate('LoginByEmail', {userRole: 'USER'})
                }
                Icon={MailGray}
                outlined={true}
                textColor={COLORS.grayscale_400}
                borderColor={COLORS.grayscale_400}
              />,
            )}
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

export default LoginIntro;
