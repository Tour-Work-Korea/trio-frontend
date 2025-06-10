import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';

export const tryAutoLogin = async () => {
  try {
    const credentials = await EncryptedStorage.getItem('user-credentials');
    console.log('🔑 Stored Credentials:', credentials);

    if (!credentials) return false;

    const {email, password, userRole} = JSON.parse(credentials);
    return await tryLogin(email, password, userRole);
  } catch (err) {
    console.warn('❌ tryAutoLogin Error:', err);
    return false;
  }
};

export const tryLogin = async (email, password, userRole) => {
  try {
    const res = await authApi.login(email, password);
    const authorizationHeader = res.headers?.authorization;
    const accessToken = authorizationHeader?.replace('Bearer ', '');

    if (!accessToken) {
      throw new Error('토큰 없음');
    }

    const {setTokens, setUserRole} = useUserStore.getState();
    setTokens({accessToken, refreshToken: null});
    setUserRole(userRole);

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
export const tryLogout = async () => {
  try {
    await EncryptedStorage.removeItem('user-credentials');
  } catch (err) {
    console.warn('EncryptedStorage 삭제 실패:', err);
  } finally {
    useUserStore.getState().clearUser();
  }
};
