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
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import ErrorModal from '@components/modals/ErrorModal';
import {tryLogin} from '@utils/auth/login';

import styles from '../Login.styles';
import ShowPassword from '@assets/images/show_password.svg';
import HidePassword from '@assets/images/hide_password.svg';
import Logo from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';

export default function LoginByEmail({route}) {
  const {userRole} = route.params;
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
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

  const handleLogin = async () => {
    try {
      await tryLogin(email, password, userRole);
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
          error?.response?.data?.message || '로그인 중 오류가 발생했습니다',
        buttonText: '확인',
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
              <Logo width={60} height={29} />
              <Text style={[styles.titleText]}>이메일로 로그인해주세요</Text>
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="이메일을 입력해주세요"
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
                <Text style={styles.inputLabel}>비밀번호</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="비밀번호를 입력해주세요"
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
                <ButtonScarlet title={'로그인하기'} onPress={handleLogin} />
                <ButtonWhite
                  title={'이메일로 가입하기'}
                  onPress={handleMoveToRegister}
                />
              </View>
            </View>
            <View style={styles.findSection}>
              <TouchableOpacity onPress={moveToFindId}>
                <Text style={styles.findText}>아이디찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={moveToFindPassword}>
                <Text style={styles.findText}>비밀번호찾기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
