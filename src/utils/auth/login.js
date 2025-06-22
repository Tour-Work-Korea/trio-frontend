import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';

export const tryAutoLogin = async () => {
  try {
    const credentials = await EncryptedStorage.getItem('user-credentials');
    console.log('🔑 Stored Credentials:', credentials);

    if (!credentials) return false;

    const {email, password, userRole, provider, accessCode} =
      JSON.parse(credentials);
    if (provider === 'KAKAO') {
      const {success} = await tryKakaoLogin({accessCode, userRole});
      return success;
    } else {
      return await tryLogin(email, password, userRole);
    }
  } catch (err) {
    console.warn('❌ tryAutoLogin Error:', err);
    return false;
  }
};

const commonLogin = (res, userRole) => {
  const authorizationHeader = res.headers?.authorization;
  const accessToken = authorizationHeader?.replace('Bearer ', '');
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
    throw new Error('accessToken 없음');
  }
  if (!refreshToken) {
    throw new Error('refreshToken 없음');
  }

  const {setTokens, setUserRole} = useUserStore.getState();
  setTokens({accessToken, refreshToken});
  setUserRole(userRole);

  console.log('accessToken: ', accessToken);
  console.log('refreshToken: ', refreshToken);
};

export const tryLogin = async (email, password, userRole) => {
  try {
    const res = await authApi.login(email, password);
    commonLogin(res, userRole);

    await EncryptedStorage.setItem(
      'user-credentials',
      JSON.stringify({email, password, userRole}),
    );

    return true; // 성공
  } catch (err) {
    await EncryptedStorage.removeItem('user-credentials');
    useUserStore.getState().clearUser();
    return false; // 실패
  }
};

export const tryKakaoLogin = async ({accessCode, userRole}) => {
  try {
    const res = await authApi.loginKakao(accessCode);
    commonLogin(res, userRole);

    // 소셜 로그인은 아이디/비번이 없으므로 provider 정보만 저장
    await EncryptedStorage.setItem(
      'user-credentials',
      JSON.stringify({provider: 'KAKAO', userRole, accessCode}),
    );
    return {
      success: true,
      isNewUser: res.data.isNewUser,
    };
  } catch (err) {
    useUserStore.getState().clearUser();
    await EncryptedStorage.removeItem('user-credentials');
    return {success: false};
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
