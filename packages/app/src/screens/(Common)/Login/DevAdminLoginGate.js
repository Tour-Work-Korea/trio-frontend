import React, {useState} from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';
import LogoOrange from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';
import {tryLogin} from '@utils/auth/login';
import {markDevWebAdminAuthenticated} from '@utils/auth/devAdminAccess';

import styles from './Login.styles';

export default function DevAdminLoginGate({onAuthenticated}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith('@ddakji.kr')) {
      setErrorModal({
        visible: true,
        message: '게딱지 관리자 계정만 접속할 수 있습니다.',
      });
      return;
    }

    try {
      setLoading(true);
      await tryLogin(normalizedEmail, password, 'ADMIN');
      await markDevWebAdminAuthenticated();
      onAuthenticated?.();
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          '관리자 로그인 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            <View style={styles.groupParent}>
              <LogoOrange width={60} height={29} />
              <View>
                <Text style={styles.titleText}>관리자 로그인</Text>
                <Text style={styles.subTitleText}>
                  게딱지 관리자 계정으로 로그인해 주세요.
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="관리자 이메일"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    maxLength={50}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="비밀번호"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    maxLength={20}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.buttonSection}>
              <ButtonWhite
                title={loading ? '로그인 중...' : '관리자 로그인'}
                onPress={handleLogin}
                disabled={loading}
                backgroundColor={COLORS.primary_orange}
                textColor={COLORS.grayscale_0}
              />
            </View>
          </View>
        </View>

        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText="확인"
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
