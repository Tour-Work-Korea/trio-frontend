import {getSharedDetailUrl} from '../../../packages/app/src/screens/_components/sharedDetailLink';

test.each(['/guesthouses/14', '/contents/1804'])(
  'development IDs stay on the development website: %s', path => {
    expect(getSharedDetailUrl(path, {apiBaseUrl: 'https://dev.ddakji.kr/api/v1'}))
      .toBe(`https://app-dev.ddakji.kr${path}?shared=1`);
  },
);
test.each(['/guesthouses/14', '/contents/1804'])(
  'production IDs stay on the production website: %s', path => {
    expect(getSharedDetailUrl(path, {apiBaseUrl: 'https://api.ddakji.kr/api/v1'}))
      .toBe(`https://ddakji.kr${path}?shared=1`);
  },
);
test('web sharing retains the current website origin', () => {
  expect(getSharedDetailUrl('/guesthouses/14', {
    apiBaseUrl: 'https://dev.ddakji.kr/api/v1',
    webOrigin: 'http://localhost:5173',
  })).toBe('http://localhost:5173/guesthouses/14?shared=1');
});
