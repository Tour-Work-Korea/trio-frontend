import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_LOGIN_PROVIDER_KEY = 'last-login-provider';

export const LOGIN_PROVIDERS = {
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
  GOOGLE: 'GOOGLE',
  EMAIL: 'EMAIL',
};

export const storeLastLoginProvider = async provider => {
  if (!provider) {
    return;
  }

  await AsyncStorage.setItem(LAST_LOGIN_PROVIDER_KEY, provider);
};

export const getLastLoginProvider = async () => {
  return AsyncStorage.getItem(LAST_LOGIN_PROVIDER_KEY);
};

export const clearLastLoginProvider = async () => {
  await AsyncStorage.removeItem(LAST_LOGIN_PROVIDER_KEY);
};
