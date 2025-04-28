import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditFormInput from '@components/EditFormInput';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import { COLORS } from '@constants/colors';

const EditProfileFieldScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { field, label, value } = route.params;

  const [inputValue, setInputValue] = useState(value);
  const [authCode, setAuthCode] = useState('');

  const isAuthRequired = field === 'phone' || field === 'email';

  const handleSendAuth = () => {
    console.log('인증번호 발급 요청');
    // 여기서 API 호출
  };

  const handleConfirmAuth = () => {
    console.log('입력한 인증번호 확인', authCode);
    // 여기서 인증번호 검증 로직
  };

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Header title="마이페이지" />

            <EditFormInput
                label={`${label} 입력해 주세요`}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={`${label} 입력`}
                showSendAuthButton={isAuthRequired}
                showAuthInput={isAuthRequired}
                onSendAuth={handleSendAuth}
                authValue={authCode}
                onChangeAuthText={setAuthCode}
                onConfirmAuth={handleConfirmAuth}
            />

            <View style={styles.saveButtonContainer}>
                <ButtonScarlet title="저장" onPress={handleSave}/>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default EditProfileFieldScreen;
