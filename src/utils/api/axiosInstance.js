import qs from 'qs'; // qs는 query string을 stringify할 때 유용함
import axios from 'axios';
import useUserStore from '@stores/userStore';
import {API_BASE_URL} from '@env'; // api 백 주소 불러오기
import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from './authApi'; // 로그인 API 호출용

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: params => qs.stringify(params),
});

api.interceptors.request.use(
  async config => {
    const method = config.method?.toUpperCase() || 'GET';
    const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
    const endpoint = config.url?.replace(/^\//, '') || '';

    //토큰 주입 => 토큰 미포함시, withAuth: false처리(authApi에 예시 있음)
    if (config.withAuth !== false) {
      const token = useUserStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 쿼리스트링 조합
    let fullUrl = `${baseUrl}/${endpoint}`;
    if (config.params) {
      const queryString = qs.stringify(config.params, {encode: true});
      fullUrl += `?${queryString}`;
    }

    console.log(`🔷 Request: ${method} ${fullUrl}`);
    if (config.data) {
      console.log('📦 Body:', config.data);
    }

    return config;
  },
  error => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token) => {
  refreshQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

//403 발생 시 자동 로그인
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (err.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const credentials = await EncryptedStorage.getItem('user-credentials');
        if (!credentials) {
          throw new Error('저장된 로그인 정보가 없습니다');
        }

        const {email, password, userRole} = JSON.parse(credentials);
        const loginRes = await authApi.login(email, password);

        const authorizationHeader = loginRes.headers?.authorization;
        const newAccessToken = authorizationHeader?.replace('Bearer ', '');

        if (!newAccessToken) {
          throw new Error('토큰 발급 실패');
        }

        useUserStore
          .getState()
          .setTokens({accessToken: newAccessToken, refreshToken: null});
        useUserStore.getState().setUserRole(userRole);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useUserStore.getState().clearUser();
        await EncryptedStorage.removeItem('user-credentials');
        //로그인 페이지로 이동 추가
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

// 응답 로깅
api.interceptors.response.use(
  res => {
    console.log('🟢 Response:', res.status, res.data);
    return res;
  },
  err => {
    console.log('🔴 Error Response:', err.response?.status, err.response?.data);
    return Promise.reject(err);
  },
);

export default api;
