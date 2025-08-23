// authFlow.js
import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import hostMyApi from '@utils/api/hostMyApi';

const REFRESH_KEY = 'refresh-token'; // 👈 refreshToken만 저장

export const tryAutoLogin = async () => {
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    console.log('🔑 Has refresh token?', !!storedRefresh);

    if (!storedRefresh) return;

    const isRefreshSuccess = await tryRefresh();
    if (isRefreshSuccess) {
      // userRole은 Zustand에 저장/유지
      const {userRole} = useUserStore.getState();
      if (userRole) await updateProfile(userRole);
    }
  } catch (err) {
    console.warn('❌ tryAutoLogin Error:', err);
    throw new Error('자동 로그인 실패');
  }
};

const storeLoginInfo = async (res, userRole) => {
  const accessToken = res.data.accessToken;
  const refreshToken = res.data.refreshToken;

  const {setTokens, setUserRole} = useUserStore.getState();

  // accessToken만 store에 반영 (persist 허용)
  setTokens({accessToken});
  setUserRole(userRole);

  // 🔐 refreshToken은 암호 저장소에만
  await EncryptedStorage.setItem(REFRESH_KEY, refreshToken);

  await updateProfile(userRole);
};

export const tryLogin = async (email, password, userRole) => {
  try {
    const res = await authApi.login(email, password, userRole);
    await storeLoginInfo(res, userRole); // 👈 await 빠뜨리지 않기
    return true;
  } catch (err) {
    await EncryptedStorage.removeItem(REFRESH_KEY);
    useUserStore.getState().clearUser();
    throw err;
  }
};

export const tryKakaoLogin = async (accessCode, userRole) => {
  try {
    const res = await authApi.loginKakao(accessCode);
    await storeLoginInfo(res, userRole);
    return {
      success: true,
      isNewUser: res.data.isNewUser,
    };
  } catch (err) {
    console.log('소셜 로그인 실패:', err?.message);
    useUserStore.getState().clearUser();
    await EncryptedStorage.removeItem(REFRESH_KEY);
    return {success: false};
  }
};

export const tryRefresh = async () => {
  try {
    const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) return false;

    const res = await authApi.refreshToken(storedRefresh);

    const accessToken = res.data.accessToken;
    const refreshTokenUpdated = res.data.refreshToken;

    // accessToken만 store에 반영
    useUserStore.getState().setTokens({accessToken});

    // 서버가 새 refreshToken을 발급하면 교체 저장
    if (refreshTokenUpdated) {
      await EncryptedStorage.setItem(REFRESH_KEY, refreshTokenUpdated);
    }
    return true;
  } catch (error) {
    // refresh 실패 시 정리
    await EncryptedStorage.removeItem(REFRESH_KEY);
    useUserStore.getState().clearUser();
    return false;
  }
};

export const tryLogout = async () => {
  try {
    await EncryptedStorage.removeItem(REFRESH_KEY);
  } catch (err) {
    console.warn('EncryptedStorage 삭제 실패:', err);
  } finally {
    useUserStore.getState().clearUser();
  }
};

const updateProfile = async role => {
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
    }
  } catch (error) {
    console.warn(`${role} 정보를 가져오는데 실패했습니다.`, error?.message);
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
