import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import EditFormInput from '@components/EditFormInput';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import hostMyApi from '@utils/api/hostMyApi';
import authApi from '@utils/api/authApi';
import ErrorModal from '@components/modals/ErrorModal';

const EditProfileFieldScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {field, label, value} = route.params;
  const userRole = useUserStore.getState()?.userRole;
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
  });
  const [inputValue, setInputValue] = useState(value);
  const [authCode, setAuthCode] = useState('');

  const isAuthRequired = field === 'phone' || field === 'email';

  const handleSendAuth = async () => {
    try {
      if (field === 'email') {
        await authApi.sendEmail(inputValue, userRole);
      } else if (field === 'phone') {
        await authApi.sendSms(inputValue, userRole);
      } else {
        console.warn('인증 필드가 아닙니다.');
        setErrorModal({
          visible: true,
          title: '인증 필드가 아닙니다',
          buttonText: '확인',
        });
      }
      setErrorModal({
        visible: true,
        title: '인증번호가 전송되었습니다',
        buttonText: '확인',
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        title: '인증번호 전송에 실패했습니다',
        buttonText: '확인',
      });
      console.error(error);
    }
  };

  const handleConfirmAuth = async () => {
    try {
      if (field === 'email') {
        await authApi.verifyEmail(inputValue, authCode);
      } else if (field === 'phone') {
        await authApi.verifySms(inputValue, authCode);
      } else {
        console.warn('인증 필드가 아닙니다.');
      }
      setErrorModal({
        visible: true,
        title: '인증에 성공했습니다',
        buttonText: '확인',
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        title: '인증번호 확인에 실패했습니다',
        buttonText: '확인',
      });
      console.error(error);
    }
  };

  const handleSave = () => {
    tryUpdateProfile(userRole, field, inputValue);
  };

  const tryUpdateProfile = async (role, updateField, updateData) => {
    console.log(updateField);
    try {
      if (role === 'USER') {
        await userMyApi.updateMyProfile(updateField, updateData);
        tryFetchUserProfile();
      } else if (role === 'HOST') {
        if (updateField === 'businessNum') {
          console.log(updateField, updateData);
          await hostMyApi.updateBusinessNum(updateData);
        } else {
          await hostMyApi.updateMyProfile(updateField, updateData);
        }

        tryFetchHostProfile();
      } else {
        setErrorModal({
          visible: true,
          title: '회원 역할이 올바르지 않습니다',
          buttonText: '확인',
        });
      }
      navigation.goBack();
    } catch (error) {
      setErrorModal({
        visible: true,
        title: error?.response?.data?.message || '회원정보 수정에 실패했습니다',
        buttonText: '확인',
      });
      console.warn(`${role}: ${updateField} - 회원정보 수정 실패`, error);
    }
  };

  const tryFetchHostProfile = async () => {
    try {
      const res = await hostMyApi.getMyProfile();
      const {name, photoUrl, phone, email, businessNum} = res.data;

      setHostProfile({
        name: name ?? '',
        photoUrl:
          photoUrl && photoUrl !== '사진을 추가해주세요' ? photoUrl : null,
        phone: phone ?? '',
        email: email ?? '',
        businessNum: businessNum ?? '',
      });
    } catch (error) {
      console.warn('사장님 프로필 조회 실패:', error);
    }
  };
  const tryFetchUserProfile = async () => {
    try {
      const res = await userMyApi.getMyProfile();
      const {name, nickname, photoUrl, phone, email, mbti, instagramId} =
        res.data;

      setUserProfile({
        name: name ?? '',
        nickname: nickname ?? '',
        photoUrl:
          photoUrl && photoUrl !== '사진을 추가해주세요' ? photoUrl : null,
        phone: phone ?? '',
        email: email ?? '',
        mbti: mbti ?? '',
        instagramId: instagramId ?? '',
      });
    } catch (error) {
      console.warn('유저 프로필 조회 실패:', error);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <ButtonScarlet title="저장" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
      <ErrorModal
        title={errorModal.title}
        buttonText={errorModal.buttonText}
        visible={errorModal.visible}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
  },
});

export default EditProfileFieldScreen;
