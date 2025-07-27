import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import {validateHostRegister} from '@utils/validation/registerValidation';
import ErrorModal from '@components/modals/ErrorModal';
import ButtonScarlet from '@components/ButtonScarlet';
import {tryLogin} from '@utils/auth/login';

import styles from '../../(Common)/Register/Register.styles';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Logo from '@assets/images/logo_orange.svg';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';

const HostRegisterInfo = ({route}) => {
  const {agreements, email, phoneNumber} = route.params;
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    agreements,
    password: '',
    passwordConfirm: '',
    name: '',
    bussinessNum: '',
    email: email,
    userRole: 'HOST',
    phoneNum: phoneNumber,
  });
  const [formValid, setFormValid] = useState({
    name: false,
    bussinessNum: false,
    password: [],
    passwordConfirm: [],
  });
  const [isBussinessNumChecked, setIsBussinessNumChecked] = useState(false);
  const [isBussinessNumbVerified, setIsBussinessNumVerified] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
    onPress: '',
  });

  useFocusEffect(
    useCallback(() => {
      setFormData({
        password: '',
        passwordConfirm: '',
        name: '',
        bussinessNum: '',
        agreements,
        email: email, // props에서 받은 값 유지
        userRole: 'HOST',
        phoneNum: phoneNumber, // props에서 받은 값 유지
      });

      setFormValid({
        name: false,
        bussinessNum: false,
        password: [],
        passwordConfirm: [],
      });

      setIsBussinessNumChecked(false);
      setIsBussinessNumVerified(false);
      setIsPasswordVisible(false);
      setIsPasswordCheckVisible(false);
      setErrorModal({
        visible: false,
        message: '',
        buttonText: '',
        onPress: '',
      });
    }, [agreements, email, phoneNumber]),
  );

  const updateField = (key, value) => {
    const updated = {...formData, [key]: value};
    setFormData(updated);
    setFormValid(validateHostRegister(updated));
  };

  const handleNameChange = text => {
    updateField('name', text);
    setFormValid({
      ...formValid,
      name: validateHostRegister({...formData, name: text}).name,
    });
  };
  const handleBussinessNumChange = text => {
    updateField('bussinessNum', text);
    setIsBussinessNumChecked(false);
    setFormValid({
      ...formValid,
      bussinessNum: validateHostRegister({...formData, bussinessNum: text})
        .bussinessNum,
    });
  };
  const handlePasswordChange = text => {
    updateField('password', text);
    const nextValid = {
      ...formValid,
      password: validateHostRegister({...formData, password: text}).password,
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

  // 사업자등록번호 확인
  const verifybussinessNum = async () => {
    try {
      await authApi.verifyBusiness(formData.bussinessNum);
      setIsBussinessNumChecked(true);
      setIsBussinessNumVerified(true);
    } catch (error) {
      setIsBussinessNumChecked(false);
      setIsBussinessNumVerified(false);
      setErrorModal({
        visible: true,
        message: '유효하지 않은 사업자번호입니다',
        buttonText: '확인',
      });
    }
  };

  // 회원가입 완료 처리
  const handleSubmit = async () => {
    try {
      await authApi.hostSignUp(formData);
      navigation.navigate('Result', {
        onPress: afterSuccessRegister,
        buttonTitle: '시작하기',
        nickname: formData.name,
        role: 'HOST',
      });
      // afterSuccessRegister();
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error.response?.data?.message ||
          '오류가 발생했습니다\n다시 시도해주세요',
        buttonText: '확인',
      });
    }
  };

  //회원가입 후 자동 로그인 처리
  const afterSuccessRegister = async () => {
    try {
      await tryLogin(formData.email, formData.password, 'HOST');
      navigation.navigate('Result', {
        to: 'BottomTabs',
        nickname: formData.name,
        role: formData.userRole,
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '자동 로그인에 실패했습니다\n로그인 페이지로 이동합니다',
        buttonText: '확인',
        onPress: () => navigation.navigate('EXLogin'),
      });
      console.warn('지동 로그인 실패:', error);
    }
    // const isSuccessLogin = await tryLogin(
    //   formData.email,
    //   formData.password,
    //   'HOST',
    // );
    // if (isSuccessLogin) {
    //   navigation.navigate('Result', {
    //     to: 'BottomTabs',
    //     nickname: formData.name,
    //     role: formData.userRole,
    //   });
    // } else {
    //   setErrorModal({
    //     visible: true,
    //     message: '자동 로그인에 실패했습니다\n로그인 페이지로 이동합니다',
    //     buttonText: '확인',
    //     onPress: 'moveToLogin',
    //   });
    // }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // 필요 시 조정
        >
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.viewFlexBox}>
              {/* 상단+입력창 */}
              <View>
                {/* 로고 및 문구 */}
                <View style={styles.groupParent}>
                  <Logo width={60} height={29} />
                  <View>
                    <Text style={[styles.titleText]}>
                      workaway에 등록하기 위한,
                    </Text>
                    <Text style={[styles.titleText]}>
                      필수정보를 알려주세요
                    </Text>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>이름</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="이름을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.name}
                        onChangeText={handleNameChange}
                        maxLength={30}
                      />
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업자번호</Text>
                    <View style={[styles.inputBox, {position: 'relative'}]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="사업자번호를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.bussinessNum}
                        onChangeText={text => {
                          const filtered = text.replace(/[^0-9]/g, '');
                          handleBussinessNumChange(filtered);
                        }}
                        maxLength={10}
                        keyboardType="number-pad"
                      />
                      <TouchableOpacity
                        disabled={!formValid.bussinessNum}
                        style={[
                          styles.inputButtonAbsolute,
                          {
                            backgroundColor: formValid.bussinessNum
                              ? COLORS.primary_orange
                              : COLORS.grayscale_200,
                          },
                        ]}
                        onPress={verifybussinessNum}>
                        <Text
                          style={{
                            ...FONTS.fs_14_medium,
                            color: formValid.bussinessNum
                              ? COLORS.white
                              : COLORS.grayscale_400,
                          }}>
                          확인
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isBussinessNumChecked ? (
                      <View style={styles.validBox}>
                        <Text
                          style={[
                            styles.validDefaultText,
                            isBussinessNumbVerified
                              ? styles.validText
                              : styles.invalidText,
                          ]}>
                          {isBussinessNumbVerified
                            ? '유효한 사업자번호입니다'
                            : '유효하지 않은 사업자번호입니다.'}
                        </Text>
                      </View>
                    ) : (
                      ''
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
                  <View style={styles.inputContainer}>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="다시 한 번 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.passwordConfirm}
                        onChangeText={handlePasswordConfirmChange}
                        maxLength={20}
                        secureTextEntry={!isPasswordCheckVisible}
                      />
                      <TouchableOpacity
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
                </View>
              </View>

              <View>
                <ButtonScarlet
                  title="다음"
                  onPress={handleSubmit}
                  // disabled={!isFormValid()}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => {
          if (errorModal.onPress === 'moveToLogin') {
            navigation.navigate('EXLogin');
          } else {
            setErrorModal(prev => ({...prev, visible: false}));
          }
        }}
      />
    </>
  );
};

export default HostRegisterInfo;
