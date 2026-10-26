import React from 'react';
import {Text} from 'react-native';
import Renderer, {act} from 'react-test-renderer';
import i18n from '@trio/app/src/i18n';
import MeetFilterModal from '@components/modals/Meet/MeetFilterModal';
import GuesthouseFilterModal from '@components/modals/Guesthouse/GuesthouseFilterModal';
import EmploySortModal from '@components/modals/Employ/EmploySortModal';
import PostTapSection from '@screens/(Common)/GuesthousePost/PostTapSection';
import MyCouponList from '@screens/(User)/UserMyPage/MyCouponList';

jest.mock('@components/modals/AdaptiveModal', () => 'Modal');
jest.mock('@components/ButtonScarlet', () => 'ButtonScarlet');
jest.mock('@components/Header', () => 'Header');
jest.mock('@components/AppImage', () => 'AppImage');
jest.mock('@hooks/useKeyboardAwareScrollView', () => () => ({
  scrollRef: {current: null},
  contentContainerStyle: {},
}));
jest.mock(
  '@screens/(Common)/BottomTabs/Guesthouse/regions/RegionChips',
  () => () => null,
);
jest.mock('@screens/(Common)/BottomTabs/Guesthouse/regions/store', () => ({
  useGuesthouseRegionStore: selector =>
    selector({region: 'ALL', setRegion: jest.fn()}),
}));
jest.mock('@screens/(Common)/BottomTabs/Meet/regions/store', () => ({
  useMeetRegionStore: selector => selector({setRegion: jest.fn()}),
}));
jest.mock(
  '@screens/(User)/UserMyPage/MyCouponList/MyCouponOwnList',
  () => () => null,
);
jest.mock(
  '@screens/(User)/UserMyPage/MyCouponList/MyCouponReceive',
  () => () => null,
);

const textContent = node => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textContent).join(' ');
  return textContent(node?.children ?? []);
};
let screen;
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  screen = undefined;
  await act(async () => i18n.changeLanguage('ko'));
});

test.each([
  [
    'activity filters',
    <MeetFilterModal visible onClose={jest.fn()} onApply={jest.fn()} />,
    [
      'common.potluck',
      'meet.anyoneCanParticipate',
      'meet.310People',
      'meet.lessThan10000Won',
    ],
  ],
  [
    'accommodation filters',
    <GuesthouseFilterModal visible onClose={jest.fn()} onApply={jest.fn()} />,
    [
      'common.sort',
      'common.potluck',
      'common.standardRoom',
      'guesthouse.lowestPrice',
    ],
  ],
  [
    'staff sorting',
    <EmploySortModal
      visible
      onClose={jest.fn()}
      onSelect={jest.fn()}
      selected="RECOMMEND"
    />,
    ['common.recommended', 'employ.newest', 'employ.likes'],
  ],
  [
    'introduction tabs',
    <PostTapSection />,
    ['guesthouse.greetings', 'guesthouse.space', 'guesthouse.life'],
  ],
  ['coupon tabs', <MyCouponList />, ['common.holding', 'common.getCoupon']],
])(
  '%s follow the current language after mounting in English',
  async (_name, component, keys) => {
    await act(async () => i18n.changeLanguage('en'));
    await act(async () => {
      screen = Renderer.create(component);
    });
    for (const language of ['en', 'ko', 'en', 'ko']) {
      await act(async () => i18n.changeLanguage(language));
      const text = textContent(screen.toJSON());
      for (const key of keys) {
        expect(text).toContain(i18n.getFixedT(language)(key));
        const other = i18n.getFixedT(language === 'ko' ? 'en' : 'ko')(key);
        if (other !== i18n.t(key)) expect(text).not.toContain(other);
      }
    }
  },
);

const pressText = async label => {
  let node = screen.root
    .findAllByType(Text)
    .find(item => item.props.children === label);
  expect(node).toBeDefined();
  while (node && !node.props.onPress) node = node.parent;
  expect(node).toBeDefined();
  await act(async () => node.props.onPress());
};

test('accommodation filter selections keep their internal values across language changes', async () => {
  const onApply = jest.fn();
  await act(async () => i18n.changeLanguage('en'));
  await act(async () => {
    screen = Renderer.create(
      <GuesthouseFilterModal visible onClose={jest.fn()} onApply={onApply} />,
    );
  });
  await pressText(i18n.t('common.potluck'));
  await pressText(i18n.t('common.standardRoom'));
  await act(async () => i18n.changeLanguage('ko'));
  await pressText(i18n.t('guesthouse.viewGuestHouses'));
  expect(onApply).toHaveBeenLastCalledWith(
    expect.objectContaining({
      tags: ['포틀럭'],
      roomType: '일반 객실',
      sortBy: 'RECOMMEND',
    }),
  );
  await pressText(i18n.t('common.potluck'));
  await pressText(i18n.t('common.standardRoom'));
  await pressText(i18n.t('guesthouse.viewGuestHouses'));
  expect(onApply).toHaveBeenLastCalledWith(
    expect.objectContaining({tags: [], roomType: null}),
  );
});
