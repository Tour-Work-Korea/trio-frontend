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
import {useFocusEffect} from '@react-navigation/native';
import LogoBlue from '@assets/images/logo_blue_smile.svg';
import Logo from '@assets/images/logo_orange.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {COLORS} from '@constants/colors';
import {validateNewPassword} from '@utils/validation/registerValidation';
import ErrorModal from '@components/modals/ErrorModal';
import styles from '../Login.styles';

const FindPassword = ({route}) => {
  const {phoneNumber, userRole} = route.params;

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
          '오류가 발생했습니다\n다시 시도해주세요',
        buttonText: '확인',
        onPress: '',
      });
    }
  };

  if (success) {
    return (
      <View style={styles.signin}>
        <View style={styles.view}>
          <View style={styles.logoParent}>
            <LogoBlue width={168} />
            <Text style={styles.titleText}>비밀번호 설정이 완료되었어요</Text>
          </View>
          <ButtonScarlet title="로그인 하러가기" to="LoginIntro" />
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
              <Logo width={60} height={29} />
              <Text style={styles.titleText}>비밀번호를 재설정 해주세요!</Text>
              {/* 비밀번호 입력 */}
              <View style={styles.inputGroup}>
                {/* 비밀번호 필드 */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>비밀번호</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="비밀번호를 입력해주세요"
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
                      영문 대소문자 포함
                    </Text>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.hasNumber && styles.validText,
                      ]}>
                      숫자 포함
                    </Text>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.hasSpecialChar &&
                          styles.validText,
                      ]}>
                      특수문자 포함
                    </Text>
                    <Text
                      style={[
                        styles.validDefaultText,
                        formValid?.newPassword?.isLengthValid &&
                          styles.validText,
                      ]}>
                      8-20자 이내
                    </Text>
                  </View>
                </View>

                {/* 비밀번호 확인 필드 */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="다시 한 번 입력해주세요"
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
                      비밀번호 일치
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 제출 버튼 */}
            <View>
              <ButtonScarlet
                title="다음"
                onPress={handleSubmit}
                disabled={!isFormValid()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        <ErrorModal
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
