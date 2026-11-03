import axios from 'axios';
import {Platform} from 'react-native';
import useUserStore from '@stores/userStore';
import {getSessionGeneration, tryRefresh} from '@utils/auth/login';
import {
  ensureChatToken,
  invalidateChatToken,
} from '../../../packages/app/src/features/companion/chatAuth';

jest.mock('axios', () => ({post: jest.fn()}));
jest.mock('@utils/auth/login', () => ({
  getSessionGeneration: jest.fn(() => 0),
  subscribeSessionReset: jest.fn(),
  tryRefresh: jest.fn(),
}));
jest.mock('@stores/userStore', () => ({getState: jest.fn()}));
const originalPlatform = Platform.OS;
const clearUser = jest.fn();
const token = (accessToken = 'chat-only-token', remaining = 900000) => ({
  data: {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: remaining / 1000,
    expiresAt: new Date(Date.now() + remaining).toISOString(),
  },
});
const httpError = status => ({
  response: {status, data: {code: `HTTP_${status}`}},
  config: {headers: {Authorization: 'secret'}},
});
beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'web';
  getSessionGeneration.mockReturnValue(0);
  useUserStore.getState.mockReturnValue({
    accessToken: '__TRIO_WEB_SESSION__',
    userRole: 'USER',
    clearUser,
  });
  invalidateChatToken();
});
afterAll(() => {
  Platform.OS = originalPlatform;
});

test('parallel requests share issuance and keep the chat JWT out of the user store', async () => {
  let finish;
  axios.post.mockReturnValue(
    new Promise(resolve => {
      finish = resolve;
    }),
  );
  const first = ensureChatToken();
  const second = ensureChatToken();
  expect(axios.post).toHaveBeenCalledTimes(1);
  finish(token());
  expect(await first).toEqual(await second);
  expect(await ensureChatToken()).toMatchObject({
    accessToken: 'chat-only-token',
  });
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(useUserStore.getState().accessToken).toBe('__TRIO_WEB_SESSION__');
  expect(axios.post).toHaveBeenCalledWith(
    expect.stringMatching(/\/user\/chat\/auth\/token$/),
    undefined,
    expect.objectContaining({withCredentials: true}),
  );
});
test('tokens within the 30-second margin are reissued before use', async () => {
  axios.post
    .mockResolvedValueOnce(token('near-expiry', 29000))
    .mockResolvedValueOnce(token('replacement'));
  await ensureChatToken();
  expect(await ensureChatToken()).toMatchObject({accessToken: 'replacement'});
  expect(axios.post).toHaveBeenCalledTimes(2);
});
test('main 401 performs one shared refresh and one issuance retry', async () => {
  axios.post
    .mockRejectedValueOnce(httpError(401))
    .mockResolvedValueOnce(token());
  tryRefresh.mockResolvedValue(true);
  await expect(ensureChatToken()).resolves.toMatchObject({
    accessToken: 'chat-only-token',
  });
  expect(tryRefresh).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledTimes(2);
});
test('a final issuance 401 stops and clears the invalid session', async () => {
  axios.post.mockRejectedValue(httpError(401));
  tryRefresh.mockResolvedValue(true);
  await expect(ensureChatToken()).rejects.toThrow('CHAT_AUTH_REQUIRED');
  expect(tryRefresh).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledTimes(2);
  expect(clearUser).toHaveBeenCalledTimes(1);
});
test.each([403, 404, 409, 500])(
  'HTTP %s neither refreshes nor clears a valid session',
  async status => {
    axios.post.mockRejectedValue(httpError(status));
    const error = await ensureChatToken().catch(value => value);
    expect(error.response.status).toBe(status);
    expect(error.config).toBeUndefined();
    expect(JSON.stringify(error)).not.toContain('secret');
    expect(tryRefresh).not.toHaveBeenCalled();
    expect(clearUser).not.toHaveBeenCalled();
  },
);
test('network failures do not become login expiry', async () => {
  axios.post.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(ensureChatToken()).rejects.toThrow('CHAT_REQUEST_FAILED');
  expect(clearUser).not.toHaveBeenCalled();
  expect(tryRefresh).not.toHaveBeenCalled();
});
test('late failures cannot clear a replacement JWT', async () => {
  axios.post
    .mockResolvedValueOnce(token('old'))
    .mockResolvedValueOnce(token('new'));
  await ensureChatToken();
  invalidateChatToken('old');
  await ensureChatToken();
  invalidateChatToken('old');
  expect(await ensureChatToken()).toMatchObject({accessToken: 'new'});
  expect(axios.post).toHaveBeenCalledTimes(2);
});
test('a token response arriving after an account reset is discarded', async () => {
  let finish;
  axios.post.mockReturnValue(
    new Promise(resolve => {
      finish = resolve;
    }),
  );
  const pending = ensureChatToken();
  getSessionGeneration.mockReturnValue(1);
  // Re-create the same session-reset event registered by the module.
  // clearAllMocks removes call history, so invalidation plus generation guards
  // isolates the late response independently from listener plumbing.
  invalidateChatToken();
  finish(token('previous-account'));
  await expect(pending).rejects.toThrow('CHAT_SESSION_CHANGED');
  axios.post.mockResolvedValueOnce(token('current-account'));
  expect(await ensureChatToken()).toMatchObject({
    accessToken: 'current-account',
  });
});
test('invalid expiry metadata is never cached', async () => {
  axios.post.mockResolvedValue({
    data: {accessToken: 'bad', tokenType: 'Bearer', expiresAt: 'invalid'},
  });
  await expect(ensureChatToken()).rejects.toThrow('CHAT_INVALID_TOKEN');
  await expect(ensureChatToken()).rejects.toThrow('CHAT_INVALID_TOKEN');
  expect(axios.post).toHaveBeenCalledTimes(2);
});
