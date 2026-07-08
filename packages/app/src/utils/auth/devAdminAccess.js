import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {API_BASE_URL} from '@env';

const DEV_API_BASE_URL = 'https://dev.ddakji.kr/api/v1';
const DEV_WEB_ORIGIN = 'https://app-dev.ddakji.kr';
const DEV_WEB_ADMIN_AUTH_KEY = 'dev-web-admin-authenticated';

const normalizeUrl = value => String(value || '').replace(/\/$/, '');

export const isDevApiBaseUrl = () =>
  normalizeUrl(API_BASE_URL) === DEV_API_BASE_URL;

export const isDevWebOrigin = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  return normalizeUrl(window.location.origin) === DEV_WEB_ORIGIN;
};

export const shouldRequireDevWebAdmin = () =>
  isDevApiBaseUrl() && isDevWebOrigin();

export const markDevWebAdminAuthenticated = async () => {
  if (!shouldRequireDevWebAdmin()) {
    return;
  }

  await AsyncStorage.setItem(DEV_WEB_ADMIN_AUTH_KEY, '1');
};

export const isDevWebAdminMarkedAuthenticated = async () => {
  if (!shouldRequireDevWebAdmin()) {
    return false;
  }

  return (await AsyncStorage.getItem(DEV_WEB_ADMIN_AUTH_KEY)) === '1';
};

export const clearDevWebAdminAuthenticated = async () => {
  await AsyncStorage.removeItem(DEV_WEB_ADMIN_AUTH_KEY);
};
