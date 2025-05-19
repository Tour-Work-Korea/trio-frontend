import qs from 'qs'; // qs는 query string을 stringify할 때 유용함
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://52.78.210.107:8080/api/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
// axiosInstance.interceptors.request.use(
//   config => {
//     // 예: 토큰 추가
//     const token = 'your-auth-token';
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => Promise.reject(error),
// );

// // 응답 인터셉터
// api.interceptors.response.use(
//   response => response,
//   error => {
//     console.log('API 에러:', error);
//     return Promise.reject(error);
//   },
// );

api.interceptors.request.use(config => {
  const method = config.method?.toUpperCase() || 'GET';
  const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
  const endpoint = config.url?.replace(/^\//, '') || '';

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
});

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
