import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import {CommonActions, useNavigation} from '@react-navigation/native';
import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';
import {tryLogin} from '@utils/auth/login';
import {
  LOGIN_PROVIDERS,
  storeLastLoginProvider,
} from '@utils/auth/lastLoginProvider';

import styles from '../Login.styles';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import LogoOrange from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';

export default function LoginByEmail({route}) {
  const {t} = useTranslation();
  const userRole = route?.params?.userRole ?? 'USER';
  const navigation = useNavigation();
  const MainLogo = LogoOrange;
  const mainColor = COLORS.primary_orange;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    color: mainColor,
  });

  const handleMoveToRegister = () => {
    navigation.navigate('RegisterAgree', {user: userRole});
  };

  const moveToFindId = () => {
    navigation.navigate('FindIntro', {find: 'email', userRole});
  };

  const moveToFindPassword = () => {
    navigation.navigate('FindIntro', {find: 'password', userRole});
  };

  const getLoginUserRole = () => {
    // if (email.trim().toLowerCase().endsWith('@ddakji.kr')) {
    //   return 'ADMIN';
    // }

    return userRole;
  };

  const handleLogin = async () => {
    const nextUserRole = getLoginUserRole();

    try {
      await tryLogin(email, password, nextUserRole);
      if (nextUserRole !== 'ADMIN') {
        await storeLastLoginProvider(LOGIN_PROVIDERS.EMAIL);
      }
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'MainTabs'}],
        }),
      );
    } catch (error) {
      console.warn(`${userRole} 로그인 실패:`, error);
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          t('auth.anErrorOccurredWhileLoggingIn'),
        buttonText: t('common.confirm'),
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <MainLogo width={60} height={29} />
              <Text style={[styles.titleText]}>
                {t('auth.pleaseLogInWithYourEmail')}
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('common.email')}</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('auth.pleaseEnterYourEmail')}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    maxLength={30}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('common.pleaseEnterYourPassword')}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={password}
                    onChangeText={setPassword}
                    maxLength={20}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(prev => !prev)}>
                    {isPasswordVisible ? (
                      <HidePassword width={24} hide={24} />
                    ) : (
                      <ShowPassword width={24} hide={24} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.bottomSection}>
            <View>
              <View style={styles.buttonSection}>
                <ButtonWhite
                  title={t('common.logIn')}
                  onPress={handleLogin}
                  backgroundColor={mainColor}
                  textColor={COLORS.grayscale_0}
                />

                <ButtonWhite
                  title={t('auth.signUpWithEmail')}
                  onPress={handleMoveToRegister}
                />
              </View>
            </View>
            <View style={styles.findSection}>
              <TouchableOpacity onPress={moveToFindId}>
                <Text style={styles.findText}>{t('auth.findId')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={moveToFindPassword}>
                <Text style={styles.findText}>
                  {t('auth.findYourPassword')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          color={mainColor}
          onPress={() => {
            setErrorModal(prev => ({...prev, visible: false}));
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
