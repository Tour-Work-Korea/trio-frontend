import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import KodaSocialLogin from '../../web/src/features/koda/components/KodaSocialLogin';

jest.mock('@screens/(Common)/Login/SocialLogin', () => 'SocialLogin');
jest.mock('../../web/src/features/koda/components/KodaGoogleLogin', () =>
  'KodaGoogleLogin',
);

let screen;
afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  screen = undefined;
});

test('the explicit KODA Google route selects the KODA login screen', async () => {
  await act(async () => {
    screen = Renderer.create(
      <KodaSocialLogin route={{params: {koda: true, provider: 'GOOGLE'}}} />,
    );
  });
  expect(screen.root.findAllByType('KodaGoogleLogin')).toHaveLength(1);
  expect(screen.root.findAllByType('SocialLogin')).toHaveLength(0);
});

test.each([
  undefined,
  {provider: 'GOOGLE'},
  {koda: false, provider: 'GOOGLE'},
  {koda: 'true', provider: 'GOOGLE'},
  {koda: true, provider: 'KAKAO'},
  {koda: true, provider: 'NAVER'},
])('other social entry keeps the shared screen and its props: %j', async params => {
  const route = {name: 'SocialLogin', params};
  const navigation = {navigate: jest.fn()};
  await act(async () => {
    screen = Renderer.create(
      <KodaSocialLogin route={route} navigation={navigation} />,
    );
  });
  const shared = screen.root.findByType('SocialLogin');
  expect(shared.props.route).toBe(route);
  expect(shared.props.navigation).toBe(navigation);
  expect(screen.root.findAllByType('KodaGoogleLogin')).toHaveLength(0);
});
