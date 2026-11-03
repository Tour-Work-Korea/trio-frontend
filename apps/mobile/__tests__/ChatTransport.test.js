import axios from 'axios';
import {Platform} from 'react-native';
import {chatApi} from '../../../packages/app/src/features/companion/api';
import {
  ensureChatToken,
  invalidateChatToken,
  chatGeneration,
  subscribeChatReset,
} from '../../../packages/app/src/features/companion/chatAuth';

jest.mock('react-native-config', () => ({
  CHAT_BASE_URL: 'https://chat-dev.ddakji.kr',
}));
jest.mock('@utils/api/axiosInstance', () => ({}));
jest.mock('@utils/api/communityApi', () => ({}));
jest.mock('@utils/auth/login', () => ({tryRefresh: jest.fn()}));
jest.mock('@stores/userStore', () => ({
  getState: () => ({accessToken: '__TRIO_WEB_SESSION__'}),
}));
jest.mock('../../../packages/app/src/features/companion/chatAuth', () => ({
  ensureChatToken: jest.fn(),
  invalidateChatToken: jest.fn(),
  chatGeneration: jest.fn(() => 0),
  subscribeChatReset: jest.fn(() => jest.fn()),
  chatError: error =>
    Object.assign(new Error('CHAT_REQUEST_FAILED'), {
      response: {status: error.response?.status},
    }),
}));
jest.mock('axios', () => {
  const client = jest.fn();
  Object.assign(client, {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    interceptors: {request: {use: jest.fn()}, response: {use: jest.fn()}},
  });
  return {create: () => client, __client: client};
});
const request = axios.__client.interceptors.request.use.mock.calls[0][0];
const rejected = axios.__client.interceptors.response.use.mock.calls[0][1];
const oldPlatform = Platform.OS;
const oldSocket = global.WebSocket;
let ws;
beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'web';
  chatGeneration.mockReturnValue(0);
  ensureChatToken.mockResolvedValue({
    accessToken: 'chat-only-jwt',
    expiresAt: new Date(Date.now() + 900000).toISOString(),
  });
  ws = {close: jest.fn()};
  global.WebSocket = jest.fn(() => ws);
});
afterAll(() => {
  Platform.OS = oldPlatform;
  global.WebSocket = oldSocket;
});
const ticket = () => ({
  data: {
    ticket: 'single-use-ticket',
    expiresAt: new Date(Date.now() + 30000).toISOString(),
  },
  config: {_chatExpiresAt: new Date(Date.now() + 900000).toISOString()},
});

test('chat REST uses the separate JWT and explicitly omits cookies and browser cache', async () => {
  const config = await request({headers: {}});
  expect(config.headers.Authorization).toBe('Bearer chat-only-jwt');
  expect(config.adapter).toBe('fetch');
  expect(config.fetchOptions).toEqual({credentials: 'omit', cache: 'no-store'});
});
test('a read 401 retries once after invalidating only the failed JWT', async () => {
  const config = {method: 'get', _chatGeneration: 0, _chatToken: 'failed-jwt'};
  axios.__client.mockResolvedValue({data: []});
  await rejected({config, response: {status: 401}});
  expect(invalidateChatToken).toHaveBeenCalledWith('failed-jwt');
  expect(axios.__client).toHaveBeenCalledWith({...config, _retry: true});
  await expect(
    rejected({config: {...config, _retry: true}, response: {status: 401}}),
  ).rejects.toThrow();
  expect(axios.__client).toHaveBeenCalledTimes(1);
});
test.each([403, 404, 409, 500])(
  'HTTP %s does not retry or refresh chat authentication',
  async status => {
    await expect(
      rejected({
        config: {method: 'get', _chatGeneration: 0},
        response: {status},
      }),
    ).rejects.toThrow();
    expect(invalidateChatToken).not.toHaveBeenCalled();
    expect(axios.__client).not.toHaveBeenCalled();
  },
);
test('state-changing requests are not replayed automatically', async () => {
  await expect(
    rejected({
      config: {method: 'post', _chatGeneration: 0},
      response: {status: 401},
    }),
  ).rejects.toThrow();
  expect(axios.__client).not.toHaveBeenCalled();
});
test('each browser connection obtains a fresh ticket and never uses access_token or a bearer URL', async () => {
  axios.__client.post.mockResolvedValue(ticket());
  await chatApi.connect(11, jest.fn(), jest.fn(), jest.fn());
  await chatApi.connect(11, jest.fn(), jest.fn(), jest.fn());
  expect(axios.__client.post).toHaveBeenCalledTimes(2);
  expect(axios.__client.post).toHaveBeenCalledWith(
    '/api/v1/chat/rooms/11/ws-ticket',
    undefined,
    {_chatTicket: true},
  );
  expect(global.WebSocket).toHaveBeenCalledWith(
    'wss://chat-dev.ddakji.kr/ws/chat/rooms/11?ticket=single-use-ticket',
  );
  expect(JSON.stringify(global.WebSocket.mock.calls)).not.toContain(
    'access_token',
  );
  expect(JSON.stringify(global.WebSocket.mock.calls)).not.toContain(
    'chat-only-jwt',
  );
});
test('expired tickets never start a socket', async () => {
  const result = ticket();
  result.data.expiresAt = new Date(Date.now() - 1).toISOString();
  axios.__client.post.mockResolvedValue(result);
  await expect(chatApi.connect(11, jest.fn())).rejects.toThrow(
    'CHAT_TICKET_EXPIRED',
  );
  expect(global.WebSocket).not.toHaveBeenCalled();
});
test('an abandoned room ignores a late ticket response', async () => {
  axios.__client.post.mockResolvedValue(ticket());
  expect(
    await chatApi.connect(11, jest.fn(), jest.fn(), jest.fn(), () => false),
  ).toBeNull();
  expect(global.WebSocket).not.toHaveBeenCalled();
});
test('session reset closes a socket and rejects events from the previous account', async () => {
  axios.__client.post.mockResolvedValue(ticket());
  const received = jest.fn();
  await chatApi.connect(11, received, jest.fn(), jest.fn());
  const onReset = subscribeChatReset.mock.calls[0][0];
  chatGeneration.mockReturnValue(1);
  onReset();
  ws.onmessage({
    data: JSON.stringify({type: 'MESSAGE', payload: {messageId: 9}}),
  });
  expect(ws.close).toHaveBeenCalledWith(1000);
  expect(received).not.toHaveBeenCalled();
});
test('late request interception cannot send a previous generation request under a new account', async () => {
  await expect(request({headers: {}, _chatGeneration: -1})).rejects.toThrow(
    'CHAT_SESSION_CHANGED',
  );
});
