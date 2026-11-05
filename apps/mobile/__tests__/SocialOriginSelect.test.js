import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Text, TouchableOpacity} from 'react-native';
import SocialOriginSelect from '@screens/(Common)/Register/SocialOriginSelect';

const mockNavigation = {navigate: jest.fn()};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: key => key}),
}));
jest.mock('@components/ButtonScarlet', () => 'ButtonScarlet');

const params = {
  provider: 'GOOGLE',
  socialSignupToken: 'signup-session',
  socialProfile: {name: 'Alex'},
};
let screen;
const next = () => screen.root.findByType('ButtonScarlet');
const mount = async props => {
  await act(async () => {
    screen = Renderer.create(
      <SocialOriginSelect route={{params}} {...props} />,
    );
  });
};
const select = async origin => {
  const label = origin === 'FOREIGN' ? 'auth.foreigner' : 'auth.korean';
  const option = screen.root.findAllByType(TouchableOpacity).find(node =>
    node.findAllByType(Text).some(text => text.props.children === label),
  );
  expect(option).toBeDefined();
  await act(async () => option.props.onPress());
};

beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  screen = null;
});

test('cannot continue before choosing an origin', async () => {
  const onSelectOrigin = jest.fn();
  await mount({onSelectOrigin});
  expect(next().props.disabled).toBe(true);
  await act(async () => next().props.onPress());

  expect(onSelectOrigin).not.toHaveBeenCalled();
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
});

test.each(['DOMESTIC', 'FOREIGN'])(
  'a host receives only the selected %s origin without navigation',
  async origin => {
    const onSelectOrigin = jest.fn();
    await mount({onSelectOrigin});
    await select(origin);
    expect(next().props.disabled).toBe(false);
    await act(async () => next().props.onPress());

    expect(onSelectOrigin).toHaveBeenCalledTimes(1);
    expect(onSelectOrigin).toHaveBeenCalledWith(origin);
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  },
);

test('native foreign signup keeps its existing route and signup context', async () => {
  await mount();
  await select('FOREIGN');
  await act(async () => next().props.onPress());

  expect(mockNavigation.navigate).toHaveBeenCalledWith('ForeignRegisterProfile', {
    ...params,
    user: 'USER',
    isSocial: true,
    isForeign: true,
  });
});

test('native domestic signup keeps its existing terms route and signup context', async () => {
  await mount();
  await select('DOMESTIC');
  await act(async () => next().props.onPress());

  expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterAgree', {
    ...params,
    user: 'USER',
    agreements: [],
    isSocial: true,
    isForeign: false,
  });
});
