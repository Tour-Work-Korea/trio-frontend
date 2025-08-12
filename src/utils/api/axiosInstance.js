import qs from 'qs';
import axios from 'axios';
import useUserStore from '@stores/userStore';
import {API_BASE_URL} from '@env';
import authApi from './authApi';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
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

    // ⛳️ STEP 1: 토큰 주입
    const token = useUserStore.getState().accessToken;
    if (config.withAuth !== false && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⛳️ STEP 2: RefreshToken 쿠키 직접 삽입 (React Native 용)
    const cookie = useUserStore.getState().refreshToken;
    if (cookie) {
      config.headers.Cookie = 'refreshToken=' + cookie;
    }

    // ⛳️ STEP 3: 로그 출력
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
    console.log('🟢 [Response]', res.status, res.data);
    return res;
  },
  async err => {
    const originalRequest = err.config;
    const status = err.response?.status;

    // ✅ [예외 처리] refreshToken 요청은 재시도 로직 타지 않음
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
      console.log('🔁 [Retry Trigger] accessToken 만료로 인해 재발급 시도');
      originalRequest._retry = true;

      if (isRefreshing) {
        console.log('⏳ [Token Refreshing] 이미 재발급 중, 대기열에 요청 추가');
        return new Promise((res, rej) => {
          queue.push({resolve: res, reject: rej});
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        console.log('🔄 [Refresh] /auth/refresh 요청 시작');
        const res = await authApi.refreshToken();
        console.log('✅ [Refresh] 재발급 성공', res.status, res.data);

        const accessToken = res.data.accessToken;

        // React Native에서는 set-cookie 헤더를 못 받으므로 refreshToken 파싱은 생략
        useUserStore.getState().setTokens({accessToken});
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;

        // 대기 중이던 요청 재시도
        resolveQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        console.warn(
          '❌ [Refresh Failed]',
          error.response?.status,
          error.response?.data?.message || error.message,
        );
        resolveQueue(error, null);
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
