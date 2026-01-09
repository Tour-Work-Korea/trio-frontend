import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import UserPhone from '@components/Certificate/UserPhone';
import HostPhone from '@components/Certificate/HostPhone';
import authApi from '@utils/api/authApi';

import ErrorModal from '@components/modals/ErrorModal';

/**
 * PhoneCertificate 역할
 * - USER: NICE(UserPhone) 인증 → niceAuthToken 받기 → check-status 호출 → 다음 화면 이동
 * - HOST: 기존 SMS(HostPhone) 인증 → phoneNumber 받기 → 다음 화면 이동
 */
const PhoneCertificate = ({route}) => {
  const {user, agreements, email} = route.params;
  const navigation = useNavigation();
  const [checking, setChecking] = useState(false); // 중복 호출 방지

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '확인',
    onPress: null,
  });

  const openModal = ({message, buttonText = '확인', onPress = null}) => {
    setErrorModal({
      visible: true,
      message,
      buttonText,
      onPress,
    });
  };

  const closeModal = () => {
    setErrorModal(prev => ({...prev, visible: false}));
  };

  /**
   * NICE 인증 완료 토큰을 받았을 때 실행되는 콜백
   * - token은 일회용/유효시간(10분)
   */
  const handleNiceVerifiedSuccess = async niceAuthToken => {
    // 토큰이 없으면 아무 것도 안함
    if (!niceAuthToken) return;

    // 중복 방지
    if (checking) return;

    try {
      setChecking(true);

      // 가입 상태 체크
      const res = await authApi.checkSignUpStatus(niceAuthToken);
      const {status, socialTypes, message} = res.data;

      if (!status) {
        openModal({
          message: '계정 상태 확인 중 문제가 발생했어요.',
        });
        return;
      }

      // NEW_USER: 신규 회원 → 가입폼으로 이동
      if (status === 'NEW_USER') {
        Toast.show({
          type: 'success',
          text1: '인증이 완료되었어요!',
          position: 'top',
          visibilityTime: 2000,
        });

        navigation.navigate('UserRegisterProfile', {
          prevData: {
            userRole: 'USER',
            agreements: agreements || [],
            email: email || '',
            niceAuthToken,
            nickname: '',
            password: '',
            passwordConfirm: '',
          },
        });
        return;
      }

      // ALREADY_LOCAL: 이미 로컬 계정 존재 → 로그인 유도
      if (status === 'ALREADY_LOCAL') {
        openModal({
          message:
            message || '해당 명의로 이미 가입된 계정이 있어요.',
          buttonText: '로그인으로 이동',
          onPress: () => {
            closeModal();
            navigation.navigate('LoginIntro');
          },
        });
        return;
      }

      // SOCIAL_INTEGRATION: 소셜 계정 존재 → 연동 내역 + 가입폼 이동
      if (status === 'SOCIAL_INTEGRATION') {
        Toast.show({
          type: 'success',
          text1: '인증이 완료되었어요!',
          position: 'top',
          visibilityTime: 2000,
        });

        navigation.navigate('UserRegisterProfile', {
          prevData: {
            userRole: 'USER',
            agreements: agreements || [],
            email: email || '',
            niceAuthToken,
            isIntegration: true,
            socialTypes: socialTypes || [],
            nickname: '',
            password: '',
            passwordConfirm: '',
          },
        });

        return;
      }

      // 알 수 없는 status
      openModal({
        message: '계정 상태 확인 중 문제가 발생했어요.',
      });
    } catch (e) {
      openModal({
        message: '계정 상태 확인 중 문제가 발생했어요.',
      });
    } finally {
      setChecking(false);
    }
  };

  // 호스트
  const handleHostPhoneVerifiedSuccess = phoneNumber => {
    navigation.navigate('HostRegisterInfo', {
      agreements,
      email,
      phoneNumber,
    });
  };

  const isHost = user === 'HOST';

  return (
    <>
      {isHost ? (
        <HostPhone user={user} onPress={handleHostPhoneVerifiedSuccess} />
      ) : (
        <UserPhone user={user} onPress={handleNiceVerifiedSuccess} />
      )}

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => {
          if (typeof errorModal.onPress === 'function') {
            errorModal.onPress();
            return;
          }
          closeModal();
        }}
      />
    </>
  );
};

export default PhoneCertificate;
