import {Platform} from 'react-native';
import {loadCompanionFeedPage} from '../../../packages/app/src/features/companion/communityFeed';
import communityApi from '@utils/api/communityApi';
import api from '@utils/api/axiosInstance';
import {
  chatApi,
  companionApi,
  uploadBinary,
  uploadPostImages,
} from '../../../packages/app/src/features/companion/api';

jest.mock('react-native-config', () => ({
  CHAT_BASE_URL: 'https://chat-dev.ddakji.kr',
}));
jest.mock('@utils/api/axiosInstance', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));
jest.mock('@utils/auth/login', () => ({tryRefresh: jest.fn()}));
jest.mock('@stores/userStore', () => ({
  getState: () => ({accessToken: 'test-jwt'}),
}));
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    interceptors: {request: {use: jest.fn()}, response: {use: jest.fn()}},
  }),
}));

afterEach(() => jest.clearAllMocks());
test('network retries retain the caller-provided idempotency key and generation', () => {
  const person = {participationId: 501, requestGeneration: 7};
  companionApi.decide(3001, person, true, 'same-intent-key');
  companionApi.decide(3001, person, true, 'same-intent-key');
  expect(api.post.mock.calls).toEqual(
    Array(2).fill([
      '/user/companions/3001/applications/501/accept',
      {requestGeneration: 7},
      {headers: {'Idempotency-Key': 'same-intent-key'}},
    ]),
  );
  companionApi.withdraw(3001, 8, 'next-intent-key');
  expect(api.post).toHaveBeenLastCalledWith(
    '/user/companions/3001/applications/me/withdraw',
    {requestGeneration: 8},
    {headers: {'Idempotency-Key': 'next-intent-key'}},
  );
});
test('room readiness is retrieved by chat-access, not by repeated inquiry mutations', () => {
  companionApi.inquire(3001, 'inquiry-key');
  companionApi.access(3001);
  companionApi.access(3001);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenNthCalledWith(
    1,
    '/user/companions/3001/chat-access',
  );
  expect(api.get).toHaveBeenNthCalledWith(
    2,
    '/user/companions/3001/chat-access',
  );
});
test('private image payloads cannot send authentication to a different host or room', async () => {
  await expect(
    chatApi.download(7001, 'https://example.com/steal-token'),
  ).rejects.toThrow('INVALID_ATTACHMENT');
  await expect(
    chatApi.download(
      7001,
      '/api/v1/chat/rooms/7002/attachments/images/901/download-url',
    ),
  ).rejects.toThrow('INVALID_ATTACHMENT');
  await expect(
    chatApi.download(
      7001,
      '/api/v1/chat/rooms/7001/attachments/images/901/download-url?redirect=bad',
    ),
  ).rejects.toThrow('INVALID_ATTACHMENT');
});
test('a failed object-store upload is not treated as success', async () => {
  const oldFetch = global.fetch;
  const body = {};
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({blob: async () => body})
    .mockResolvedValueOnce({ok: false, status: 403});
  try {
    await expect(
      uploadBinary(
        'https://storage.example/signed',
        'file://photo.jpg',
        'PUT',
        {'Content-Type': 'image/jpeg'},
      ),
    ).rejects.toThrow('UPLOAD_FAILED');
    expect(global.fetch).toHaveBeenLastCalledWith(
      'https://storage.example/signed',
      {method: 'PUT', headers: {'Content-Type': 'image/jpeg'}, body},
    );
  } finally {
    global.fetch = oldFetch;
  }
});

test('publishing images sends only the documented metadata and preserves existing photos', async () => {
  const oldFetch = global.fetch;
  const presign = jest
    .spyOn(communityApi, 'getImagePresignedUrls')
    .mockResolvedValue({
      data: [
        {
          objectKey: 'uploaded.jpg',
          fileSizeBytes: 200,
          imageOrder: 1,
          presignedUrl: 'https://storage.example/signed',
        },
      ],
    });
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({blob: async () => ({})})
    .mockResolvedValueOnce({ok: true});
  try {
    const images = await uploadPostImages(9001, [
      {isExisting: true, objectKey: 'existing.jpg', fileSizeBytes: 100},
      {
        uri: 'file://photo.jpg',
        type: 'image/jpeg',
        fileName: 'photo.jpg',
        fileSize: 200,
      },
    ]);
    expect(images).toEqual([
      {objectKey: 'existing.jpg', fileSizeBytes: 100, imageOrder: 0},
      {objectKey: 'uploaded.jpg', fileSizeBytes: 200, imageOrder: 1},
    ]);
  } finally {
    global.fetch = oldFetch;
    presign.mockRestore();
  }
});

test('the community feed joins author/body/place and retains closed posts without duplicate lifecycle rows', async () => {
  const list = jest.spyOn(companionApi, 'list').mockImplementation(({status}) =>
    Promise.resolve({
      data: {
        content:
          status === 'OPEN'
            ? [{companionId: 1, postId: 11}]
            : [
                {companionId: 1, postId: 11},
                {companionId: 2, postId: 12},
              ],
        last: status === 'CLOSED',
      },
    }),
  );
  const detail = jest.spyOn(companionApi, 'detail').mockImplementation(id =>
    Promise.resolve({
      data: {
        companionId: id,
        status: id === 2 ? 'CLOSED' : 'OPEN',
        description: 'trip introduction',
        meetingPlace: 'meeting place',
      },
    }),
  );
  const post = jest
    .spyOn(communityApi, 'getPostDetail')
    .mockImplementation(id =>
      Promise.resolve({
        data: {
          postId: id,
          author: {nickname: 'original nickname'},
          content: 'original body',
        },
      }),
    );
  try {
    const result = await loadCompanionFeedPage(0);
    expect(result.content).toHaveLength(2);
    expect(result.last).toBe(false);
    expect(result.content[1]).toMatchObject({
      status: 'CLOSED',
      description: 'trip introduction',
      meetingPlace: 'meeting place',
      post: {postId: 12, author: {nickname: 'original nickname'}},
    });
    expect(detail).toHaveBeenCalledTimes(2);
  } finally {
    list.mockRestore();
    detail.mockRestore();
    post.mockRestore();
  }
});
test('a feed page abandoned during navigation does not hydrate more detail requests', async () => {
  const list = jest.spyOn(companionApi, 'list').mockResolvedValue({
    data: {content: [{companionId: 1, postId: 11}], last: true},
  });
  const detail = jest.spyOn(companionApi, 'detail');
  try {
    const result = await loadCompanionFeedPage(0, () => false);
    expect(result.content).toEqual([]);
    expect(detail).not.toHaveBeenCalled();
  } finally {
    list.mockRestore();
    detail.mockRestore();
  }
});

test('native WebSocket uses the documented room path and bearer header', () => {
  const previousSocket = global.WebSocket;
  const previousPlatform = Platform.OS;
  const onMessage = jest.fn();
  const socket = {};
  global.WebSocket = jest.fn(() => socket);
  Platform.OS = 'ios';
  try {
    chatApi.connect(17, onMessage, jest.fn(), jest.fn());
    expect(global.WebSocket).toHaveBeenCalledWith(
      'wss://chat-dev.ddakji.kr/ws/chat/rooms/17',
      null,
      {headers: {Authorization: 'Bearer test-jwt'}},
    );
    socket.onmessage({
      data: JSON.stringify({type: 'MESSAGE', payload: {messageId: 9}}),
    });
    expect(onMessage).toHaveBeenCalledWith({
      type: 'MESSAGE',
      payload: {messageId: 9},
    });
  } finally {
    global.WebSocket = previousSocket;
    Platform.OS = previousPlatform;
  }
});
