// axiosInstance.js
import qs from 'qs';
import axios from 'axios';
import useUserStore from '@stores/userStore';
import {API_BASE_URL} from '@env';
import authApi from './authApi';
import EncryptedStorage from 'react-native-encrypted-storage';

const REFRESH_KEY = 'refresh-token';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 5000,
  headers: {'Content-Type': 'application/json'},
  paramsSerializer: params => qs.stringify(params),
});

// 📍 REQUEST INTERCEPTOR
api.interceptors.request.use(
  async config => {
    const method = config.method?.toUpperCase() || 'GET';
    const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
    const endpoint = config.url?.replace(/^\//, '') || '';
    const fullUrl = config.params
      ? `${baseUrl}/${endpoint}?${qs.stringify(config.params)}`
      : `${baseUrl}/${endpoint}`;

    // ⛳️ STEP 1: accessToken 주입 (withAuth !== false 인 경우만)
    const token = useUserStore.getState().accessToken;
    if (config.withAuth !== false && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 보안상 토큰 값 자체는 로그로 출력하지 않음
    console.log(`🔷 [Request] ${method} ${fullUrl}`);
    if (config.data) console.log('📦 [Request Body]', config.data);

    return config;
  },
  error => Promise.reject(error),
);

// 📍 TOKEN REFRESH FLOW
let isRefreshing = false;
let queue = [];

const resolveQueue = (error, token = null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

// 📍 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  res => {
    console.log('🟢 [Response]', res.status);
    return res;
  },
  async err => {
    const originalRequest = err.config;
    const status = err.response?.status;

    // refresh 엔드포인트 자체는 재시도 X
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.warn('🛑 [/auth/refresh 요청은 재시도하지 않음]');
      return Promise.reject(err);
    }

    console.log(
      `🔴 [Error] ${originalRequest.method?.toUpperCase()} ${
        originalRequest.url
      }`,
    );
    console.log('🔴 [Error Response]', status, err.response?.data);

    if (status === 403 && !originalRequest._retry) {
      console.log('🔁 [Retry Trigger] accessToken 만료 → 재발급 시도');
      originalRequest._retry = true;

      if (isRefreshing) {
        console.log('⏳ [Token Refreshing] 이미 재발급 중 → 대기열 추가');
        return new Promise((res, rej) => {
          queue.push({resolve: res, reject: rej});
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        console.log('🔄 [Refresh] 요청 시작');
        const storedRefresh = await EncryptedStorage.getItem(REFRESH_KEY);
        if (!storedRefresh)
          throw new Error('No refresh token in secure storage');

        const res = await authApi.refreshToken(storedRefresh);
        console.log('✅ [Refresh] 성공', res.status);

        const accessToken = res.data.accessToken;
        const refreshTokenUpdated = res.data.refreshToken;

        // accessToken 상태 반영
        useUserStore.getState().setTokens({accessToken});
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;

        // 새 refreshToken이 오면 교체 저장
        if (refreshTokenUpdated) {
          await EncryptedStorage.setItem(REFRESH_KEY, refreshTokenUpdated);
        }

        resolveQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        console.warn(
          '❌ [Refresh Failed]',
          error?.response?.status,
          error?.message,
        );
        resolveQueue(error, null);
        await EncryptedStorage.removeItem(REFRESH_KEY);
        useUserStore.getState().clearUser();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;
