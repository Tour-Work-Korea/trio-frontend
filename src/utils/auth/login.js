// authFlow.js
import EncryptedStorage from 'react-native-encrypted-storage';
import {Platform} from 'react-native';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import hostMyApi from '@utils/api/hostMyApi';
import {log, mask} from '@utils/logger';
import {navigate} from '@utils/navigationService';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

const REFRESH_KEY = 'refresh-token';

export const tryKakaoLoginNative = async (userRole) => {
  log.info('tryKakaoLoginNative: role=', userRole);
  try {
    // 1. 카카오 네이티브 SDK 실행 (앱 유무 파악 및 앱/웹 자동 전환)
    const kakaoToken = await kakaoLogin();
    log.info('카카오 SDK 로그인 성공, Access Token 획득');

    // 2. 획득한 accessToken을 백엔드로 전달
    const res = await authApi.loginKakao(kakaoToken.accessToken);
    
    // 3. 백엔드에서 응답받은 우리 서비스의 토큰을 저장
    await storeLoginInfo(res, userRole);
    
    return {
      success: true, 
      isNewUser: res.data.isNewUser, 
      externalId: res.data.externalId
    };
  } catch (err) {
    log.warn('❌ tryKakaoLoginNative failed:', err?.message);
    useUserStore.getState().clearUser();
    
    return {
      success: false, 
      message: err?.message
    };
  }
};

export const tryAutoLogin = async () => {
  log.info('🚪 tryAutoLogin: start');
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🔐 has refreshToken?', !!storedRefresh);
    if (!storedRefresh) return false;

    const ok = await tryRefresh({silent: true});
    log.info('🚪 tryAutoLogin: refresh result =', ok);
    if (ok) {
      const {userRole} = useUserStore.getState();
      log.info('👤 tryAutoLogin: userRole =', userRole);
      if (userRole) await updateProfile(userRole);
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
  needVerification
}) => {
  log.info(
    '✅ login success: accessToken=',
    mask(accessToken),
    'refreshToken=',
    mask(refreshToken),
    'role=',
    userRole,
    'needVerification=',
    needVerification
  );

  const {setTokens, setUserRole, setIsVerified} = useUserStore.getState();
  setTokens({accessToken});
  setUserRole(userRole);

  // needVerification이 "true"면 본인 인증이 안 된 상태이므로 false 저장
  if (setIsVerified) {
    if (userRole === 'HOST') {
      setIsVerified(true); // HOST는 무조건 인증 통과 상태로 간주
    } else {
      setIsVerified(needVerification !== "true"); // USER는 서버 응답에 따름
    }
  }

  await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);
  const check = await EncryptedStorage.getItem(REFRESH_KEY);
  log.info('🔐 saved refresh?', !!check);

  await updateProfile(userRole);
};

const storeLoginInfo = async (res, userRole) => {
  const { accessToken, refreshToken, needVerification } = res.data;

  await storeLoginTokens({ accessToken, refreshToken, userRole, needVerification});
};

export const tryLogin = async (email, password, userRole) => {
  log.info('🔓 tryLogin: role=', userRole);
  try {
    const res = await authApi.login(email, password, userRole);
    await storeLoginInfo(res, userRole);
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
    await storeLoginInfo(res, userRole);
    return {success: true, isNewUser: res.data.isNewUser};
  } catch (err) {
    log.warn('❌ tryKakaoLogin failed:', err?.message);
    useUserStore.getState().clearUser();
    await EncryptedStorage.removeItem(REFRESH_KEY);
    const check = await EncryptedStorage.getItem(REFRESH_KEY);
    log.info('🧹 removed refresh?', !check);

    return {success: false};
  }
};

export const tryRefresh = async ({silent = false} = {}) => {
  log.info('🔄 tryRefresh: start');
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) {
      log.warn('🔄 tryRefresh: no refresh token');
      return false;
    }
    const res = await authApi.refreshToken(storedRefresh);

    const accessToken = res.data.accessToken;
    const refreshTokenUpdated = res.data.refreshToken;

    useUserStore.getState().setTokens({accessToken});
    log.info('🔄 tryRefresh: new accessToken=', mask(accessToken));

    if (refreshTokenUpdated) {
      await EncryptedStorage.setItem(REFRESH_KEY, refreshTokenUpdated);
      log.info('🔄 tryRefresh: refreshToken rotated');
    }
    return true;
  } catch (error) {
    log.warn('❌ tryRefresh failed:', error?.response?.status, error?.message);
    await EncryptedStorage.removeItem(REFRESH_KEY);
    useUserStore.getState().clearUser();

    if (!silent) {
      navigate('Login', {reason: 'refresh_failed'});
    }
    return false;
  }
};

export const tryLogout = async () => {
  log.info('🚪 tryLogout');
  try {
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

const updateProfile = async role => {
  log.info('👤 updateProfile: role=', role);
  const {
    setUserProfile,
    setHostProfile,
    selectedHostGuesthouseId,
    setSelectedHostGuesthouseId,
  } = useUserStore.getState();

  try {
    if (role === 'HOST') {
      const res = await hostMyApi.getMyProfile();
      const {hostId, name, photoUrl, phone, email, businessNum, guesthouseProfiles} =
        res.data ?? {};
      const normalizedGuesthouseProfiles = Array.isArray(guesthouseProfiles)
        ? guesthouseProfiles.map(guesthouse => ({
            guesthouseId: guesthouse?.guesthouseId ?? null,
            guesthouseName: guesthouse?.guesthouseName ?? '',
            profileImageUrl:
              guesthouse?.profileImageUrl &&
              guesthouse.profileImageUrl !== '사진을 추가해주세요'
                ? guesthouse.profileImageUrl
                : null,
          }))
        : [];
      const profileIds = normalizedGuesthouseProfiles.map((guesthouse, index) =>
        String(guesthouse.guesthouseId ?? `guesthouse-${index}`),
      );

      setHostProfile({
        hostId: hostId ?? null,
        name: name ?? '',
        photoUrl:
          photoUrl && photoUrl !== '사진을 추가해주세요' ? photoUrl : null,
        phone: phone ?? '',
        email: email ?? '',
        businessNum: businessNum ?? '',
        guesthouseProfiles: normalizedGuesthouseProfiles,
      });

      if (profileIds.length === 0) {
        setSelectedHostGuesthouseId(null);
      } else if (
        !selectedHostGuesthouseId ||
        !profileIds.includes(String(selectedHostGuesthouseId))
      ) {
        setSelectedHostGuesthouseId(profileIds[0]);
      }
      log.info('👤 HOST profile loaded');
    } else if (role === 'USER') {
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
  if (!birthDateString) return '00';
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
