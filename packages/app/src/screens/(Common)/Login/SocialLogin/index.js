import React, {useMemo, useRef, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {
  KAKAO_CLIENT_ID,
  KAKAO_REDIRECT_URI,
  NAVER_REDIRECT_URI,
  NAVER_SEARCH_CLIENT_ID,
  NAVER_SEARCH_CLIENT_SECRET,
} from '@env';

import AlertModal from '@components/modals/AlertModal';
import styles from './SocialLogin.styles';
import authApi from '@utils/api/authApi';
import {COLORS} from '@constants/colors';
import {storeLoginTokens} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';

const PROVIDER_LABELS = {
  KAKAO: '카카오',
  NAVER: '네이버',
  GOOGLE: '구글',
};

const generateState = provider =>
  `${provider.toLowerCase()}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

const buildQueryString = params =>
  Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`,
    )
    .join('&');

const parseUrlParams = url => {
  try {
    const queryStart = url.indexOf('?');
    const hashStart = url.indexOf('#');
    const query =
      queryStart >= 0
        ? url.slice(queryStart + 1, hashStart >= 0 ? hashStart : undefined)
        : '';
    const hash = hashStart >= 0 ? url.slice(hashStart + 1) : '';
    const pairs = [query, hash]
      .filter(Boolean)
      .join('&')
      .split('&')
      .filter(Boolean);
    const params = pairs.reduce((nextParams, pair) => {
      const [rawKey, ...rawValueParts] = pair.split('=');
      const key = decodeURIComponent(rawKey || '');
      const value = decodeURIComponent(rawValueParts.join('=') || '');

      if (key) {
        nextParams[key] = value;
      }

      return nextParams;
    }, {});

    const fallbackMatch = key => {
      const match = url.match(new RegExp(`[?#&]${key}=([^&#]+)`));
      return match ? decodeURIComponent(match[1]) : null;
    };

    return {
      code: params.code || fallbackMatch('code'),
      accessToken: params.access_token || fallbackMatch('access_token'),
      idToken: params.id_token || fallbackMatch('id_token'),
      state: params.state || fallbackMatch('state'),
      error: params.error || fallbackMatch('error'),
      errorDescription:
        params.error_description || fallbackMatch('error_description'),
    };
  } catch (e) {
    return {};
  }
};

const SocialLogin = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webviewRef = useRef(null);

  const provider = route?.params?.provider || 'KAKAO';
  const providerLabel = PROVIDER_LABELS[provider] || '소셜';

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    message: '',
    onPress: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oauthConfig = useMemo(() => {
    if (provider === 'KAKAO') {
      return {
        clientId: KAKAO_CLIENT_ID,
        redirectUri: KAKAO_REDIRECT_URI,
        requiredLabel: 'KAKAO_CLIENT_ID 또는 KAKAO_REDIRECT_URI',
        authUrl: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
          KAKAO_REDIRECT_URI,
        )}`,
      };
    }

    if (provider === 'NAVER') {
      const state = generateState(provider);

      return {
        clientId: NAVER_SEARCH_CLIENT_ID,
        redirectUri: NAVER_REDIRECT_URI,
        clientSecret: NAVER_SEARCH_CLIENT_SECRET,
        requiredLabel:
          'NAVER_SEARCH_CLIENT_ID, NAVER_SEARCH_CLIENT_SECRET 또는 NAVER_REDIRECT_URI',
        authUrl: `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_SEARCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(
          NAVER_REDIRECT_URI,
        )}&state=${encodeURIComponent(state)}`,
        state,
      };
    }

    if (provider === 'GOOGLE') {
      return {
        clientId: '',
        redirectUri: '',
        requiredLabel: '구글 로그인은 앱 SDK ID Token 방식으로 처리됩니다',
        authUrl: '',
      };
    }

    return {
      clientId: '',
      redirectUri: '',
      requiredLabel: '지원하지 않는 소셜 provider',
      authUrl: '',
    };
  }, [provider]);

  const openError = (message, onPress = null) =>
    setModal({visible: true, message, onPress});
  const openNotice = (message, onPress) =>
    setModal({visible: true, message, onPress});
  const handleCloseModal = () =>
    setModal(prev => ({...prev, visible: false, onPress: null}));

  const loginWithProviderToken = tokenValue => {
    if (provider === 'GOOGLE') {
      return authApi.loginGoogle(tokenValue);
    }
    if (provider === 'NAVER') {
      return authApi.loginNaver(tokenValue);
    }
    return authApi.loginKakao(tokenValue);
  };

  const exchangeNaverCode = async ({code, state}) => {
    const params = buildQueryString({
      grant_type: 'authorization_code',
      client_id: NAVER_SEARCH_CLIENT_ID,
      client_secret: NAVER_SEARCH_CLIENT_SECRET,
      code,
      state: state || oauthConfig.state || '',
    });

    const response = await fetch(
      `https://nid.naver.com/oauth2.0/token?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(
        data.error_description || '네이버 access token 발급 실패',
      );
    }

    return data.access_token;
  };

  const handleLoginByToken = async tokenValue => {
    if (!tokenValue || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginWithProviderToken(tokenValue);
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

      const shouldContinueSocialSignUp =
        data.status === 'SOCIAL_ACCOUNT_NOT_LINKED' ||
        (data.status == null && data.isNewUser);

      if (shouldContinueSocialSignUp) {
        if (!data.socialSignupToken) {
          openError('소셜 가입 세션이 없음', () =>
            navigation.reset({
              index: 0,
              routes: [{name: 'LoginIntro'}],
            }),
          );
          return;
        }

        navigation.replace('PhoneCertificate', {
          user: 'USER',
          agreements: [],
          isSocial: true,
          provider,
          socialSignupToken: data.socialSignupToken,
          socialProfile: data.profile ||
            data.socialProfile || {
              email: data.email || '',
              nickname: data.nickname || '',
              name: data.name || '',
              birthday: data.birthday || '',
              gender: data.gender || '',
            },
        });
        return;
      }

      const isLinkedSocialAccount =
        data.status === 'LINKED' || (data.status == null && !data.isNewUser);

      if (!isLinkedSocialAccount || !data.accessToken || !data.refreshToken) {
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
      await storeLastLoginProvider(provider);

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
        `${providerLabel} 로그인 중 오류가 발생했습니다.`;
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

    if (url?.startsWith(oauthConfig.redirectUri)) {
      const {code, accessToken, idToken, state, error, errorDescription} =
        parseUrlParams(url);

      if (error) {
        openError(
          errorDescription || `${providerLabel} 인증이 취소되었습니다.`,
          () =>
            navigation.reset({
              index: 0,
              routes: [{name: 'LoginIntro'}],
            }),
        );
        return false;
      }

      if (provider === 'NAVER' && code) {
        exchangeNaverCode({code, state})
          .then(handleLoginByToken)
          .catch(e =>
            openError(e?.message || '네이버 access token 발급 실패', () =>
              navigation.reset({
                index: 0,
                routes: [{name: 'LoginIntro'}],
              }),
            ),
          );
        return false;
      }

      const tokenValue = provider === 'GOOGLE' ? idToken : accessToken || code;

      if (tokenValue) {
        handleLoginByToken(tokenValue);
        return false;
      }

      const debugUrl =
        provider === 'NAVER' && url ? `\n${url.slice(0, 180)}` : '';

      openError(`${providerLabel} 인증 토큰이 없음${debugUrl}`, () =>
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginIntro'}],
        }),
      );
      return false;
    }

    return true;
  };

  if (
    !oauthConfig.clientId ||
    (provider === 'NAVER' && !oauthConfig.clientSecret) ||
    !oauthConfig.redirectUri ||
    !oauthConfig.authUrl
  ) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={COLORS.primary_orange} />
        <AlertModal
          visible={true}
          title={`${oauthConfig.requiredLabel}가 비어있음.\n`}
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
        source={{uri: oauthConfig.authUrl}}
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
