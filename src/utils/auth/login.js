import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import hostMyApi from '@utils/api/hostMyApi';

export const tryAutoLogin = async () => {
  try {
    const credentials = await EncryptedStorage.getItem('user-credentials');
    console.log('🔑 Stored Credentials:', credentials);

    if (!credentials) {
      return;
    }

    const {userRole} = JSON.parse(credentials);
    const isRefreshSuccess = await tryRefresh();
    if (isRefreshSuccess) {
      updateProfile(userRole);
    }
  } catch (err) {
    console.warn('❌ tryAutoLogin Error:', err);
    throw new Error('자동 로그인 실패');
  }
};

const storeLoginInfo = (res, userRole) => {
  const authorizationHeader = res.headers?.authorization;
  let accessToken = authorizationHeader?.replace('Bearer ', '');
  let refreshToken;

  const rawCookies = res.headers['set-cookie'] || res.headers['Set-Cookie'];
  if (rawCookies && rawCookies.length > 0) {
    const cookie = rawCookies[0];
    const match = cookie.match(/refreshToken=([^;]+);?/);

    if (match) {
      refreshToken = match[1];
    }
  }

  if (!accessToken) {
    accessToken = res.data?.accessToken;
  }
  if (!refreshToken) {
    throw new Error('refreshToken 없음');
  }

  const {setTokens, setUserRole} = useUserStore.getState();
  setTokens({accessToken, refreshToken});
  setUserRole(userRole);

  console.log('accessToken: ', accessToken);
  console.log('refreshToken: ', refreshToken);

  updateProfile(userRole);
};

export const tryLogin = async (email, password, userRole) => {
  try {
    const res = await authApi.login(email, password, userRole);
    storeLoginInfo(res, userRole);

    await EncryptedStorage.setItem(
      'user-credentials',
      JSON.stringify({userRole}),
    );
    return true; // 성공
  } catch (err) {
    await EncryptedStorage.removeItem('user-credentials');
    useUserStore.getState().clearUser();
    throw err;
  }
};

export const tryKakaoLogin = async (accessCode, userRole) => {
  try {
    const res = await authApi.loginKakao(accessCode);
    storeLoginInfo(res, userRole);

    // 소셜 로그인은 아이디/비번이 없으므로 provider 정보만 저장
    await EncryptedStorage.setItem(
      'user-credentials',
      JSON.stringify({userRole}),
    );
    return {
      success: true,
      isNewUser: res.data.isNewUser,
    };
  } catch (err) {
    console.log('실패', err.message);
    useUserStore.getState().clearUser();
    await EncryptedStorage.removeItem('user-credentials');
    return {success: false};
  }
};

export const tryRefresh = async () => {
  try {
    const res = await authApi.refreshToken();
    const accessToken = res.data.accessToken;
    let refreshToken;
    const rawCookies = res.headers['set-cookie'] || res.headers['Set-Cookie'];
    if (rawCookies && rawCookies.length > 0) {
      const cookie = rawCookies[0];
      const match = cookie.match(/refreshToken=([^;]+);?/);
      if (match) {
        refreshToken = match[1];
      }
    }
    useUserStore.getState().setTokens({accessToken, refreshToken});
    return true;
  } catch (error) {
    return false;
  }
};

export const tryLogout = async () => {
  try {
    await EncryptedStorage.removeItem('user-credentials');
  } catch (err) {
    console.warn('EncryptedStorage 삭제 실패:', err);
  } finally {
    useUserStore.getState().clearUser();
  }
};

const updateProfile = async role => {
  const {setUserProfile, setHostProfile} = useUserStore.getState(); // ✅ 안전하게 접근

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
    console.warn(`${role} 정보를 가져오는데 실패했습니다.`);
  }
};

export function calculateAge(birthDateString) {
  if (!birthDateString) {
    return '00';
  }
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();

  // 생일이 안 지났으면 1살 빼기
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
