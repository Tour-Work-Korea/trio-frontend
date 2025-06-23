import qs from 'qs'; // qs는 query string을 stringify할 때 유용함
import axios from 'axios';
import useUserStore from '@stores/userStore';
import {API_BASE_URL} from '@env'; // api 백 주소 불러오기
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

api.interceptors.request.use(
  async config => {
    const method = config.method?.toUpperCase() || 'GET';
    const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
    const endpoint = config.url?.replace(/^\//, '') || '';

    //토큰 주입 => 토큰 미포함시, withAuth: false처리(authApi에 예시 있음)
    const token = useUserStore.getState().accessToken;

    if (config.withAuth !== false && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const cookie = useUserStore.getState()?.refreshToken;
    if (cookie) {
      config.headers.Cookie = 'refreshToken=' + cookie;
      console.log('Cookie 헤더 삽입:', cookie);
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

let isRefreshing = false; //재발급 중인지 여부
let queue = []; //재발급 중인 요청을 잠시 보관 큐

const resolveQueue = (error, token = null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  res => {
    console.log('🟢 Response:', res.status, res.data);
    return res;
  }, //성공 응답은 그대로 반환
  async err => {
    const originalRequest = err.config;

    // accessToken 만료 또는 유효하지 않음 -> 401 응답 확인
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 중복 재시도 방지

      if (isRefreshing) {
        //이미 재발급 중이라면 새토큰 받아서 대기 후 재요청
        return new Promise((res, rej) => {
          queue.push({resolve: res, reject: rej});
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        //refreshToken 쿠키로 /auth/refresh 호출
        const res = await authApi.refreshToken();
        const accessToken = res.data.accessToken;
        let refreshToken;
        const rawCookies =
          res.headers['set-cookie'] || res.headers['Set-Cookie'];
        if (rawCookies && rawCookies.length > 0) {
          const cookie = rawCookies[0];
          const match = cookie.match(/refreshToken=([^;]+);?/);
          if (match) {
            refreshToken = match[1];
          }
        }
        useUserStore.getState().setTokens({accessToken, refreshToken});
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;

        //대기 중이던 요청들에 토큰 전달 및 재시도
        resolveQueue(null, accessToken);

        //원래 요청에 새 토큰 붙여서 다시 호출
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        //refreshToken 만료 또는 재발급 실패
        resolveQueue(error, null);
        //사용자 로그아웃 처리
        useUserStore.getState().clearUser();
        // navigation.replace('Login') 가능
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    console.log(
      '🔴 Error Response:',
      err,
      err.response?.status,
      err.response?.data,
    );
    return Promise.reject(err);
  },
);
export default api;
