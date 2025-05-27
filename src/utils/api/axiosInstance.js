import qs from 'qs'; // qs는 query string을 stringify할 때 유용함
import axios from 'axios';
import useUserStore from '@stores/userStore';
import {API_BASE_URL} from '@env'; // api 백 주소 불러오기

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const method = config.method?.toUpperCase() || 'GET';
    const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
    const endpoint = config.url?.replace(/^\//, '') || '';

    // 토큰 주입
    const token = useUserStore.getState().accessToken; // 메모리에서 바로 꺼냄
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 쿼리스트링 조합
    let fullUrl = `${baseUrl}/${endpoint}`;
    if (config.params) {
      const queryString = qs.stringify(config.params, {encode: false});
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
