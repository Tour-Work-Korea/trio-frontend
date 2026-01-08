import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import UserPhone from '@components/Certificate/UserPhone';
import HostPhone from '@components/Certificate/HostPhone';
import authApi from '@utils/api/authApi';
import {Alert} from 'react-native';

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

  // 임시!!!!!! 배포에서 에러 메시지 노출용 모달 상태
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '확인',
  });
  //

  // 임시!!!!!!!  배포용 디버그 문자열 만들기
  const buildDebugText = err => {
    const status = err?.response?.status;
    const server = err?.response?.headers?.server;
    const contentType =
      err?.response?.headers?.['content-type'] ||
      err?.response?.headers?.['Content-Type'];
    const headers = err?.response?.headers;
    const data = err?.response?.data;

    const safeStringify = v => {
      if (!v) return '';
      try {
        return typeof v === 'string' ? v : JSON.stringify(v, null, 2);
      } catch (e) {
        return String(v);
      }
    };

    const headersText = safeStringify(headers);
    const dataText = safeStringify(data);

    return (
      `\n\n[DEBUG]\n` +
      `status: ${status ?? 'N/A'}\n` +
      `server: ${server ?? 'N/A'}\n` +
      `content-type: ${contentType ?? 'N/A'}\n` +
      `data: ${dataText || 'N/A'}\n` +
      `headers: ${headersText || 'N/A'}`
    );
  };
  //

  // 임시!!!!!!!! ErrorModal 띄우는 헬퍼
  const showErrorModal = (title, err) => {
    const debug = err ? buildDebugText(err) : '';
    setErrorModal({
      visible: true,
      message: `${title}${debug}`,
      buttonText: '확인',
    });
  };
  //

  /**
   * NICE 인증 완료 토큰을 받았을 때 실행되는 콜백
   * - token은 일회용/유효시간(10분)
   */
  const handleNiceVerifiedSuccess = async niceAuthToken => {
    // 토큰이 없으면 아무 것도 안함
    // if (!niceAuthToken) return;

    // 임시!!!!!!   토큰 자체가 없을 때 (예: WebView에서 이상한 메시지)
    if (!niceAuthToken) {
      showErrorModal('[TOKEN EMPTY] niceAuthToken이 비어있음', null);
      return;
    }
    //

    // 중복 방지
    if (checking) return;

    try {
      setChecking(true);

      // 가입 상태 체크
      const res = await authApi.checkSignUpStatus(niceAuthToken);
      const {status, socialTypes, message} = res.data;

      // 임시!!!!!!!  status가 비어있거나 예상과 다를 때
      if (!status) {
        showErrorModal(
          '[INVALID RESPONSE] check-status 응답에 status가 없음',
          {response: {data: res.data}},
        );
        Alert.alert('오류', '계정 확인 중 문제가 발생했습니다.');
        return;
      }
      //

      // NEW_USER: 신규 회원 → 가입폼으로 이동
      if (status === 'NEW_USER') {
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
        Alert.alert(
          '알림',
          message || '해당 명의로 이미 가입된 계정이 있습니다.',
          [{text: '로그인', onPress: () => navigation.navigate('LoginIntro')}],
        );
        return;
      }

      // SOCIAL_INTEGRATION: 소셜 계정 존재 → 연동 안내 후 가입폼 이동
      if (status === 'SOCIAL_INTEGRATION') {
        Alert.alert(
          '계정 연동',
          `이미 존재하는 계정과 회원 정보를 연동합니다.\n연동 계정 플랫폼 : ${(socialTypes || []).join(
            ', ',
          )}`,
          [
            {
              text: '확인',
              onPress: () => {
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
              },
            },
          ],
        );
        return;
      }

      // 예외 status 처리
      Alert.alert('오류', '알 수 없는 상태입니다. 다시 시도해주세요.');
    } catch (e) {
      Alert.alert('오류', '계정 확인 중 문제가 발생했습니다.');
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

      {/* 임시!!!!!! 배포 디버깅용 모달 (USER/HOST 공통) */}
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
      {/*  */}
    </>
  );
};

export default PhoneCertificate;
