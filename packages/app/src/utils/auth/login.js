// authFlow.js
import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import { log, mask } from '@utils/logger';
import { reset } from '@utils/navigationService';
import {
  getProfile as kakaoGetProfile,
  login as kakaoLogin,
} from '@react-native-seoul/kakao-login';
import {signInWithGoogle} from '@utils/auth/googleSignIn';
import { syncFcmToken, getDeviceId } from '@utils/fcmService';
import notificationApi from '@utils/api/notificationApi';
import { WEB_SESSION_ACCESS_TOKEN } from '@utils/auth/webSession';

const REFRESH_KEY = 'refresh-token';

const cleanKakaoValue = value => {
  if (value == null) {
    return '';
  }

  const text = String(value);
  return text === 'null' || text === 'undefined' ? '' : text;
};

const normalizeGender = value => {
  const gender = cleanKakaoValue(value).toLowerCase();

  if (gender === 'female' || gender === 'f') {
    return 'F';
  }
  if (gender === 'male' || gender === 'm') {
    return 'M';
  }

  return '';
};

const normalizeBirthday = ({birthday, birthyear}) => {
  const rawBirthday = cleanKakaoValue(birthday);
  const rawBirthyear = cleanKakaoValue(birthyear);

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawBirthday)) {
    return rawBirthday;
  }

  if (/^\d{4}$/.test(rawBirthyear) && /^\d{4}$/.test(rawBirthday)) {
    return `${rawBirthyear}-${rawBirthday.slice(0, 2)}-${rawBirthday.slice(2)}`;
  }

  return '';
};

const normalizeSocialProfile = data => {
  const profile = data?.profile || data?.socialProfile || {};
  return {
    email: cleanKakaoValue(profile.email || data?.email),
    nickname: cleanKakaoValue(profile.nickname || data?.nickname),
    name: cleanKakaoValue(profile.name || data?.name),
    birthday: normalizeBirthday({
      birthday: profile.birthday || data?.birthday,
      birthyear: profile.birthyear || data?.birthyear,
    }),
    gender: normalizeGender(profile.gender || data?.gender),
  };
};

const mergeSocialProfiles = (...profiles) =>
  profiles.reduce(
    (merged, profile = {}) => ({
      email: merged.email || profile.email || '',
      nickname: merged.nickname || profile.nickname || '',
      name: merged.name || profile.name || '',
      birthday: merged.birthday || profile.birthday || '',
      gender: merged.gender || profile.gender || '',
    }),
    {},
  );

const shouldContinueSocialSignUp = data =>
  data?.status === 'SOCIAL_ACCOUNT_NOT_LINKED' ||
  (data?.status == null && data?.isNewUser);

const getKakaoProfileFallback = async () => {
  try {
    const profile = await kakaoGetProfile();
    return normalizeSocialProfile(profile);
  } catch (error) {
    log.warn('카카오 프로필 조회 실패:', error?.message);
    return {};
  }
};

const clearAuthSession = async ({ silent = false } = {}) => {
  try {
    await EncryptedStorage.removeItem(REFRESH_KEY);
  } catch (storageErr) {
    log.warn('🧹 remove refresh failed:', storageErr?.message);
  }

  useUserStore.getState().clearUser();

  if (!silent) {
    reset([{ name: 'Login', params: { reason: 'refresh_failed' } }]);
  }
};

export const tryKakaoLoginNative = async (userRole) => {
  log.info('tryKakaoLoginNative: role=', userRole);
  try {
    // 1. 카카오 네이티브 SDK 실행 (앱 유무 파악 및 앱/웹 자동 전환)
    const kakaoToken = await kakaoLogin();
    log.info('카카오 SDK 로그인 성공, Access Token 획득');

    // 2. 획득한 accessToken을 백엔드로 전달
    const res = await authApi.loginKakao(kakaoToken.accessToken);
    const data = res.data || {};

    if (shouldContinueSocialSignUp(data)) {
      const backendProfile = normalizeSocialProfile(data);
      const sdkProfile = await getKakaoProfileFallback();

      return {
        success: true,
        isNewUser: true,
        provider: 'KAKAO',
        socialSignupToken: data.socialSignupToken,
        socialProfile: mergeSocialProfiles(backendProfile, sdkProfile),
        message: data.message,
      };
    }

    // 3. 기존 유저일 때만 백엔드에서 응답받은 우리 서비스의 토큰을 저장
    await storeLoginInfo(res, userRole);

    // 4. FCM 토큰 동기화 (Authorization 헤더가 설정된 상태로 등록)
    await syncFcmToken();

    return {
      success: true,
      isNewUser: false,
      provider: 'KAKAO',
    };
  } catch (err) {
    log.warn('❌ tryKakaoLoginNative failed:', err?.message);
    useUserStore.getState().clearUser();

    return {
      success: false,
      message: err?.message,
    };
  }
};

export const tryGoogleLoginNative = async (userRole) => {
  log.info('tryGoogleLoginNative: role=', userRole);
  try {
    const googleResult = await signInWithGoogle();

    if (googleResult?.cancelled) {
      return {
        success: false,
        cancelled: true,
        message: 'cancelled',
      };
    }

    const res = await authApi.loginGoogle(googleResult.idToken);
    const data = res.data || {};

    if (shouldContinueSocialSignUp(data)) {
      const backendProfile = normalizeSocialProfile(data);

      return {
        success: true,
        isNewUser: true,
        provider: 'GOOGLE',
        socialSignupToken: data.socialSignupToken,
        socialProfile: mergeSocialProfiles(
          backendProfile,
          googleResult.profile,
        ),
        message: data.message,
      };
    }

    await storeLoginInfo(res, userRole);
    await syncFcmToken();

    return {
      success: true,
      isNewUser: false,
      provider: 'GOOGLE',
    };
  } catch (err) {
    log.warn('❌ tryGoogleLoginNative failed:', err?.message);
    useUserStore.getState().clearUser();

    return {
      success: false,
      message: err?.message,
    };
  }
};

export const tryAutoLogin = async ({loadProfile = true} = {}) => {
  log.info('🚪 tryAutoLogin: start');
  try {
    if (Platform.OS === 'web') {
      const ok = await tryRefresh({ silent: true });
      log.info('🚪 tryAutoLogin: web refresh result =', ok);
      return ok;
    }

    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🔐 has refreshToken?', !!storedRefresh);
    if (!storedRefresh) {
      return false;
    }

    const ok = await tryRefresh({ silent: true });
    log.info('🚪 tryAutoLogin: refresh result =', ok);
    if (ok && loadProfile) {
      const { userRole } = useUserStore.getState();
      log.info('👤 tryAutoLogin: userRole =', userRole);
      if (userRole) {
        await updateProfile(userRole);
      }
    }
    return ok;
  } catch (err) {
    log.warn('❌ tryAutoLogin Error:', err?.message);
    return false;
  }
};

export const storeLoginTokens = async ({
  accessToken,
  refreshToken,
  userRole,
}) => {
  log.info(
    '✅ login success: accessToken=',
    mask(accessToken),
    'refreshToken=',
    mask(refreshToken),
    'role=',
    userRole,
  );

  const { setTokens, setUserRole } = useUserStore.getState();
  if (accessToken) {
    setTokens({ accessToken });
  }
  if (userRole) {
    setUserRole(userRole);
  }

  if (refreshToken) {
    await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🔐 saved refresh?', !!check);
  }

  if (accessToken) {
    await updateProfile(userRole);
  }
};

const storeLoginInfo = async (res, userRole) => {
  const { accessToken, refreshToken } = res.data || {};

  await storeLoginTokens({ accessToken, refreshToken, userRole });
};

export const storeWebSessionInfo = async (data = {}, fallbackRole = 'USER') => {
  const {
    setTokens,
    setUserRole,
    setUserProfile,
  } = useUserStore.getState();
  const role = data.role || fallbackRole || 'USER';
  const accessToken =
    data.accessToken || data.token || data.jwt || WEB_SESSION_ACCESS_TOKEN;

  setTokens({ accessToken });
  setUserRole(role);
  setUserProfile?.({
    userId: data.userId ?? null,
    name: data.name ?? '',
    nickname: data.nickname ?? data.name ?? '',
    photoUrl: data.photoUrl ?? null,
    phone: data.phone ?? '',
    email: data.email ?? '',
    mbti: data.mbti ?? '',
    instagramId: data.instagramId ?? '',
    gender: data.gender ?? 'F',
    birthDate: data.birthDate ?? null,
    age: calculateAge(data.birthDate),
  });

  await updateProfile(role);
};

export const tryLogin = async (email, password, userRole) => {
  log.info('🔓 tryLogin: role=', userRole);
  try {
    const res = await authApi.login(email, password, userRole);
    if (Platform.OS === 'web') {
      await storeWebSessionInfo(res.data, userRole);
      return res.data;
    }

    await storeLoginInfo(res, userRole);

    log.info('🔓 tryLogin: sync FCM token');
    await syncFcmToken();

    return res.data;
  } catch (err) {
    log.warn('❌ tryLogin failed:', err?.response?.status, err?.message);

    if (Platform.OS === 'ios') {
      try {
        await EncryptedStorage.removeItem(REFRESH_KEY);
      } catch (storageErr) {
        log.warn('🧹 iOS remove refresh failed:', storageErr?.message);
      }
    } else {
      await EncryptedStorage.removeItem(REFRESH_KEY);
    }
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🧹 removed refresh?', !check);

    useUserStore.getState().clearUser();
    throw err;
  }
};

export const tryKakaoLogin = async (accessCode, userRole) => {
  log.info('🟨 tryKakaoLogin: role=', userRole);
  try {
    const res = await authApi.loginKakao(accessCode);
    const data = res.data || {};
    if (shouldContinueSocialSignUp(data)) {
      const backendProfile = normalizeSocialProfile(data);

      return {
        success: true,
        isNewUser: true,
        provider: 'KAKAO',
        socialSignupToken: data.socialSignupToken,
        socialProfile: backendProfile,
      };
    }
    await storeLoginInfo(res, userRole);
    return { success: true, isNewUser: false, provider: 'KAKAO' };
  } catch (err) {
    log.warn('❌ tryKakaoLogin failed:', err?.message);
    useUserStore.getState().clearUser();
    await EncryptedStorage.removeItem(REFRESH_KEY);
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🧹 removed refresh?', !check);

    return { success: false };
  }
};

export const tryRefresh = async ({ silent = false } = {}) => {
  log.info('🔄 tryRefresh: start');
  try {
    if (Platform.OS === 'web') {
      const res = await authApi.refreshToken();
      await storeWebSessionInfo(res.data);
      return true;
    }

    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) {
      log.warn('🔄 tryRefresh: no refresh token');
      await clearAuthSession({ silent });
      return false;
    }
    const res = await authApi.refreshToken(storedRefresh);

    const accessToken = res.data.accessToken;
    const refreshTokenUpdated = res.data.refreshToken;

    useUserStore.getState().setTokens({ accessToken });
    log.info('🔄 tryRefresh: new accessToken=', mask(accessToken));

    if (refreshTokenUpdated) {
      await EncryptedStorage.setItem(REFRESH_KEY, refreshTokenUpdated);
      log.info('🔄 tryRefresh: refreshToken rotated');
    }
    return true;
  } catch (error) {
    log.warn('❌ tryRefresh failed:', error?.response?.status, error?.message);
    await clearAuthSession({ silent });
    return false;
  }
};

export const tryLogout = async () => {
  log.info('🚪 tryLogout');
  try {
    try {
      const deviceId = await getDeviceId();
      await notificationApi.logoutToken(deviceId);
    } catch (e) {
      log.warn('FCM 토큰 로그아웃 실패:', e?.message);
    }
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    await authApi.logout(storedRefresh);
    await EncryptedStorage.removeItem(REFRESH_KEY);
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🧹 removed refresh?', !check);
  } catch (err) {
    log.warn('EncryptedStorage 삭제 실패:', err?.message);
  } finally {
    useUserStore.getState().clearUser();
  }
};

export const refreshUserProfile = async role => updateProfile(role);

const updateProfile = async role => {
  log.info('👤 updateProfile: role=', role);
  const { setUserProfile } = useUserStore.getState();

  try {
    if (role === 'USER') {
      const res = await userMyApi.getMyProfile();
      const {
        userId,
        name,
        nickname,
        photoUrl,
        phone,
        email,
        mbti,
        instagramId,
        gender,
        birthDate,
      } = res.data;

      setUserProfile({
        userId: userId ?? null,
        name: name ?? '',
        nickname: nickname ?? '',
        photoUrl:
          photoUrl && photoUrl !== '사진을 추가해주세요' ? photoUrl : null,
        phone: phone ?? '',
        email: email ?? '',
        mbti: mbti ?? '',
        instagramId: instagramId ?? '',
        gender: gender ?? 'F',
        birthDate: birthDate ?? null,
        age: calculateAge(birthDate),
      });
      log.info('👤 USER profile loaded');
    }
  } catch (error) {
    log.warn(`👤 ${role} profile fetch failed:`, error?.message);
  }
};

export function calculateAge(birthDateString) {
  if (!birthDateString) {
    return '00';
  }
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
