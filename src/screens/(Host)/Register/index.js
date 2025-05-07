import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Header from '@components/Header';

const Register = () => {
  const navigation = useNavigation();

  // 약관 동의 상태
  const [allAgreed, setAllAgreed] = useState(false);
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
  const [name, setName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [isBusinessNumberVerified, setIsBusinessNumberVerified] =
    useState(false);

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
    if (!password || password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    // 실제로는 비밀번호 유효성 검사
    setIsPasswordConfirmed(true);
    Alert.alert('알림', '비밀번호가 확인되었습니다.');
  };

  // 사업자등록번호 확인
  const verifyBusinessNumber = () => {
    if (!businessNumber || businessNumber.length !== 10) {
      Alert.alert('알림', '유효한 사업자등록번호를 입력해주세요.');
      return;
    }

    // 실제로는 사업자등록번호 확인 API 호출
    setIsBusinessNumberVerified(true);
    Alert.alert('알림', '사업자등록번호가 확인되었습니다.');
  };

  // 회원가입 완료 처리
  const handleSignup = () => {
    if (!isPasswordConfirmed) {
      Alert.alert('알림', '비밀번호 확인이 필요합니다.');
      return;
    }

    if (!name) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (!isBusinessNumberVerified) {
      Alert.alert('알림', '사업자등록번호 확인이 필요합니다.');
      return;
    }

    // 회원가입 완료 처리
    Alert.alert('회원가입 완료', '회원가입이 완료되었습니다.', [
      {text: '확인', onPress: () => navigation.navigate('Login')},
    ]);
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
              value={password}
              onChangeText={setPassword}
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
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
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
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 사업자등록번호 섹션 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>사업자등록번호</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="'-'없이 숫자만 입력해 주세요"
                value={businessNumber}
                onChangeText={setBusinessNumber}
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

          {/* 회원가입 버튼 */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  agreementSection: {
    marginBottom: 20,
    backgroundColor: COLORS.background_gray,
    padding: 15,
    borderRadius: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.scarlet,
    borderColor: COLORS.scarlet,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  requiredAgreements: {
    marginLeft: 10,
  },
  requiredTag: {
    color: COLORS.scarlet,
  },
  verificationSection: {
    marginBottom: 20,
    backgroundColor: COLORS.background_gray,
    padding: 15,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'column',
  },
  sectionTitle: {
    ...FONTS.fs_body_bold,
    marginBottom: 5,
  },
  sectionDescription: {
    ...FONTS.fs_body,
    color: COLORS.dark_gray,
    marginBottom: 10,
  },
  verifyButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  verifyButtonText: {
    ...FONTS.fs_body,
    color: COLORS.white,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.fs_body_bold,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    ...FONTS.fs_body,
  },
  fullInput: {
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    ...FONTS.fs_body,
  },
  verifyCodeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  verifyCodeButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  confirmButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  confirmButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  disabledButton: {
    backgroundColor: COLORS.light_gray,
    borderColor: COLORS.light_gray,
  },
  signupButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});

export default Register;
