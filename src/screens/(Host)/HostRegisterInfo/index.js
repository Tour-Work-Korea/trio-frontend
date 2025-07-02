import React, {useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import styles from '../../(Common)/Register/Register.styles';
import {COLORS} from '@constants/colors';
import Logo from '@assets/images/logo_orange.svg';
import authApi from '@utils/api/authApi';
import {validateHostRegister} from '@utils/validation/registerValidation';

const HostRegisterInfo = ({route}) => {
  const {email, phoneNumber} = route.params;
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
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
  });

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
    }
  };

  const isFormValid = () => {
    const nameValid = formValid.name;
    const bussinessNumValid = formValid.bussinessNum && isBussinessNumbVerified;

    const passwordValid =
      formValid.password?.hasUpperLowercase &&
      formValid.password?.hasNumber &&
      formValid.password?.isLengthValid &&
      formValid.password?.hasSpecialChar;

    const confirmValid = formValid.passwordConfirm?.isMatched;

    return nicknameValid && passwordValid && confirmValid;
  };

  // 회원가입 완료 처리
  const handleSignup = async () => {
    try {
      const response = await authApi.hostSignUp(formData);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('회원가입 완료', '회원가입이 완료되었습니다.', [
          {text: '확인', onPress: () => navigation.navigate('EXLogin')},
        ]);
      } else {
        Alert.alert('오류', '회원가입에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '회원가입 요청 중 문제가 발생했습니다.');
      console.error(error);
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
              <Text style={[styles.titleText]}>workaway에 등록하기 위한,</Text>
              <Text style={[styles.titleText]}>필수정보를 알려주세요</Text>
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
                  onChangeText={text => updateField('name', text)}
                  maxLength={30}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>사업자번호</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="사업자번호를 입력해주세요"
                  placeholderTextColor={COLORS.grayscale_400}
                  value={formData.name}
                  onChangeText={text => {
                    const filtered = text.replace(/[^0-9]/g, '');
                    updateField('bussinessNum', filtered);
                  }}
                  maxLength={10}
                  keyboardType="number-pad"
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
            </View>
          </View>
        </View>
      </View>
      {/* 비밀번호 섹션 */}
      {/* 비밀번호 입력 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>비밀번호</Text>
        <TextInput
          style={styles.fullInput}
          placeholder="비밀번호 입력"
          value={formData.password}
          onChangeText={text => updateField('password', text)}
          secureTextEntry
          editable={!isPasswordConfirmed}
        />
      </View>

      {/* 비밀번호 확인 입력 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>비밀번호 확인</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 한번 더 입력해 주세요"
            value={formData.passwordConfirm}
            onChangeText={text => updateField('passwordConfirm', text)}
            secureTextEntry
            editable={!isPasswordConfirmed}
          />
          <TouchableOpacity
            style={[
              styles.confirmButton,
              isPasswordConfirmed && styles.disabledButton,
            ]}
            onPress={confirmPassword}
            disabled={isPasswordConfirmed}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 이름 섹션 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>이름</Text>
        <TextInput
          style={styles.fullInput}
          placeholder="이름"
          value={formData.name}
          onChangeText={text => updateField('name', text)}
        />
      </View>

      {/* 사업자등록번호 섹션 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>사업자등록번호</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="'-'없이 숫자만 입력해 주세요"
            value={formData.bussinessNum}
            onChangeText={text => updateField('bussinessNum', text)}
            keyboardType="number-pad"
            maxLength={10}
            editable={!isbussinessNumVerified}
          />
          <TouchableOpacity
            style={[
              styles.confirmButton,
              isbussinessNumVerified && styles.disabledButton,
            ]}
            onPress={verifybussinessNum}
            disabled={isbussinessNumVerified}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 회원가입 버튼 */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>회원가입</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HostRegisterInfo;
