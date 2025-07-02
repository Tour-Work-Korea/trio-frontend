import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from '../../../(Common)/Register/Register.styles';
import Logo from '@assets/images/logo_orange.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {COLORS} from '@constants/colors';
import {validateRegisterProfile} from '@utils/validation/registerValidation';
import {FONTS} from '@constants/fonts';
import ErrorModal from '@components/modals/ErrorModal';

const UserRegisterProfile = () => {
  const route = useRoute();
  const {prevData} = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState(prevData);
  const [formValid, setFormValid] = useState({
    nickname: [],
    password: [],
    passwordConfirm: [],
  });
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameDuplicated, setISNicknameDuplicated] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const handleNicknameChange = text => {
    updateField('nickname', text);
    setIsNicknameChecked(false);
    const nextValid = {
      ...formValid,
      nickname: validateRegisterProfile({...formData, nickname: text}).nickname,
    };
    setFormValid(nextValid);
  };

  const handlePasswordChange = text => {
    updateField('password', text);
    const nextValid = {
      ...formValid,
      password: validateRegisterProfile({...formData, password: text}).password,
      passwordConfirm: {
        isMatched: text === formData.passwordConfirm,
      },
    };
    setFormValid(nextValid);
  };

  const handlePasswordConfirmChange = text => {
    updateField('passwordConfirm', text);
    setFormValid(prev => ({
      ...prev,
      passwordConfirm: {
        isMatched: text === formData.password,
      },
    }));
  };

  const updateField = (key, value) => {
    const updated = {...formData, [key]: value};
    setFormData(updated);
    setFormValid(validateRegisterProfile(updated));
  };

  const checkNicknameDuplicate = async () => {
    try {
      await authApi.checkNickname(formData.nickname);
      setIsNicknameChecked(true);
      setISNicknameDuplicated(false);
    } catch (error) {
      setIsNicknameChecked(false);
      setISNicknameDuplicated(true);
    }
  };

  const isFormValid = () => {
    const nicknameValid =
      formValid.nickname?.hasNoSpecialChars &&
      formValid.nickname?.isLengthValid &&
      isNicknameChecked;

    const passwordValid =
      formValid.password?.hasUpperLowercase &&
      formValid.password?.hasNumber &&
      formValid.password?.isLengthValid &&
      formValid.password?.hasSpecialChar;

    const confirmValid = formValid.passwordConfirm?.isMatched;

    return nicknameValid && passwordValid && confirmValid;
  };

  const handleSubmit = async () => {
    try {
      await authApi.userSignUp(formData);

      navigation.navigate('Result', {
        to: 'BottomTabs',
        nickname: formData.nickname,
        role: formData.userRole,
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '오류가 발생했습니다\n다시 시도해주세요',
        buttonText: '확인',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.viewFlexBox]}>
        {/* 상단+입력창 */}
        <View>
          {/* 로고 및 문구 */}
          <View style={styles.groupParent}>
            <Logo width={60} height={29} />
            <View>
              <Text style={[styles.titleText]}>
                workaway에서 활동하기 위한,
              </Text>
              <Text style={[styles.titleText]}>필수정보를 알려주세요</Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>닉네임</Text>
              <View style={[styles.inputBox, {position: 'relative'}]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="닉네임을 입력해주세요"
                  placeholderTextColor={COLORS.grayscale_400}
                  value={formData.nickname}
                  onChangeText={handleNicknameChange}
                  maxLength={10}
                />
                <TouchableOpacity
                  disabled={
                    !formValid.nickname?.hasNoSpecialChars ||
                    !formValid.nickname?.isLengthValid
                  }
                  style={[
                    styles.inputButtonAbsolute,
                    {
                      backgroundColor:
                        formValid.nickname?.hasNoSpecialChars &&
                        formValid.nickname?.isLengthValid
                          ? COLORS.primary_orange
                          : COLORS.grayscale_200,
                    },
                  ]}
                  onPress={checkNicknameDuplicate}>
                  <Text
                    style={{
                      ...FONTS.fs_14_medium,
                      color:
                        formValid.nickname?.hasNoSpecialChars &&
                        formValid.nickname?.isLengthValid
                          ? COLORS.white
                          : COLORS.grayscale_400,
                    }}>
                    중복확인
                  </Text>
                </TouchableOpacity>
              </View>
              {isNicknameChecked ? (
                <View style={styles.validBox}>
                  <Text
                    style={[
                      styles.validDefaultText,
                      !isNicknameDuplicated
                        ? styles.validText
                        : styles.invalidText,
                    ]}>
                    {!isNicknameDuplicated
                      ? '사용가능한 닉네임입니다'
                      : '이미 있는 닉네임입니다. 다른 닉네임을 입력해주세요.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.validBox}>
                  <Text
                    style={[
                      styles.validDefaultText,
                      formValid.nickname?.hasNoSpecialChars
                        ? styles.validText
                        : '',
                    ]}>
                    특수문자 제외
                  </Text>
                  <Text
                    style={[
                      styles.validDefaultText,
                      formValid.nickname?.isLengthValid ? styles.validText : '',
                    ]}>
                    2-10자 내외
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor={COLORS.grayscale_400}
                  value={formData.password}
                  onChangeText={handlePasswordChange}
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
              <View style={styles.validBox}>
                <Text
                  style={[
                    styles.validDefaultText,
                    formValid.password.hasUpperLowercase
                      ? styles.validText
                      : '',
                  ]}>
                  영문 대소문자 포함
                </Text>
                <Text
                  style={[
                    styles.validDefaultText,
                    formValid.password.hasNumber ? styles.validText : '',
                  ]}>
                  숫자 포함
                </Text>
                <Text
                  style={[
                    styles.validDefaultText,
                    formValid.password.hasSpecialChar ? styles.validText : '',
                  ]}>
                  특수문자 포함
                </Text>
                <Text
                  style={[
                    styles.validDefaultText,
                    formValid.password.isLengthValid ? styles.validText : '',
                  ]}>
                  8-20자 이내
                </Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="다시 한 번 입력해주세요"
                  placeholderTextColor={COLORS.grayscale_400}
                  value={formData.passwordConfirm}
                  onChangeText={handlePasswordConfirmChange}
                  maxLength={10}
                  secureTextEntry={!isPasswordCheckVisible}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordCheckVisible(prev => !prev)}>
                  {isPasswordCheckVisible ? (
                    <HidePassword width={24} hide={24} />
                  ) : (
                    <ShowPassword width={24} hide={24} />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.validBox}>
                <Text
                  style={[
                    styles.validDefaultText,
                    formValid.passwordConfirm.isMatched ? styles.validText : '',
                  ]}>
                  비밀번호 일치
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View>
          <ButtonScarlet
            title="다음"
            onPress={handleSubmit}
            disabled={!isFormValid()}
          />
        </View>
      </View>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </SafeAreaView>
  );
};

export default UserRegisterProfile;
