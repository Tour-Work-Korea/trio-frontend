import {
  getChatProfile,
  peekChatProfile,
} from '../../../packages/app/src/features/companion/chatProfileCache';
import {chatApi} from '../../../packages/app/src/features/companion/api';
import {chatGeneration} from '../../../packages/app/src/features/companion/chatAuth';

jest.mock('../../../packages/app/src/features/companion/api', () => ({
  chatApi: {profile: jest.fn()},
}));
jest.mock('../../../packages/app/src/features/companion/chatAuth', () => ({
  chatGeneration: jest.fn(),
}));
let generation = 0;
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  chatGeneration.mockReturnValue(++generation);
  chatApi.profile.mockImplementation(id =>
    Promise.resolve({
      data: {userId: id, profileImageUrl: 'https://example.com/avatar.jpg'},
    }),
  );
});
afterEach(() => jest.useRealTimers());

test('coalesces concurrent inbox and message profile requests and reuses the result', async () => {
  const first = getChatProfile(12);
  const second = getChatProfile('12');
  expect(second).toBe(first);
  expect(await second).toEqual(await first);
  await getChatProfile(12);
  expect(chatApi.profile).toHaveBeenCalledTimes(1);
  expect(peekChatProfile(12).userId).toBe(12);
});

test('expires display metadata and fetches a changed photo after 60 seconds', async () => {
  await getChatProfile(12);
  jest.advanceTimersByTime(60001);
  expect(peekChatProfile(12)).toBeUndefined();
  await getChatProfile(12);
  expect(chatApi.profile).toHaveBeenCalledTimes(2);
});

test('never exposes the previous account profile cache, including late responses', async () => {
  let finish;
  chatApi.profile.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const previous = getChatProfile(12);
  chatGeneration.mockReturnValue(++generation);
  expect(peekChatProfile(12)).toBeUndefined();
  await getChatProfile(12);
  finish({data: {userId: 12, displayName: 'previous session'}});
  await previous;
  expect(peekChatProfile(12).displayName).toBeUndefined();
  expect(chatApi.profile).toHaveBeenCalledTimes(2);
});

test('does not cache failures, allowing retry after slow-network errors', async () => {
  chatApi.profile.mockRejectedValueOnce(new Error('offline'));
  await expect(getChatProfile(12)).rejects.toThrow('offline');
  await getChatProfile(12);
  expect(chatApi.profile).toHaveBeenCalledTimes(2);
});

test('bounds cache size to 128 users', async () => {
  for (let id = 0; id < 129; id++) {
    await getChatProfile(id);
  }
  expect(peekChatProfile(0)).toBeUndefined();
  expect(peekChatProfile(128).userId).toBe(128);
});
