import qs from 'qs';
import axios from 'axios';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';
import { Platform } from 'react-native';
import useUserStore from '@stores/userStore';
import { log, mask } from '@utils/logger';
import { tryRefresh } from '@utils/auth/login';
import { isWebSessionToken } from '@utils/auth/webSession';

const API_BASE_URL = ENV_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: params => qs.stringify(params),
});

// 간단한 요청 ID 생성
const rid = () => Math.random().toString(36).slice(2, 8);

const summarizePayload = data => {
  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      sampleKeys:
        data.length > 0 && data[0] && typeof data[0] === 'object'
          ? Object.keys(data[0]).slice(0, 8)
          : [],
    };
  }

  if (data && typeof data === 'object') {
    const summary = {
      type: 'object',
      keys: Object.keys(data).slice(0, 12),
    };

    if (Array.isArray(data.content)) {
      summary.contentLength = data.content.length;
    }

    return summary;
  }

  if (typeof data === 'string') {
    return {
      type: 'string',
      length: data.length,
      preview: data.slice(0, 120),
    };
  }

  return data;
};

const hasLogPayload = data => {
  if (data == null) {
    return false;
  }

  if (typeof data === 'string') {
    return data.trim().length > 0;
  }

  return true;
};

const getRequestUrl = config => {
  const baseUrl = config.baseURL?.replace(/\/$/, '') || '';
  const endpoint = config.url?.replace(/^\//, '') || '';
  const query = config.params ? `?${qs.stringify(config.params)}` : '';

  return `${baseUrl}/${endpoint}${query}`;
};

const getRequestLabel = config => {
  const method = config.method?.toUpperCase() || 'GET';
  return `${method} ${getRequestUrl(config)}`;
};

// 성능 테스트처럼 로그를 줄이고 싶을 때 DevTools에서
// `global.__API_LOG_SUMMARY__ = true`로 켠다.
const shouldLogSummaryPayload = config =>
  config?.summaryLog === true || global.__API_LOG_SUMMARY__ === true;

const getLogPayload = (data, config) =>
  shouldLogSummaryPayload(config) ? summarizePayload(data) : data;

// REQUEST
api.interceptors.request.use(
  async config => {
    const id = rid();
    config._reqId = id;

    // accessToken 주입
    const token = useUserStore.getState().accessToken;
    const shouldAttachBearer =
      config.withAuth !== false &&
      token &&
      !(Platform.OS === 'web' && isWebSessionToken(token));

    if (shouldAttachBearer) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    log.time(`⏱️ ${id}`);
    log.info(`➡️ [${id}] ${getRequestLabel(config)}`);

    if (config.withAuth !== false) {
      log.info(`   auth: ${mask(token)}`);
    }
    if (hasLogPayload(config.data)) {
      log.info('   body:', getLogPayload(config.data, config));
    }

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
    log.info(`✅ [${id}] ${res.status} ${getRequestLabel(res.config)}`);
    if (hasLogPayload(res.data)) {
      log.info('   response:', getLogPayload(res.data, res.config));
    }
    log.timeEnd(`⏱️ ${res.config._reqId}`);
    return res;
  },
  async err => {
    const original = err.config;
    const id = original?._reqId || rid();
    const status = err.response?.status;
    const errorData = err.response?.data;

    log.error(`🛑 [${id}] ${status || 'ERROR'} ${getRequestLabel(original || {})}`);
    log.error('   error:', err);
    if (hasLogPayload(errorData)) {
      log.error('   error body:', errorData);
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

    if (original?.optionalAuth && original && !original._optionalAuthRetry) {
      log.warn(`🧷 [${id}] optionalAuth failed → retry without token`);
      original._optionalAuthRetry = true;
      original.withAuth = false;
      original.optionalAuth = false;
      original.headers = {...original.headers};
      delete original.headers.Authorization;
      delete original.headers.authorization;

      return api(original);
    }

    if (original && (status === 401 || status === 403) && !original._retry) {
      log.info(`🔁 [${id}] accessToken expired → refresh flow`);
      original._retry = true;

      if (isRefreshing) {
        log.info(`⏳ [${id}] waiting for ongoing refresh`);
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          original.headers = original.headers || {};
          if (token && !(Platform.OS === 'web' && isWebSessionToken(token))) {
            original.headers.Authorization = `Bearer ${token}`;
          }
          return api(original);
        });
      }

      isRefreshing = true;
      try {
        const ok = await tryRefresh({ silent: true }); // 호출한 화면에서 직접 처리하도록 자동 이동은 막는다.
        if (!ok) {
          resolveQueue(new Error('refresh failed'), null);
          return Promise.reject(err);
        }

        const newAccess = useUserStore.getState().accessToken;
        resolveQueue(null, newAccess);
        original.headers = original.headers || {};
        if (newAccess && !(Platform.OS === 'web' && isWebSessionToken(newAccess))) {
          original.headers.Authorization = `Bearer ${newAccess}`;
        }
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
