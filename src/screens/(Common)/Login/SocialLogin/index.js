import React, {useMemo, useRef, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import Config from 'react-native-config';

import AlertModal from '@components/modals/AlertModal';
import styles from './SocialLogin.styles';
import authApi from '@utils/api/authApi';
import {COLORS} from '@constants/colors';
import {storeLoginTokens} from '@utils/auth/login';

const SocialLogin = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webviewRef = useRef(null);

  const provider = route?.params?.provider || 'KAKAO';

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    message: '',
    onPress: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const KAKAO_CLIENT_ID = Config.KAKAO_CLIENT_ID;
  const REDIRECT_URI = Config.KAKAO_REDIRECT_URI;

  const authUrl = useMemo(() => {
    if (provider === 'KAKAO') {
      return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI,
      )}`;
    }
    return '';
  }, [provider, KAKAO_CLIENT_ID, REDIRECT_URI]);

  const openError = (message, onPress = null) =>
    setModal({visible: true, message, onPress});
  const openNotice = (message, onPress) =>
    setModal({visible: true, message, onPress});
  const handleCloseModal = () =>
    setModal(prev => ({...prev, visible: false, onPress: null}));

  const extractCodeFromUrl = url => {
    try {
      const codeMatch = url.match(/[?&]code=([^&]+)/);
      return codeMatch ? decodeURIComponent(codeMatch[1]) : null;
    } catch (e) {
      return null;
    }
  };

  const handleLoginByCode = async code => {
    if (!code || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await authApi.loginKakao(code);
      const data = res?.data;

      if (!data) {
        openError('로그인 응답이 비어있음', () =>
          navigation.reset({
            index: 0,
            routes: [{name: 'LoginIntro'}],
          }),
        );
        return;
      }

      // 신규 유저
      if (data.isNewUser) {
        if (!data.externalId) {
          openError('신규 유저 식별값이 없음', () =>
            navigation.reset({
              index: 0,
              routes: [{name: 'LoginIntro'}],
            }),
          );
          return;
        }
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RegisterAgree',
              params: {
                user: 'USER',
                isSocial: true,
                externalId: data.externalId,
              },
            },
          ],
        });
        return;
      }

      // 기존 유저
      if (!data.accessToken || !data.refreshToken) {
        openError('토큰이 없음', () =>
          navigation.reset({
            index: 0,
            routes: [{name: 'LoginIntro'}],
          }),
        );
        return;
      }

      await storeLoginTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userRole: 'USER',
      });

      const moveToMain = () => {
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs'}],
        });
      };

      if (data.message === '기존 워커웨이 계정과 연동합니다.') {
        openNotice(data.message, moveToMain);
        return;
      }

      moveToMain();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        '카카오 로그인 중 오류가 발생했습니다.';
      openError(msg, () =>
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginIntro'}],
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onShouldStartLoadWithRequest = request => {
    const {url} = request;

    // redirect uri로 이동하는 순간 code 잡기
    if (url?.startsWith(REDIRECT_URI)) {
      const code = extractCodeFromUrl(url);

      if (code) {
        handleLoginByCode(code);
        return false;
      }

      openError('인가코드 없음', () =>
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginIntro'}],
        }),
      );
      return false;
    }

    return true;
  };

  if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary_orange} />
        <AlertModal
          visible={true}
          title={'KAKAO_CLIENT_ID 또는 KAKAO_REDIRECT_URI가 비어있음.\n'}
          buttonText={'확인'}
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{uri: authUrl}}
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled
        domStorageEnabled
        // incognito
        // cacheEnabled={false}
        // sharedCookiesEnabled={false}
        // thirdPartyCookiesEnabled={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary_orange} />
          </View>
        )}
      />

      {(loading || isSubmitting) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COLORS.primary_orange} />
        </View>
      )}

      <AlertModal
        visible={modal.visible}
        title={modal.message}
        buttonText={'확인'}
        onPress={() => {
          if (typeof modal.onPress === 'function') {
            const action = modal.onPress;
            handleCloseModal();
            action();
            return;
          }
          handleCloseModal();
        }}
      />
    </View>
  );
};

export default SocialLogin;
