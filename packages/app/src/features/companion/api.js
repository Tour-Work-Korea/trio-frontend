import axios from 'axios';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import {API_BASE_URL} from '@env';
import api from '@utils/api/axiosInstance';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {isWebSessionToken} from '@utils/auth/webSession';
import {tryRefresh} from '@utils/auth/login';

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
  access: id => api.get(`${base}/${id}/chat-access`),
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

// Only the documented dev hostname is a fallback. Production must be configured.
export const chatBase =
  Config.CHAT_BASE_URL ||
  (/^https:\/\/dev\.ddakji\.kr(?:\/|$)/.test(API_BASE_URL || '')
    ? 'https://chat-dev.ddakji.kr'
    : '');
const chat = axios.create({baseURL: chatBase, timeout: 12000});
const chatToken = () => {
  const token = useUserStore.getState().accessToken;
  // A web BFF session marker is not a JWT and must never be sent to the chat server.
  if (!token || isWebSessionToken(token)) {
    throw new Error('CHAT_AUTH_REQUIRED');
  }
  return token;
};
chat.interceptors.request.use(config => {
  if (!chatBase) {
    throw new Error('CHAT_NOT_CONFIGURED');
  }
  config.headers.Authorization = `Bearer ${chatToken()}`;
  return config;
});
chat.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config?._retry) {
      if (await tryRefresh({silent: true})) {
        return chat({...error.config, _retry: true});
      }
    }
    throw error;
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
  connect: (id, onMessage, onClose, onOpen) => {
    if (!chatBase) {
      throw new Error('CHAT_NOT_CONFIGURED');
    }
    const endpoint = `${chatBase
      .replace(/^http/, 'ws')
      .replace(/\/$/, '')}/ws/chat/rooms/${id}`;
    const token = chatToken();
    const socket =
      Platform.OS === 'web'
        ? new WebSocket(`${endpoint}?access_token=${encodeURIComponent(token)}`)
        : new WebSocket(endpoint, null, {
            headers: {Authorization: `Bearer ${token}`},
          });
    socket.onmessage = event => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        /* Ignore invalid frames. */
      }
    };
    socket.onclose = onClose;
    socket.onopen = onOpen;
    return socket;
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
