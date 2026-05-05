import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import LogoOrange from '@assets/images/logo_orange.svg';
import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';
import authApi from '@utils/api/authApi';
import styles from './Certificate.styles';
import {COLORS} from '@constants/colors';

const extractNiceTokenFromUrl = url => {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.searchParams.get('niceAuthToken') ||
      parsed.searchParams.get('token') ||
      parsed.searchParams.get('authToken')
    );
  } catch (e) {
    return null;
  }
};

const UserPhone = ({onPress}) => {
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  // 화면 다시 들어올 때 초기화
  useFocusEffect(
    useCallback(() => {
      setLoading(false);
      setShowWebView(false);
      setAuthUrl('');
      setErrorModal({visible: false, message: '', buttonText: ''});
    }, []),
  );

  // 본인인증 버튼 클릭
  const startNiceAuth = async () => {
    try {
      setLoading(true);

      /**
       * 서버에 init 요청
       * - POST /auth/nice/init
       * - 응답에 authUrl / requestNo / expiresAt 가 옴
       */
      const res = await authApi.niceInit();
      const {authUrl: nextAuthUrl} = res.data || {};

      if (!nextAuthUrl) {
        throw new Error('본인 인증 URL이 없습니다.');
      }

      setAuthUrl(nextAuthUrl);
      setShowWebView(true); // 모달 열기
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          error?.response?.data?.message || '본인 인증에 실패했습니다.',
        buttonText: '확인',
      });
    } finally {
      setLoading(false);
    }
  };

  // WebView에서 인증 완료 토큰 받기
  const handleWebViewMessage = event => {
    /**
     * 백엔드 callback HTML에서 아래처럼 보내줘야 앱이 받음!
     * window.ReactNativeWebView.postMessage(JSON.stringify({
     *   type: 'NICE_AUTH_COMPLETE',
     *   token: '...'
     * }))
     */
    try {
      const raw = event?.nativeEvent?.data;
      if (!raw) {
        return;
      }

      const data = JSON.parse(raw);

      // 인증 완료 타입 & 토큰 존재 확인
      if (data?.type === 'NICE_AUTH_COMPLETE' && data?.token) {
        // WebView 닫기
        setShowWebView(false);
        setAuthUrl('');

        // 상위로 niceAuthToken 전달
        onPress(data.token);
        return;
      }

    } catch (e) {
      console.warn('NICE WebView message parse error:', e);
    }
  };

  const handleShouldStartLoadWithRequest = request => {
    const url = request?.url;
    if (!url) {
      return true;
    }

    const token = extractNiceTokenFromUrl(url);
    if (token) {
      setShowWebView(false);
      setAuthUrl('');
      onPress(token);
      return false;
    }

    // Android 앱 스킴 (PASS 앱 등) 처리
    if (Platform.OS === 'android') {
      if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('about:blank')
      ) {
        return true; // 일반 웹 URL은 그대로 로드
      }

      // 1. intent:// 로 시작하는 경우 파싱
      if (url.startsWith('intent:')) {
        const schemeMatch = url.match(/scheme=([^;]+)/);
        const packageMatch = url.match(/package=([^;]+)/);
        
        if (schemeMatch) {
          const scheme = schemeMatch[1];
          const newUrl = url.replace('intent://', `${scheme}://`);
          
          Linking.openURL(newUrl).catch(() => {
            // 앱이 안 깔려있으면 플레이스토어로 이동
            if (packageMatch) {
              Linking.openURL(`market://details?id=${packageMatch[1]}`);
            }
          });
          return false;
        }
      }

      // 2. 그 외의 커스텀 스킴 (tauthlink:// 등)
      Linking.openURL(url).catch(() => {
        console.warn('앱을 열 수 없습니다:', url);
      });
      return false; // WebView 자체에서 열지 못하게 막음 (ERR_UNKNOWN_URL_SCHEME 방지)
    }

    return true;
  };

  // WebView 닫기 (사용자가 중간에 닫는 경우)
  const closeWebView = () => {
    setShowWebView(false);
    setAuthUrl('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={[styles.viewFlexBox, {justifyContent: 'space-between'}]}>
          <View style={{flex: 1}}>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <LogoOrange width={60} height={29} />
              <Text style={[styles.titleText]}>본인 인증</Text>
            </View>

            <View style={[styles.inputGroup, {flex: 1, justifyContent: 'center', marginTop: -80,}]}>
              <View style={[styles.inputContainer]}>
                <Text style={styles.inputContainerText}>
                  더 안전한 서비스 이용을 위해{'\n'}본인 인증이 필요합니다.
                </Text>
                {loading ? (
                  // init 요청 중
                  <View style={{marginTop: 14}}>
                    <ActivityIndicator />
                  </View>
                ) : (
                  <ButtonWhite
                    title="본인 인증 하기"
                    onPress={startNiceAuth}
                    backgroundColor={COLORS.primary_orange}
                    textColor={COLORS.grayscale_0}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* NICE 인증 WebView 모달 */}
        <Modal visible={showWebView} animationType="slide">
          <View style={{flex: 1, backgroundColor: COLORS.grayscale_0}}>
            {/* 상단바 (닫기) */}
            <View
              style={{
                paddingTop: 50,
                paddingHorizontal: 16,
                paddingBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, fontWeight: '600'}}>
                본인 인증 진행
              </Text>

              <TouchableOpacity onPress={closeWebView}>
                <Text style={{fontSize: 14, color: COLORS.grayscale_600}}>
                  닫기
                </Text>
              </TouchableOpacity>
            </View>

            {/* WebView: init 응답 authUrl 로드 */}
            <WebView
              source={{uri: authUrl}}
              javaScriptEnabled={true}
              originWhitelist={['*']}
              onMessage={handleWebViewMessage}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              style={{flex: 1}}
            />
          </View>
        </Modal>

        {/* 에러 모달 */}
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.message}
          buttonText={errorModal.buttonText}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserPhone;
