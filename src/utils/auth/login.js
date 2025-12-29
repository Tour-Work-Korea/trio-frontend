// authFlow.js
import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import hostMyApi from '@utils/api/hostMyApi';
import {log, mask} from '@utils/logger';
import {navigate} from '@utils/navigationService';

const REFRESH_KEY = 'refresh-token';

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

const storeLoginInfo = async (res, userRole) => {
  const accessToken = res.data.accessToken;
  const refreshToken = res.data.refreshToken;

  log.info(
    '✅ login success: accessToken=',
    mask(accessToken),
    'refreshToken=',
    mask(refreshToken),
    'role=',
    userRole,
  );

  const {setTokens, setUserRole} = useUserStore.getState();
  setTokens({accessToken});
  setUserRole(userRole);

  await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);
  const check = await EncryptedStorage.getItem(REFRESH_KEY);
  log.info('🔐 saved refresh?', !!check);

  await updateProfile(userRole);
};

export const tryLogin = async (email, password, userRole) => {
  log.info('🔓 tryLogin: role=', userRole);
  try {
    const res = await authApi.login(email, password, userRole);
    await storeLoginInfo(res, userRole);
    return true;
  } catch (err) {
    log.warn('❌ tryLogin failed:', err?.response?.status, err?.message);
    await EncryptedStorage.removeItem(REFRESH_KEY);
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
  const {setUserProfile, setHostProfile} = useUserStore.getState();

  try {
    if (role === 'HOST') {
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
      log.info('👤 HOST profile loaded');
    } else if (role === 'USER') {
      const res = await userMyApi.getMyProfile();
      const {
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
