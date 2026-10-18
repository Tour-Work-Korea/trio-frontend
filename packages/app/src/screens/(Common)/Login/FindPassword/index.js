import {useTranslation} from 'react-i18next';
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import {validateNewPassword} from '@utils/validation/registerValidation';
import AlertModal from '@components/modals/AlertModal';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';

import LogoSmile from '@assets/images/logo_blue_smile.svg';
import Logo from '@assets/images/logo_orange.svg';
import LogoOrange from '@assets/images/logo_orange.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import {COLORS} from '@constants/colors';
import styles from '../Login.styles';

const FindPassword = ({route}) => {
  const {t} = useTranslation();
  const {phoneNumber, updateProfile} = route.params;
  const userRole = 'USER';
  const editProfileRoute = 'UserEditInfo';
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [formValid, setFormValid] = useState({
    newPassword: {
      hasUpperLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      isLengthValid: false,
    },
    confirmPassword: {
      isMatched: false,
    },
  });

  const MainLogo = LogoOrange;
  const mainColor = COLORS.primary_orange;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    onPress: '',
  });

  useFocusEffect(
    useCallback(() => {
      setFormData({
        newPassword: '',
        confirmPassword: '',
      });
      setFormValid({
        newPassword: {
          hasUpperLowercase: false,
          hasNumber: false,
          hasSpecialChar: false,
          isLengthValid: false,
        },
        confirmPassword: {
          isMatched: false,
        },
      });
      setIsPasswordVisible(false);
      setIsPasswordCheckVisible(false);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
        onPress: '',
      });
      setSuccess(false);
    }, []),
  );

  const handlePasswordChange = text => {
    const updated = {...formData, newPassword: text};
    setFormData(updated);
    setFormValid(validateNewPassword(updated));
  };

  const handlePasswordConfirmChange = text => {
    const updated = {...formData, confirmPassword: text};
    setFormData(updated);
    setFormValid(validateNewPassword(updated));
  };

  const isFormValid = () => {
    const pwValid = Object.values(formValid?.newPassword || {}).every(Boolean);
    const pwMatch = formValid?.confirmPassword?.isMatched;
    return pwValid && pwMatch;
  };

  const handleSubmit = async () => {
    try {
      await authApi.findPassword({
        ...formData,
        phoneNum: phoneNumber,
        role: userRole,
      });
      setSuccess(true);
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          t('common.anErrorOccurredPleaseTryAgain'),

        buttonText: t('common.confirm'),
        onPress: '',
      });
    }
  };

  const handleGoProfile = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1, // 두 번째 라우트(EditProfile)가 활성화되도록
        routes: [
          {
            name: 'MainTabs',
            params: {screen: '마이'}, // 탭 네임에 맞게
          },
          {
            name: editProfileRoute,
          },
        ],
      }),
    );
  };

  const handleGoLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'LoginIntro'}],
      }),
    );
  };

  if (success) {
    return (
      <View style={styles.signin}>
        <View style={styles.view}>
          <View style={styles.logoParent}>
            <LogoSmile width={168} />
            <Text style={styles.titleText}>
              {t('auth.passwordSettingIsComplete')}
            </Text>
          </View>
          {updateProfile ? (
            <ButtonScarlet
              title={t('auth.backToProfile')}
              onPress={handleGoProfile}
            />
          ) : (
            <ButtonScarlet
              title={t('auth.goToLogIn_983e98')}
              onPress={handleGoLogin}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}>
          <View style={styles.viewFlexBox} keyboardShouldPersistTaps="handled">
            {/* 헤더 */}
            <View style={styles.groupParent}>
              <View style={styles.titleContainer}>
                <MainLogo width={60} height={29} />
              </View>
              <Text style={styles.titleText}>
                {t('auth.pleaseResetYourPassword')}
              </Text>
              {/* 비밀번호 입력 */}
              <View style={styles.inputGroup}>
                {/* 비밀번호 필드 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('common.pleaseEnterYourPassword')}
                      placeholderTextColor={COLORS.grayscale_400}
                      value={formData.newPassword}
                      onChangeText={handlePasswordChange}
                      maxLength={20}
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                    />

                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(prev => !prev)}>
                      {isPasswordVisible ? (
                        <HidePassword width={24} height={24} />
                      ) : (
                        <ShowPassword width={24} height={24} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.validBox}>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.hasUpperLowercase &&
                          styles.validText,
                      ]}>
                      {t('common.includesUppercaseAndLowercaseLetters')}
                    </Text>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.hasNumber && styles.validText,
                      ]}>
                      {t('common.containsNumbers')}
                    </Text>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.hasSpecialChar &&
                          styles.validText,
                      ]}>
                      {t('common.containsSpecialCharacters')}
                    </Text>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.isLengthValid &&
                          styles.validText,
                      ]}>
                      {t('common.820CharactersOrLess')}
                    </Text>
                  </View>
                </View>

                {/* 비밀번호 확인 필드 */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('common.pleaseEnterAgain')}
                      placeholderTextColor={COLORS.grayscale_400}
                      value={formData.confirmPassword}
                      onChangeText={handlePasswordConfirmChange}
                      maxLength={20}
                      secureTextEntry={!isPasswordCheckVisible}
                    />

                    <TouchableOpacity
                      onPress={() => setIsPasswordCheckVisible(prev => !prev)}>
                      {isPasswordCheckVisible ? (
                        <HidePassword width={24} height={24} />
                      ) : (
                        <ShowPassword width={24} height={24} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.validBox}>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.confirmPassword?.isMatched &&
                          styles.validText,
                      ]}>
                      {t('common.passwordMatch')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 제출 버튼 */}
            <View>
              <ButtonWhite
                title={t('common.next')}
                onPress={handleSubmit}
                disabled={!isFormValid()}
                backgroundColor={mainColor}
                textColor={COLORS.grayscale_0}
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default FindPassword;
