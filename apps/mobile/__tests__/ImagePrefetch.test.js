import {Image} from 'react-native';
import {prefetchImageUrls} from '@components/AppImage';

const url = index => `https://images.example.test/${index}.jpg`;
const flush = async () => {
  for (let i = 0; i < 20; i += 1) {
    await Promise.resolve();
  }
};

beforeEach(() => {
  jest.spyOn(Image, 'queryCache').mockResolvedValue({});
  jest.spyOn(Image, 'prefetch').mockResolvedValue(true);
});
afterEach(() => jest.restoreAllMocks());

test('home batches keep at most two iOS speculative downloads active', async () => {
  let active = 0;
  let peak = 0;
  Image.prefetch.mockImplementation(async () => {
    active += 1;
    peak = Math.max(peak, active);
    await flush();
    active -= 1;
    return true;
  });
  await Promise.all([
    prefetchImageUrls(Array.from({length: 3}, (_, i) => url(i))),
    prefetchImageUrls(Array.from({length: 6}, (_, i) => url(i + 3))),
    prefetchImageUrls(Array.from({length: 4}, (_, i) => url(i + 9))),
    prefetchImageUrls(Array.from({length: 6}, (_, i) => url(i + 13))),
  ]);
  expect(peak).toBe(2);
  expect(Image.prefetch).toHaveBeenCalledTimes(19);
});

test('concurrent screens share an outstanding URL', async () => {
  await Promise.all([
    prefetchImageUrls([url(1), url(1)]),
    prefetchImageUrls([` ${url(1)} `]),
  ]);
  expect(Image.prefetch).toHaveBeenCalledTimes(1);
});

test('native cache hits do not download or decode again', async () => {
  Image.queryCache.mockResolvedValue({[url(1)]: 'disk'});
  await prefetchImageUrls([url(1)]);
  expect(Image.prefetch).not.toHaveBeenCalled();
});

test('failed downloads can be retried and do not block the queue', async () => {
  Image.prefetch.mockRejectedValueOnce(new Error('offline'));
  const result = await prefetchImageUrls([url(1), url(2), url(3)]);
  expect(result[0].status).toBe('rejected');
  await flush();
  await prefetchImageUrls([url(1)]);
  expect(Image.prefetch).toHaveBeenCalledTimes(4);
});

test('cache inspection failures still permit downloads', async () => {
  Image.queryCache.mockRejectedValue(new Error('cache unavailable'));
  await prefetchImageUrls([url(1)]);
  expect(Image.prefetch).toHaveBeenCalledWith(url(1));
});

test('only remote HTTP URLs consume prefetch slots', async () => {
  await prefetchImageUrls([null, '', 'file:///photo.jpg', 'data:image/png;base64,x', url(1)]);
  expect(Image.prefetch).toHaveBeenCalledTimes(1);
});

test('nearby viewer images move ahead of queued background work', async () => {
  const releases = [];
  Image.prefetch.mockImplementation(() => new Promise(resolve => releases.push(resolve)));
  const background = prefetchImageUrls([url(1), url(2), url(3), url(4)]);
  await flush();
  const nearby = prefetchImageUrls([url(10)], {priority: true});
  releases.shift()(true);
  await flush();
  expect(Image.prefetch.mock.calls[2][0]).toBe(url(10));
  while (releases.length) {
    releases.shift()(true);
    await flush();
  }
  await Promise.all([background, nearby]);
});


test('native eviction permits a fresh prefetch rather than trusting old JS state', async () => {
  Image.queryCache.mockResolvedValueOnce({[url(1)]: 'memory'}).mockResolvedValue({});
  await prefetchImageUrls([url(1)]);
  await flush();
  await prefetchImageUrls([url(1)]);
  expect(Image.prefetch).toHaveBeenCalledTimes(1);
});

test('rapid navigation bounds queued work and settles skipped requests', async () => {
  const results = await prefetchImageUrls(
    Array.from({length: 100}, (_, i) => url(i)),
    {limit: 100},
  );
  expect(Image.prefetch).toHaveBeenCalledTimes(32);
  expect(results.filter(result => result.value === false)).toHaveLength(68);
});
