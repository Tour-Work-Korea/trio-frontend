import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {validateRegisterProfile} from '@utils/validation/registerValidation';
import AlertModal from '@components/modals/AlertModal';
import {storeLoginTokens, tryLogin} from '@utils/auth/login';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import styles from './UserRegisterProfile.styles';
import Logo from '@assets/images/logo_orange.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const UserRegisterProfile = () => {
  const route = useRoute();
  const {prevData} = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState(prevData);
  const isSocialSignUp = !!formData?.isSocial;
  const [formValid, setFormValid] = useState({
    nickname: [],
    password: [],
    passwordConfirm: [],
  });
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameDuplicated, setISNicknameDuplicated] = useState(true);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    onPress: '',
  });

  const [pendingAfterLogin, setPendingAfterLogin] = useState(false);
  const [isIntegrationNoticeShown, setIsIntegrationNoticeShown] =
    useState(false);
  const {
    scrollRef,
    contentContainerStyle: keyboardAwareContentStyle,
    registerInput,
  } = useKeyboardAwareScrollView({
    basePaddingBottom: 32,
    extraScrollOffset: 80,
  });
  const nicknameField = registerInput('nickname');
  const passwordField = registerInput('password');
  const passwordConfirmField = registerInput('passwordConfirm');
  const nameField = registerInput('name');
  const birthdayField = registerInput('birthday');

  useEffect(() => {
    if (pendingAfterLogin) {
      afterSuccessRegister();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAfterLogin]);

  useFocusEffect(
    useCallback(() => {
      setFormData(prevData);
      setFormValid({
        nickname: [],
        password: [],
        passwordConfirm: [],
      });
      setIsNicknameChecked(false);
      setISNicknameDuplicated(true);
      setNicknameCheckMessage('');
      setIsPasswordVisible(false);
      setIsPasswordCheckVisible(false);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
        onPress: '',
      });
      setPendingAfterLogin(false);
      setIsIntegrationNoticeShown(false);
    }, [prevData]),
  );

  const handleNicknameChange = text => {
    updateField('nickname', text);
    setIsNicknameChecked(false);
    setNicknameCheckMessage('');
    const nextValid = {
      ...formValid,
      nickname: validateRegisterProfile({...formData, nickname: text}).nickname,
    };
    setFormValid(nextValid);
  };

  const handleNameChange = text => {
    updateField('name', text);
  };

  const handleBirthdayChange = text => {
    const filtered = text.replace(/[^0-9]/g, '').slice(0, 8);
    const formatted = filtered
      .replace(/^(\d{4})(\d)/, '$1-$2')
      .replace(/^(\d{4}-\d{2})(\d)/, '$1-$2');
    updateField('birthday', formatted);
  };

  const handleGenderChange = gender => {
    updateField('gender', gender);
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
      const response = await authApi.checkNickname(formData.nickname);
      setIsNicknameChecked(true);
      setISNicknameDuplicated(false);
      setNicknameCheckMessage(response?.data || '사용가능한 닉네임입니다');
    } catch (error) {
      setIsNicknameChecked(true);
      setISNicknameDuplicated(true);
      setNicknameCheckMessage(
        error.response?.data?.message ||
          '이미 있는 닉네임입니다. 다른 닉네임을 입력해주세요.',
      );
    }
  };

  const isFormValid = () => {
    const nicknameValid =
      formValid.nickname?.hasNoSpecialChars &&
      formValid.nickname?.isLengthValid &&
      isNicknameChecked &&
      !isNicknameDuplicated;

    const passwordValid =
      formValid.password?.hasUpperLowercase &&
      formValid.password?.hasNumber &&
      formValid.password?.isLengthValid &&
      formValid.password?.hasSpecialChar;

    const confirmValid = formValid.passwordConfirm?.isMatched;

    if (isSocialSignUp) {
      const nameValid = !!formData.name?.trim();
      const birthdayValid = /^\d{4}-\d{2}-\d{2}$/.test(
        formData.birthday || '',
      );
      const genderValid = formData.gender === 'M' || formData.gender === 'F';

      return nameValid && birthdayValid && genderValid;
    }

    return nicknameValid && passwordValid && confirmValid;
  };

  const handleSubmit = async () => {
    try {
      if (isSocialSignUp) {
        const payload = {
          provider: formData.provider,
          socialSignupToken: formData.socialSignupToken,
          userRole: formData.userRole,
          phoneNum: formData.phoneNum,
          name: formData.name,
          birthday: formData.birthday,
          gender: formData.gender,
          agreements: formData.agreements,
        };

        const res = await authApi.completeSocialSignUp(payload);
        const {accessToken, refreshToken} = res.data || {};

        if (!accessToken || !refreshToken) {
          throw new Error('소셜 회원가입 토큰 응답이 비어있습니다.');
        }

        await storeLoginTokens({
          accessToken,
          refreshToken,
          userRole: 'USER',
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'MainTabs', params: {screen: '홈'}}],
          }),
        );
        return;
      }

      const payload = {
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        nickname: formData.nickname,
        userRole: formData.userRole,
        phoneNum: formData.phoneNum,
        agreements: formData.agreements,
      };

      /**
       * 기존 NICE 기반 가입 완료:
       * - niceAuthToken을 /auth/user/signup/complete로 전달
       *
       * 새 일반 USER 가입:
       * - PhoneCertificate에서 SMS USER + SIGN_UP 인증 완료
       * - phoneNum을 /auth/user/signup으로 전달
       */
      await authApi.userSignUp(payload);
      afterSuccessRegister();
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error.response?.data?.message ||
          '오류가 발생했습니다\n다시 시도해주세요',
        buttonText: '확인',
        onPress: '',
      });
    }
  };

  const afterSuccessRegister = async () => {
    // 소셜 로그인 연동 안내
    if (formData?.isIntegration && !isIntegrationNoticeShown) {
      setIsIntegrationNoticeShown(true);

      const platforms = (formData?.socialTypes || []).join(', ') || '소셜';
      setErrorModal({
        visible: true,
        message: `이미 존재하는 계정과 회원 정보를 연동합니다.\n연동 플랫폼 : ${platforms}`,
        buttonText: '확인',
        onPress: 'integrationConfirm',
      });

      return;
    }
    if (formData?.isIntegration && !pendingAfterLogin) {
      return;
    }

    // 자동 로그인
    const isSuccessLogin = await tryLogin(
      formData.email,
      formData.password,
      'USER',
    );

    if (isSuccessLogin) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {name: 'MainTabs', params: {screen: '홈'}},
            {
              name: 'Result',
              params: {
                nickname: formData.nickname,
                role: formData.userRole,
                onPress: () =>
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'MainTabs', params: {screen: '홈'}}],
                    }),
                  ),
              },
            },
          ],
        }),
      );
    } else {
      setErrorModal({
        visible: true,
        message: '자동 로그인에 실패했습니다\n로그인 페이지로 이동합니다',
        buttonText: '확인',
        onPress: 'moveToLogin',
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={[styles.viewFlexBox]}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardAwareContentStyle,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled">
          {/* 상단+입력창 */}
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <Logo width={60} height={29} />
              <View>
                <Text style={[styles.titleText]}>
                  게딱지에서 활동하기 위한,
                </Text>
                <Text style={[styles.titleText]}>필수정보를 알려주세요</Text>
              </View>
            </View>
            <View style={styles.inputGroup}>
              {isSocialSignUp && (
                <>
                  <View
                    style={styles.inputContainer}
                    onLayout={nameField.onLayout}>
                    <Text style={styles.inputLabel}>이름</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="이름을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.name}
                        onChangeText={handleNameChange}
                        onFocus={nameField.onFocus}
                        maxLength={20}
                      />
                    </View>
                  </View>

                  <View
                    style={styles.inputContainer}
                    onLayout={birthdayField.onLayout}>
                    <Text style={styles.inputLabel}>생년월일</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.birthday}
                        onChangeText={handleBirthdayChange}
                        onFocus={birthdayField.onFocus}
                        keyboardType="number-pad"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>성별</Text>
                    <View style={styles.genderGroup}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.genderButton,
                          formData.gender === 'F' && styles.genderButtonActive,
                        ]}
                        onPress={() => handleGenderChange('F')}>
                        <Text
                          style={[
                            styles.genderButtonText,
                            formData.gender === 'F' &&
                              styles.genderButtonTextActive,
                          ]}>
                          여성
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.genderButton,
                          formData.gender === 'M' && styles.genderButtonActive,
                        ]}
                        onPress={() => handleGenderChange('M')}>
                        <Text
                          style={[
                            styles.genderButtonText,
                            formData.gender === 'M' &&
                              styles.genderButtonTextActive,
                          ]}>
                          남성
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {!isSocialSignUp && (
                <View
                  style={styles.inputContainer}
                  onLayout={nicknameField.onLayout}>
                  <Text style={styles.inputLabel}>닉네임</Text>
                  <View style={[styles.inputBox, styles.inputRelative]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="닉네임을 입력해주세요"
                      placeholderTextColor={COLORS.grayscale_400}
                      value={formData.nickname}
                      onChangeText={handleNicknameChange}
                      onFocus={nicknameField.onFocus}
                      maxLength={10}
                    />
                    <TouchableOpacity
                      activeOpacity={1}
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
                              ? COLORS.grayscale_0
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
                        {nicknameCheckMessage}
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
                          formValid.nickname?.isLengthValid
                            ? styles.validText
                            : '',
                        ]}>
                        2-10자 내외
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {!isSocialSignUp && (
                <>
                  <View
                    style={styles.inputContainer}
                    onLayout={passwordField.onLayout}>
                    <Text style={styles.inputLabel}>비밀번호</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="비밀번호를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.password}
                        onChangeText={handlePasswordChange}
                        onFocus={passwordField.onFocus}
                        maxLength={20}
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        activeOpacity={1}
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
                          formValid.password.hasNumber
                            ? styles.validText
                            : '',
                        ]}>
                        숫자 포함
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.hasSpecialChar
                            ? styles.validText
                            : '',
                        ]}>
                        특수문자 포함
                      </Text>
                      <Text
                        style={[
                          styles.validDefaultText,
                          formValid.password.isLengthValid
                            ? styles.validText
                            : '',
                        ]}>
                        8-20자 이내
                      </Text>
                    </View>
                  </View>
                  <View
                    style={styles.inputContainer}
                    onLayout={passwordConfirmField.onLayout}>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="다시 한 번 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.passwordConfirm}
                        onChangeText={handlePasswordConfirmChange}
                        onFocus={passwordConfirmField.onFocus}
                        maxLength={20}
                        secureTextEntry={!isPasswordCheckVisible}
                      />
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() =>
                          setIsPasswordCheckVisible(prev => !prev)
                        }>
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
                          formValid.passwordConfirm.isMatched
                            ? styles.validText
                            : '',
                        ]}>
                        비밀번호 일치
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
          <View>
            <ButtonScarlet
              title="다음"
              onPress={handleSubmit}
              disabled={!isFormValid()}
            />
          </View>
        </ScrollView>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={() => {
            if (errorModal.onPress === 'integrationConfirm') {
              setErrorModal(prev => ({...prev, visible: false}));
              setPendingAfterLogin(true);
              return;
            }
            if (errorModal.onPress === 'moveToLogin') {
              setErrorModal(prev => ({...prev, visible: false}));
              navigation.navigate('LoginIntro');
              return;
            } else {
              setErrorModal(prev => ({...prev, visible: false}));
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserRegisterProfile;
