import axios from 'axios';
import {Platform} from 'react-native';
import {API_BASE_URL} from '@env';
import useUserStore from '@stores/userStore';
import {isWebSessionToken} from '@utils/auth/webSession';
import {
  getSessionGeneration,
  subscribeSessionReset,
  tryRefresh,
} from '@utils/auth/login';

let cached = null;
let issuing = null;
const resetListeners = new Set();
export const subscribeChatReset = listener => {
  resetListeners.add(listener);
  return () => resetListeners.delete(listener);
};
subscribeSessionReset(() => {
  cached = null;
  issuing = null;
  resetListeners.forEach(listener => listener());
});
export const chatGeneration = getSessionGeneration;
export const invalidateChatToken = failedToken => {
  // A late 401 for an old JWT must not invalidate its replacement.
  if (!failedToken || cached?.accessToken === failedToken) {
    cached = null;
  }
};
export function chatError(error) {
  if (__DEV__) {
    console.warn(
      '[Chat] Request failed',
      JSON.stringify({
        status: error.response?.status,
        path: error.config?.url?.split('?')[0],
        code: error.response?.data?.code || error.code,
      }),
    );
  }
  // Do not let Axios configs/headers or token/ticket responses reach loggers.
  const safe = new Error(
    error.response?.status === 401
      ? 'CHAT_AUTH_REQUIRED'
      : 'CHAT_REQUEST_FAILED',
  );
  if (error.response) {
    safe.response = {
      status: error.response.status,
      data: {code: error.response.data?.code},
    };
  }
  return safe;
}
export async function ensureChatToken() {
  const state = useUserStore.getState();
  if (!state.accessToken || (state.userRole && state.userRole !== 'USER')) {
    throw new Error('CHAT_AUTH_REQUIRED');
  }
  if (Platform.OS !== 'web') {
    if (isWebSessionToken(state.accessToken)) {
      throw new Error('CHAT_AUTH_REQUIRED');
    }
    return {accessToken: state.accessToken};
  }
  if (cached && Date.parse(cached.expiresAt) - Date.now() > 30000) {
    return cached;
  }
  if (issuing) {
    return issuing;
  }
  const generation = getSessionGeneration();
  const pending = (async () => {
    const issue = () =>
      axios.post(
        `${(API_BASE_URL || '').replace(/\/$/, '')}/user/chat/auth/token`,
        undefined,
        {
          withCredentials: true,
          timeout: 12000,
          headers: {'Cache-Control': 'no-store'},
        },
      );
    let response;
    try {
      try {
        response = await issue();
      } catch (error) {
        if (generation !== getSessionGeneration()) {
          throw new Error('CHAT_SESSION_CHANGED');
        }
        if (error.response?.status !== 401) {
          throw error;
        }
        if (!(await tryRefresh({silent: true}))) {
          throw new Error('CHAT_AUTH_REQUIRED');
        }
        if (generation !== getSessionGeneration()) {
          throw new Error('CHAT_SESSION_CHANGED');
        }
        response = await issue();
      }
    } catch (error) {
      if (
        error.response?.status === 401 &&
        generation === getSessionGeneration()
      ) {
        useUserStore.getState().clearUser();
      }
      if (error.response) {
        throw chatError(error);
      }
      throw new Error(
        error.message === 'CHAT_AUTH_REQUIRED'
          ? 'CHAT_AUTH_REQUIRED'
          : 'CHAT_REQUEST_FAILED',
      );
    }
    if (generation !== getSessionGeneration()) {
      throw new Error('CHAT_SESSION_CHANGED');
    }
    const token = response.data;
    if (
      !token?.accessToken ||
      token.tokenType !== 'Bearer' ||
      !Number.isFinite(Date.parse(token.expiresAt)) ||
      Date.parse(token.expiresAt) <= Date.now()
    ) {
      if (__DEV__) {
        console.warn('[Chat] Invalid token response metadata');
      }
      throw new Error('CHAT_INVALID_TOKEN');
    }
    cached = {accessToken: token.accessToken, expiresAt: token.expiresAt};
    return cached;
  })();
  issuing = pending;
  try {
    return await pending;
  } finally {
    if (issuing === pending) {
      issuing = null;
    }
  }
}
