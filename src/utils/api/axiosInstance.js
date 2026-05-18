import qs from 'qs';
import axios from 'axios';
import {API_BASE_URL as ENV_API_BASE_URL} from '@env';
import useUserStore from '@stores/userStore';
import {log, mask} from '@utils/logger';
import {tryRefresh} from '@utils/auth/login';

const API_BASE_URL = ENV_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 5000,
  headers: {'Content-Type': 'application/json'},
  paramsSerializer: params => qs.stringify(params),
});

// 간단한 요청 ID 생성
const rid = () => Math.random().toString(36).slice(2, 8);

// REQUEST
api.interceptors.request.use(
  async config => {
    const id = rid();
    config._reqId = id;

    const method = config.method?.toUpperCase() || 'GET';
    const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
    const endpoint = config.url?.replace(/^\//, '') || '';
    const fullUrl = config.params
      ? `${baseUrl}/${endpoint}?${qs.stringify(config.params)}`
      : `${baseUrl}/${endpoint}`;

    // accessToken 주입
    const token = useUserStore.getState().accessToken;
    if (config.withAuth !== false && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    log.time(`⏱️ ${id}`);
    log.info(`➡️ [${id}] ${method} ${fullUrl}`);

    if (config.withAuth !== false) {
      log.info(`🔑 [${id}] accessToken=`, mask(token));
    }
    if (config.data) log.info(`📦 [${id}] body=`, config.data);

    return config;
  },
  error => Promise.reject(error),
);

// 리프레시 큐
let isRefreshing = false;
let queue = [];
const resolveQueue = (error, token = null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

// RESPONSE
api.interceptors.response.use(
  res => {
    const id = res.config._reqId;
    log.info(`✅ [${id}] status=`, res.status);
    if (res.data) {
      try {
        log.info(
          `📩 [${id}] response data=`,
          JSON.stringify(res.data, null, 2),
        );
      } catch (e) {
        log.info(`📩 [${id}] response data=`, res.data);
      }
    }
    log.timeEnd(`⏱️ ${res.config._reqId}`);
    return res;
  },
  async err => {
    const original = err.config;
    const id = original?._reqId || rid();
    const status = err.response?.status;
    const errorData = err.response?.data;

    log.error(
      `🛑 [${id}] error status=`,
      status,
      'url=',
      original?.url,
      err,
    );
    if (errorData) {
      try {
        log.error(
          `🧾 [${id}] error data=`,
          JSON.stringify(errorData, null, 2),
        );
      } catch (e) {
        log.error(`🧾 [${id}] error data=`, errorData);
      }
    }
    log.timeEnd(`⏱️ ${id}`);

    if (original?.url?.includes('/auth/refresh')) {
      log.warn(`🧯 [${id}] refresh call itself failed — no retry`);
      return Promise.reject(err);
    }

    if (original?.withAuth === false) {
      log.warn(`🧷 [${id}] withAuth=false → skip refresh flow`);
      return Promise.reject(err);
    }

    if (original && (status === 401 || status === 403) && !original._retry) {
      log.info(`🔁 [${id}] accessToken expired → refresh flow`);
      original._retry = true;

      if (isRefreshing) {
        log.info(`⏳ [${id}] waiting for ongoing refresh`);
        return new Promise((resolve, reject) => {
          queue.push({resolve, reject});
        }).then(token => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;
      try {
        const ok = await tryRefresh(); // ✅ 여기서 호출
        if (!ok) {
          resolveQueue(new Error('refresh failed'), null);
          return Promise.reject(err);
        }

        const newAccess = useUserStore.getState().accessToken;
        resolveQueue(null, newAccess);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        resolveQueue(e, null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;
