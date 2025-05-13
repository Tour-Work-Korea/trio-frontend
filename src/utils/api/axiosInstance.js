import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
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

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.log('API 에러:', error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
