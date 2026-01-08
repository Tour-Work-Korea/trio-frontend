import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import LogoOrange from '@assets/images/logo_orange.svg';
import ButtonWhite from '@components/ButtonWhite';
import ErrorModal from '@components/modals/ErrorModal';
import authApi from '@utils/api/authApi';
import styles from './Certificate.styles';
import {COLORS} from '@constants/colors';

/**
 * NICE 자동 submit 폼 HTML 생성기
 * - encData / integrityValue / tokenVersionId 3개 값을 hidden input으로 넣고
 * - body onload에서 자동 submit → NICE 인증 화면으로 바로 이동
 */
const createNiceFormHtml = (encData, integrityValue, tokenVersionId) => `
  <html>
    <head>
      <title>NICE Auth</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>

    <body onload="document.forms[0].submit()">
      <form name="form_auth" method="post" action="https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb">
        <input type="hidden" name="m" value="service" />
        <input type="hidden" name="token_version_id" value="${tokenVersionId}" />
        <input type="hidden" name="enc_data" value="${encData}" />
        <input type="hidden" name="integrity_value" value="${integrityValue}" />
      </form>

      <div style="text-align:center; margin-top: 20px;">
        <h3>본인인증 페이지로 이동 중...</h3>
      </div>
    </body>
  </html>
`;

const UserPhone = ({user, onPress}) => {
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [formHtml, setFormHtml] = useState('');

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
      setFormHtml('');
      setErrorModal({visible: false, message: '', buttonText: ''});
    }, []),
  );

  // 임시!!!!!!!    에러 디버그 문자열 만들기 (배포에서 콘솔 대신 모달에 표시용)
  const buildDebugText = error => {
    const status = error?.response?.status;
    const server = error?.response?.headers?.server;
    const contentType =
      error?.response?.headers?.['content-type'] ||
      error?.response?.headers?.['Content-Type'];

    const headers = error?.response?.headers;
    const data = error?.response?.data;

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

  // 본인인증 버튼 클릭
  const startNiceAuth = async () => {
    try {
      setLoading(true);

      /**
       * 서버에 init 요청
       * - POST /auth/nice/init
       * - 응답에 encData / integrityValue / tokenVersionId 가 옴
       */
      const res = await authApi.niceInit();
      const {encData, integrityValue, tokenVersionId} = res.data;

      /**
       * WebView에 올릴 HTML 생성
       * - 만들자마자 onload submit → NICE 인증 페이지로 이동
       */
      const html = createNiceFormHtml(encData, integrityValue, tokenVersionId);

      setFormHtml(html);
      setShowWebView(true); // 모달 열기
    } catch (error) {
      // setErrorModal({
      //   visible: true,
      //   message:
      //     error?.response?.data?.message || '본인 인증에 실패했습니다.',
      //   buttonText: '확인',
      // });

      // console.log('status', error?.response?.status);
      // console.log('server', error?.response?.headers?.server);
      // console.log('content-type', error?.response?.headers?.['content-type']);
      // console.log('data', error?.response?.data);
      // console.log('headers', error?.response?.headers);
      const baseMsg =
        error?.response?.data?.message || '본인 인증에 실패했습니다.';

      // 모달에 디버그 정보까지 표시
      setErrorModal({
        visible: true,
        message: `${baseMsg}${buildDebugText(error)}`,
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
      // if (!raw) return;

      // 임시!!!!!!!     raw 자체가 없을 때도 모달로 보여주기(배포 디버깅)
      if (!raw) {
        setErrorModal({
          visible: true,
          message: `[DEBUG]\nWebView onMessage data가 비어있음\n(raw: empty)`,
          buttonText: '확인',
        });
        return;
      }
      //

      const data = JSON.parse(raw);

      // 인증 완료 타입 & 토큰 존재 확인
      if (data?.type === 'NICE_AUTH_COMPLETE' && data?.token) {
        // WebView 닫기
        setShowWebView(false);
        setFormHtml('');

        // 상위로 niceAuthToken 전달
        onPress(data.token);
        return;
      }

      // 임시!!!!!!! JSON은 맞는데 우리가 기대한 형태가 아닐 때도 모달로 띄우기
      setErrorModal({
        visible: true,
        message:
          `[DEBUG]\nWebView 메시지 형식이 기대값이 아님\n\n` +
          `parsed: ${JSON.stringify(data, null, 2)}`,
        buttonText: '확인',
      });
      //

    } catch (e) {
      // 임시!!!!!!!!
      const raw = event?.nativeEvent?.data;
      const rawPreview =
        typeof raw === 'string'
          ? raw.length > 1200
            ? `${raw.slice(0, 1200)}\n... (truncated)`
            : raw
          : String(raw);

      setErrorModal({
        visible: true,
        message:
          `[DEBUG]\nNICE WebView message parse error\n\n` +
          `error: ${e?.message || String(e)}\n\n` +
          `raw: ${rawPreview}`,
        buttonText: '확인',
      });
      //

      // JSON 파싱 실패면 그냥 무시(디버깅 필요하면 warn)
      console.warn('NICE WebView message parse error:', e);
    }
  };

  // WebView 닫기 (사용자가 중간에 닫는 경우)
  const closeWebView = () => {
    setShowWebView(false);
    setFormHtml('');
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

            {/* WebView: HTML 로드 → 자동 submit */}
            <WebView
              source={{
                html: formHtml,
                baseUrl: 'https://nice.checkplus.co.kr',
              }}
              javaScriptEnabled={true}
              originWhitelist={['*']}
              onMessage={handleWebViewMessage}
              style={{flex: 1}}
            />
          </View>
        </Modal>

        {/* 에러 모달 */}
        <ErrorModal
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
