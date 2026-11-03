import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import i18n from '@trio/app/src/i18n';
import {FlatList, Platform, StyleSheet} from 'react-native';
import MapScreen from '@screens/(Common)/BottomTabs/Guesthouse/GuesthouseListMap';
import {regionGuesthouseApi} from '@screens/(Common)/BottomTabs/Guesthouse/regions/api';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
}));
jest.mock('@components/Header', () => () => null);
jest.mock('@components/LocalizedNaverMapView', () => {
  const mockReact = require('react');
  return mockReact.forwardRef((props, ref) => {
    mockReact.useImperativeHandle(ref, () => ({animateRegionTo: jest.fn()}));
    return mockReact.createElement('NaverMap', props, props.children);
  });
});
jest.mock('@mj-studio/react-native-naver-map', () => ({
  NaverMapMarkerOverlay: 'MapMarker',
}));
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
}));
jest.mock('@components/AppImage', () => ({
  __esModule: true,
  default: 'Image',
  prefetchImageUrls: jest.fn(),
}));
jest.mock('@screens/_components/ContentImage', () => 'Image');
jest.mock('@utils/toggleFavorite', () => ({toggleFavorite: jest.fn()}));
jest.mock('@screens/(Common)/BottomTabs/Guesthouse/regions/api', () => ({
  regionGuesthouseApi: {getGuesthouseMap: jest.fn()},
}));

const bounds = {swLat: 33, swLng: 125, neLat: 34, neLng: 127};
const filters = {};
const props = {
  embedded: true,
  checkIn: '2026-10-29',
  checkOut: '2026-10-30',
  serviceRegionBounds: bounds,
  filterParams: filters,
};
let screen;
const map = () => screen.root.findByType('NaverMap');
beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  regionGuesthouseApi.getGuesthouseMap
    .mockReset()
    .mockResolvedValue({data: []});
});
afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  jest.restoreAllMocks();
});

test('explicit region bounds make only one request during iOS camera initialization', async () => {
  await act(async () => {
    screen = Renderer.create(<MapScreen {...props} />);
  });
  await act(async () => map().props.onInitialized());
  await act(async () =>
    map().props.onCameraIdle({
      latitude: 33.4,
      longitude: 126,
      region: {latitudeDelta: 1.1, longitudeDelta: 2.1},
    }),
  );
  await act(async () =>
    map().props.onCameraIdle({
      latitude: 33.5,
      longitude: 126,
      region: {latitudeDelta: 1, longitudeDelta: 2},
    }),
  );
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledTimes(1);
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledWith(
    expect.objectContaining(bounds),
  );
});

test('iOS camera movement does not auto-query until the user requests a new area', async () => {
  await act(async () => {
    screen = Renderer.create(<MapScreen {...props} guestCount={2} />);
  });
  await act(async () => map().props.onInitialized());
  await act(async () =>
    map().props.onCameraIdle({
      latitude: 36,
      longitude: 128,
      region: {latitudeDelta: 1, longitudeDelta: 2},
    }),
  );
  // Locate the existing research action by its translated label, independent of styling.
  const text = screen.root.findAll(
    node => node.props.children === '이 지역 다시 검색',
  );
  expect(text.length).toBeGreaterThan(0);
  let action = text[0].parent;
  while (action && !action.props.onPress) {
    action = action.parent;
  }
  await act(async () => action.props.onPress());
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledTimes(2);
});

const mountInitialized = async guestCount => {
  await act(async () => {
    screen = Renderer.create(<MapScreen {...props} guestCount={guestCount} />);
  });
  await act(async () => map().props.onInitialized());
};
const unmount = async () => {
  await act(async () => screen.unmount());
  screen = null;
};

test('iOS map cache is bounded after visiting many different search conditions', async () => {
  for (let guestCount = 100; guestCount < 114; guestCount += 1) {
    await mountInitialized(guestCount);
    await unmount();
  }
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledTimes(14);
  await mountInitialized(100);
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledTimes(15);
});

test('a cached map result expires and is fetched again after 60 seconds', async () => {
  let now = Date.now();
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  await mountInitialized(200);
  await unmount();
  await mountInitialized(200);
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledTimes(1);
  await unmount();
  now += 60001;
  await mountInitialized(200);
  expect(regionGuesthouseApi.getGuesthouseMap).toHaveBeenCalledTimes(2);
});


test.each(['ko', 'en'])('%s: a large iOS marker cluster uses a bounded virtualized popup', async language => {
  await i18n.changeLanguage(language);
  regionGuesthouseApi.getGuesthouseMap.mockResolvedValueOnce({data: Array.from({length: 50}, (_, index) => ({
    id: index + 1,
    name: `Stay ${index}`,
    latitude: 33.5,
    longitude: 126,
    price: 30000,
  }))});
  await mountInitialized(language === 'ko' ? 300 : 301);
  await act(async () => map().props.onLayout({nativeEvent: {layout: {width: 320, height: 450}}}));
  const marker = screen.root.findAllByType('MapMarker')[0];
  expect(marker).toBeDefined();
  await act(async () => marker.props.onTap());
  const popup = screen.root.findByType(FlatList);
  expect(popup.props.data).toHaveLength(50);
  expect(popup.props.initialNumToRender).toBe(6);
  expect(popup.props.windowSize).toBe(3);
  expect(StyleSheet.flatten(popup.props.style).height).toBe(180);
});
