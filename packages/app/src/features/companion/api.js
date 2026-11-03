import axios from 'axios';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import {API_BASE_URL} from '@env';
import api from '@utils/api/axiosInstance';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {tryRefresh} from '@utils/auth/login';
import {
  ensureChatToken,
  invalidateChatToken,
  chatError,
  chatGeneration,
  subscribeChatReset,
} from './chatAuth';

export const companionEnabled =
  Config.COMPANION_ENABLED === 'true' ||
  (__DEV__ && Config.COMPANION_ENABLED !== 'false');
const base = '/user/companions';
const optionalAuth = () =>
  useUserStore.getState().accessToken ? {} : {withAuth: false};
// Native UUID generation avoids requiring a new random-values native dependency.
export const newIntentKey = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const n = Math.floor(Math.random() * 16);
    return (c === 'x' ? n : (n % 4) + 8).toString(16);
  });
const post = (path, body, key) =>
  api.post(`${base}${path}`, body, {headers: {'Idempotency-Key': key}});
export const companionApi = {
  list: params => api.get(base, {...optionalAuth(), params}),
  detail: id => api.get(`${base}/${id}`, optionalAuth()),
  mine: params => api.get(`${base}/me`, {params}),
  management: (id, page = 0) =>
    api.get(`${base}/${id}/management`, {params: {page, size: 20}}),
  draft: (body, key) => post('/drafts', body, key),
  publish: (id, images, key) => post(`/${id}/publish`, {images}, key),
  update: (id, body) => api.patch(`${base}/${id}`, body),
  inquire: (id, key) => post(`/${id}/inquiries`, undefined, key),
  access: id => getChatAccess(id),
  apply: (id, key) => post(`/${id}/applications`, undefined, key),
  withdraw: (id, generation, key) =>
    post(
      `/${id}/applications/me/withdraw`,
      {requestGeneration: generation},
      key,
    ),
  decide: (id, participant, accept, key) =>
    post(
      `/${id}/applications/${participant.participationId}/${
        accept ? 'accept' : 'reject'
      }`,
      {requestGeneration: participant.requestGeneration},
      key,
    ),
  close: (id, key) => post(`/${id}/close`, undefined, key),
};

async function getChatAccess(id) {
  if (Platform.OS !== 'web') {
    return api.get(`${base}/${id}/chat-access`);
  }
  const generation = chatGeneration();
  const request = () =>
    axios.get(
      `${(API_BASE_URL || '').replace(/\/$/, '')}${base}/${id}/chat-access`,
      {
        withCredentials: true,
        timeout: 12000,
        headers: {'Cache-Control': 'no-store'},
      },
    );
  try {
    let response;
    try {
      response = await request();
    } catch (error) {
      if (generation !== chatGeneration()) {
        throw new Error('CHAT_SESSION_CHANGED');
      }
      if (error.response?.status !== 401) {
        throw error;
      }
      if (!(await tryRefresh({silent: true}))) {
        throw new Error('CHAT_AUTH_REQUIRED');
      }
      if (generation !== chatGeneration()) {
        throw new Error('CHAT_SESSION_CHANGED');
      }
      response = await request();
    }
    if (generation !== chatGeneration()) {
      throw new Error('CHAT_SESSION_CHANGED');
    }
    return response;
  } catch (error) {
    throw error.response ? chatError(error) : error;
  }
}

// Only the documented dev hostname is a fallback. Production must be configured.
export const chatBase =
  Config.CHAT_BASE_URL ||
  (/^https:\/\/dev\.ddakji\.kr(?:\/|$)/.test(API_BASE_URL || '')
    ? 'https://chat-dev.ddakji.kr'
    : '');
const chat = axios.create({
  baseURL: chatBase,
  timeout: 12000,
  withCredentials: false,
});
chat.interceptors.request.use(async config => {
  if (!chatBase) {
    throw new Error('CHAT_NOT_CONFIGURED');
  }
  const generation = config._chatGeneration ?? chatGeneration();
  const token = await ensureChatToken();
  if (generation !== chatGeneration()) {
    throw new Error('CHAT_SESSION_CHANGED');
  }
  config._chatGeneration = generation;
  config._chatToken = token.accessToken;
  config._chatExpiresAt = token.expiresAt;
  config.headers.Authorization = `Bearer ${token.accessToken}`;
  config.headers['Cache-Control'] = 'no-store';
  // fetch credentials=omit also suppresses ambient cookies for same-origin deployments.
  if (Platform.OS === 'web') {
    config.adapter = 'fetch';
    config.fetchOptions = {credentials: 'omit', cache: 'no-store'};
  }
  return config;
});
chat.interceptors.response.use(
  response => {
    if (response.config._chatGeneration !== chatGeneration()) {
      throw new Error('CHAT_SESSION_CHANGED');
    }
    return response;
  },
  async error => {
    const config = error.config;
    const retryable = config && (config.method === 'get' || config._chatTicket);
    if (
      error.response?.status === 401 &&
      retryable &&
      !config._retry &&
      config._chatGeneration === chatGeneration()
    ) {
      if (Platform.OS === 'web') {
        invalidateChatToken(config._chatToken);
      } else if (!(await tryRefresh({silent: true}))) {
        throw new Error('CHAT_AUTH_REQUIRED');
      }
      return chat({...config, _retry: true});
    }
    if (!error.response && !config) {
      throw error;
    }
    throw chatError(error);
  },
);
const rooms = '/api/v1/chat/rooms';
export const chatApi = {
  profile: id => chat.get(`/api/v1/chat/users/${id}/profile`),
  report: body => chat.post('/api/v1/chat/reports', body),
  list: role =>
    chat.get(rooms, {params: {context: 'COMPANION', ...(role ? {role} : {})}}),
  detail: id => chat.get(`${rooms}/${id}`),
  messages: (id, cursorMessageId) =>
    chat.get(`${rooms}/${id}/messages`, {params: {cursorMessageId, size: 50}}),
  search: (id, q, cursorMessageId) =>
    chat.get(`${rooms}/${id}/messages/search`, {
      params: {q, cursorMessageId, size: 20},
    }),
  members: id => chat.get(`${rooms}/${id}/members`),
  read: (id, lastReadMessageId) =>
    chat.post(`${rooms}/${id}/read`, {lastReadMessageId}),
  notice: (id, content) => chat.put(`${rooms}/${id}/notice`, {content}),
  notification: (id, notificationEnabled) =>
    chat.patch(`${rooms}/${id}/notification-settings`, {notificationEnabled}),
  leave: id => chat.post(`${rooms}/${id}/leave`),
  rejoin: id => chat.post(`${rooms}/${id}/rejoin`),
  image: (id, asset) =>
    chat.post(`${rooms}/${id}/attachments/images/presigned-url`, {
      originalFilename: asset.fileName,
      contentType: asset.type,
      contentLength: asset.fileSize,
    }),
  download: (id, path) => {
    // Never send a bearer token to an arbitrary payload URL.
    if (
      !path?.startsWith(`${rooms}/${id}/attachments/images/`) ||
      !/^\/api\/v1\/chat\/rooms\/\d+\/attachments\/images\/\d+\/download-url$/.test(
        path,
      )
    ) {
      return Promise.reject(new Error('INVALID_ATTACHMENT'));
    }
    return chat.get(path);
  },
  connect: async (id, onMessage, onClose, onOpen, isCurrent = () => true) => {
    if (!chatBase) {
      throw new Error('CHAT_NOT_CONFIGURED');
    }
    const generation = chatGeneration();
    const current = () => isCurrent() && generation === chatGeneration();
    const endpoint = `${chatBase
      .replace(/^http/, 'ws')
      .replace(/\/$/, '')}/ws/chat/rooms/${id}`;
    let ws;
    if (Platform.OS === 'web') {
      const response = await chat.post(`${rooms}/${id}/ws-ticket`, undefined, {
        _chatTicket: true,
      });
      if (!current()) {
        return null;
      }
      const {ticket, expiresAt} = response.data || {};
      if (
        !ticket ||
        !Number.isFinite(Date.parse(expiresAt)) ||
        Date.parse(expiresAt) <= Date.now()
      ) {
        throw new Error('CHAT_TICKET_EXPIRED');
      }
      // A ticket is consumed by exactly this attempt; never log this URL.
      ws = new WebSocket(`${endpoint}?ticket=${encodeURIComponent(ticket)}`);
      ws.chatExpiresAt = Date.parse(response.config._chatExpiresAt);
    } else {
      const token = await ensureChatToken();
      if (!current()) {
        return null;
      }
      ws = new WebSocket(endpoint, null, {
        headers: {Authorization: `Bearer ${token.accessToken}`},
      });
    }
    const unsubscribe = subscribeChatReset(() => ws.close(1000));
    ws.onmessage = event => {
      if (!current()) {
        return;
      }
      let frame;
      try {
        frame = JSON.parse(event.data);
      } catch {
        return;
      }
      onMessage(frame);
    };
    ws.onclose = event => {
      unsubscribe();
      if (current()) {
        onClose?.(event);
      }
    };
    ws.onopen = event => {
      if (!current()) {
        ws.close(1000);
        return;
      }
      onOpen?.(event);
    };
    return ws;
  },
};
export async function uploadBinary(url, uri, method = 'PUT', headers = {}) {
  const local = await fetch(uri);
  const body = await local.blob();
  const response = await fetch(url, {method, headers, body});
  if (!response.ok) {
    throw new Error('UPLOAD_FAILED');
  }
}
export async function uploadPostImages(postId, assets) {
  const existing = assets.filter(asset => asset.isExisting);
  if (existing.some(asset => !asset.objectKey || !asset.fileSizeBytes)) {
    throw new Error('EDIT_IMAGES_UNAVAILABLE');
  }
  const pending = assets
    .map((asset, imageOrder) => ({asset, imageOrder}))
    .filter(item => !item.asset.isExisting);
  const uploaded = pending.length
    ? (
        await communityApi.getImagePresignedUrls(
          postId,
          pending.map(({asset, imageOrder}) => ({
            filename: asset.fileName,
            contentType: asset.type,
            fileSizeBytes: asset.fileSize,
            imageOrder,
          })),
        )
      ).data
    : [];
  await Promise.all(
    pending.map(async ({asset, imageOrder}) => {
      const signed = uploaded.find(item => item.imageOrder === imageOrder);
      if (!signed) {
        throw new Error('UPLOAD_FAILED');
      }
      await uploadBinary(signed.presignedUrl, asset.uri, 'PUT', {
        'Content-Type': asset.type,
      });
    }),
  );
  return assets.map((asset, imageOrder) => {
    const saved = asset.isExisting
      ? asset
      : uploaded.find(item => item.imageOrder === imageOrder);
    return {
      objectKey: saved.objectKey,
      fileSizeBytes: saved.fileSizeBytes,
      imageOrder,
    };
  });
}
