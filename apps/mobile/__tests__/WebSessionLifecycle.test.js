import axios from 'axios';
import {Platform} from 'react-native';
import useUserStore from '@stores/userStore';
import {tryRefresh, tryLogout} from '@utils/auth/login';

jest.mock('axios', () => ({post: jest.fn()}));
jest.mock('@trio/app/src/i18n', () => ({t: key => key}));
jest.mock('@utils/api/authApi', () => ({}));
jest.mock('@utils/api/userMyApi', () => ({getMyProfile: jest.fn()}));
jest.mock('@utils/logger', () => ({log: {info: jest.fn(), warn: jest.fn()}, mask: value => value}));
jest.mock('@utils/navigationService', () => ({reset: jest.fn()}));
jest.mock('@utils/auth/googleSignIn', () => ({signInWithGoogle: jest.fn()}));
jest.mock('@utils/languageSync', () => ({synchronizeLanguageForAuthenticatedAccount: jest.fn()}));
jest.mock('@utils/api/notificationApi', () => ({}));
jest.mock('@stores/userStore', () => {
  const state = {accessToken: '__TRIO_WEB_SESSION__', userRole: 'USER', userProfile: {userId: 1},
    setTokens: jest.fn(), setUserRole: jest.fn(), clearUser: jest.fn()};
  return {getState: () => state, subscribe: jest.fn()};
});
const oldPlatform = Platform.OS;
beforeEach(() => {jest.clearAllMocks(); Platform.OS = 'web';});
afterAll(() => {Platform.OS = oldPlatform;});

test('concurrent main refresh callers perform one cookie rotation with no bearer or body', async () => {
  let finish;
  axios.post.mockReturnValue(new Promise(resolve => {finish = resolve;}));
  const one = tryRefresh({silent: true});
  const two = tryRefresh({silent: true});
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/user\/auth\/refresh$/), undefined,
    expect.objectContaining({withCredentials: true}));
  finish({data: {role: 'USER'}});
  expect(await one).toBe(true);
  expect(await two).toBe(true);
  expect(useUserStore.getState().setTokens).toHaveBeenCalledTimes(1);
});
test.each([403, 500])('refresh HTTP %s preserves the local login instead of falsely expiring it', async status => {
  axios.post.mockRejectedValue({response: {status}});
  await expect(tryRefresh({silent: true})).rejects.toThrow('SESSION_REFRESH_UNAVAILABLE');
  expect(useUserStore.getState().clearUser).not.toHaveBeenCalled();
});
test('logout clears local state immediately but waits for a pending Set-Cookie before server logout', async () => {
  let finish;
  axios.post.mockReturnValueOnce(new Promise(resolve => {finish = resolve;}))
    .mockResolvedValueOnce({data: {}});
  const refreshing = tryRefresh({silent: true});
  const loggingOut = tryLogout();
  expect(useUserStore.getState().clearUser).toHaveBeenCalled();
  expect(axios.post).toHaveBeenCalledTimes(1);
  finish({data: {role: 'USER'}});
  expect(await refreshing).toBe(false);
  await loggingOut;
  expect(axios.post.mock.calls[1][0]).toMatch(/\/user\/auth\/logout$/);
  expect(useUserStore.getState().setTokens).not.toHaveBeenCalled();
});
test('expired access during logout gets one cookie refresh before retrying revocation', async () => {
  axios.post.mockRejectedValueOnce({response: {status: 401}})
    .mockResolvedValueOnce({data: {role: 'USER'}})
    .mockResolvedValueOnce({data: {}});
  await tryLogout();
  expect(axios.post.mock.calls.map(([url]) => url.split('/').pop())).toEqual(['logout', 'refresh', 'logout']);
  expect(useUserStore.getState().setTokens).not.toHaveBeenCalled();
});
test('failed server logout is reported as failure while local cleanup remains applied', async () => {
  axios.post.mockRejectedValue({response: {status: 500}});
  await expect(tryLogout()).rejects.toThrow('SESSION_LOGOUT_UNAVAILABLE');
  expect(useUserStore.getState().clearUser).toHaveBeenCalled();
});
