import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './Register.styles';
import Header from '@components/Header';
import authApi from '@utils/api/authApi';

const HostRegisterInfo = ({route}) => {
  const {email, phoneNumber} = route.params;
  const navigation = useNavigation();

  const [signupForm, setSignupForm] = useState({
    password: '',
    passwordConfirm: '',
    name: '',
    businessNumber: '',
    userRole: 'ADMIN',
    phoneNum: phoneNumber,
    email: email,
  });

  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
  const [isBusinessNumberVerified, setIsBusinessNumberVerified] =
    useState(false);
  const [allAgreed, setAllAgreed] = useState(false);
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const handleSignupFormChange = (key, value) => {
    setSignupForm(prev => ({...prev, [key]: value}));
  };

  // 전체 동의 처리
  const handleAllAgree = () => {
    const newState = !allAgreed;
    setAllAgreed(newState);
    setServiceAgreed(newState);
    setPrivacyAgreed(newState);
  };

  // 개별 약관 동의 처리
  const handleServiceAgree = () => {
    const newState = !serviceAgreed;
    setServiceAgreed(newState);
    setAllAgreed(newState && privacyAgreed);
  };

  const handlePrivacyAgree = () => {
    const newState = !privacyAgreed;
    setPrivacyAgreed(newState);
    setAllAgreed(serviceAgreed && newState);
  };

  // 비밀번호 확인
  const confirmPassword = () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,20}$/;

    if (!passwordRegex.test(signupForm.password)) {
      Alert.alert(
        '알림',
        '비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함한 8~20자리여야 합니다.',
      );
      return;
    }
    setIsPasswordConfirmed(true);
  };

  // 사업자등록번호 확인
  const verifyBusinessNumber = async () => {
    if (!signupForm.businessNumber || signupForm.businessNumber.length !== 10) {
      Alert.alert('알림', '유효한 사업자등록번호를 입력해주세요.');
      return;
    }

    try {
      const response = await authApi.verifyBusiness(signupForm.businessNumber);
      if (response.status === 200) {
        setIsBusinessNumberVerified(true);
        Alert.alert('알림', '사업자등록번호가 확인되었습니다.');
      } else {
        Alert.alert('오류', '사업자등록번호 확인에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '사업자등록번호 확인에 실패했습니다.');
    }
  };

  // 회원가입 완료 처리
  const handleSignup = async () => {
    if (!isPasswordConfirmed) {
      Alert.alert('알림', '비밀번호 확인이 필요합니다.');
      return;
    }

    if (!signupForm.name) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (!isBusinessNumberVerified) {
      Alert.alert('알림', '사업자등록번호 확인이 필요합니다.');
      return;
    }

    const signupData = {
      userRole: 'HOST',
      phoneNum: phoneNumber,
      email: email,
      password: signupForm.password,
      passwordConfirm: signupForm.passwordConfirm,
      name: signupForm.name,
      bussinessNum: signupForm.businessNumber,
    };

    try {
      const response = await authApi.hostSignUp(signupData);
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
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* 약관 동의 섹션 */}
          <View style={styles.agreementSection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={handleAllAgree}>
              <View
                style={[styles.checkbox, allAgreed && styles.checkboxChecked]}>
                {allAgreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>이용약관에 전체 동의</Text>
            </TouchableOpacity>

            <View style={styles.requiredAgreements}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={handleServiceAgree}>
                <View
                  style={[
                    styles.checkbox,
                    serviceAgreed && styles.checkboxChecked,
                  ]}>
                  {serviceAgreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  <Text style={styles.requiredTag}>[필수]</Text> 서비스 이용약관
                  동의
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={handlePrivacyAgree}>
                <View
                  style={[
                    styles.checkbox,
                    privacyAgreed && styles.checkboxChecked,
                  ]}>
                  {privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  <Text style={styles.requiredTag}>[필수]</Text> 개인정보 수집및
                  이용 동의
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 비밀번호 섹션 */}
          {/* 비밀번호 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.fullInput}
              placeholder="비밀번호 입력"
              value={signupForm.password}
              onChangeText={text => handleSignupFormChange('password', text)}
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
                value={signupForm.passwordConfirm}
                onChangeText={text =>
                  handleSignupFormChange('passwordConfirm', text)
                }
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
              value={signupForm.name}
              onChangeText={text => handleSignupFormChange('name', text)}
            />
          </View>

          {/* 사업자등록번호 섹션 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>사업자등록번호</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="'-'없이 숫자만 입력해 주세요"
                value={signupForm.businessNumber}
                onChangeText={text =>
                  handleSignupFormChange('businessNumber', text)
                }
                keyboardType="number-pad"
                maxLength={10}
                editable={!isBusinessNumberVerified}
              />
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isBusinessNumberVerified && styles.disabledButton,
                ]}
                onPress={verifyBusinessNumber}
                disabled={isBusinessNumberVerified}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* 회원가입 버튼 */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>회원가입</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HostRegisterInfo;
