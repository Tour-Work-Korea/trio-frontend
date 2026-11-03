import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {AppState, FlatList, Platform} from 'react-native';
import api from '@utils/api/userMeetApi';
import MeetMain from '@screens/(Common)/BottomTabs/Meet/MeetMain';
import Banner from '@screens/(Common)/BottomTabs/Home/HomeMain/Banner';
import {useMeetRegionStore} from '@screens/(Common)/BottomTabs/Meet/regions/store';

let mockFocused = true;
let mockFocusVersion = 0;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
  useIsFocused: () => mockFocused,
  useFocusEffect: callback =>
    require('react').useEffect(callback, [callback, mockFocusVersion]),
}));
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({t: key => key}),
}));
jest.mock('@utils/api/userMeetApi', () => ({getRecentParties: jest.fn()}));
jest.mock('@components/AppImage', () => ({
  __esModule: true,
  default: 'AppImage',
  prefetchImageUrls: jest.fn(),
}));
jest.mock('@screens/_components/ContentImage', () => 'ContentImage');
jest.mock('@components/modals/Meet/MeetFilterModal', () => () => null);
jest.mock('@components/modals/Meet/MeetSortModal', () => () => null);
jest.mock(
  '@screens/(Common)/BottomTabs/Guesthouse/regions/RegionChips',
  () => () => null,
);
jest.mock('@utils/toggleFavorite', () => ({toggleFavorite: jest.fn()}));

const pending = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return {promise, resolve, reject};
};
let screen;
let appStateListener;
let mockNow;
const mount = async component =>
  act(async () => {
    screen = Renderer.create(component);
  });
const refocus = async () =>
  act(async () => {
    mockFocusVersion += 1;
    screen.update(<MeetMain />);
  });
const list = () => screen.root.findByType(FlatList);
beforeEach(() => {
  mockFocused = true;
  mockFocusVersion = 0;
  mockNow = 100000;
  jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    appStateListener = callback;
    return {remove: jest.fn()};
  });
  AppState.currentState = 'active';
  useMeetRegionStore.setState({region: 'ALL'});
  api.getRecentParties.mockReset().mockResolvedValue({data: []});
});
afterEach(async () => {
  if (screen) {
    await act(async () => screen.unmount());
  }
  screen = null;
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('iOS immediate refocus reuses a successful list; expiry fetches again', async () => {
  await mount(<MeetMain />);
  await refocus();
  expect(api.getRecentParties).toHaveBeenCalledTimes(1);
  mockNow += 30001;
  await refocus();
  expect(api.getRecentParties).toHaveBeenCalledTimes(2);
});

test('pull to refresh bypasses the short cache and retains existing cards', async () => {
  api.getRecentParties.mockResolvedValueOnce({
    data: [
      {
        partyId: 1,
        partyTitle: 'Existing',
        guesthouseId: 2,
        guesthouseName: 'Stay',
      },
    ],
  });
  await mount(<MeetMain />);
  const request = pending();
  api.getRecentParties.mockReturnValueOnce(request.promise);
  await act(async () => {
    list().props.refreshControl.props.onRefresh();
  });
  expect(list().props.data).toHaveLength(1);
  expect(list().props.refreshControl.props.refreshing).toBe(true);
  await act(async () => request.resolve({data: []}));
  expect(list().props.refreshControl.props.refreshing).toBe(false);
  expect(api.getRecentParties).toHaveBeenCalledTimes(2);
});

test('failed first load can retry on focus without waiting for cache expiry', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  api.getRecentParties.mockRejectedValueOnce(new Error('offline'));
  await mount(<MeetMain />);
  await refocus();
  expect(api.getRecentParties).toHaveBeenCalledTimes(2);
});

test('late responses cannot replace the latest region', async () => {
  const all = pending();
  const jeju = pending();
  api.getRecentParties
    .mockReturnValueOnce(all.promise)
    .mockReturnValueOnce(jeju.promise);
  await mount(<MeetMain />);
  await act(async () => useMeetRegionStore.setState({region: 'JEJU'}));
  await act(async () =>
    jeju.resolve({data: [{partyId: 2, partyTitle: 'Jeju', guesthouseId: 2}]}),
  );
  await act(async () =>
    all.resolve({data: [{partyId: 1, partyTitle: 'Old', guesthouseId: 1}]}),
  );
  expect(list().props.data[0].guesthouseId).toBe(2);
});

test('returning to a cached region invalidates a different in-flight response', async () => {
  api.getRecentParties.mockResolvedValueOnce({
    data: [{partyId: 1, guesthouseId: 1}],
  });
  await mount(<MeetMain />);
  const jeju = pending();
  api.getRecentParties.mockReturnValueOnce(jeju.promise);
  await act(async () => useMeetRegionStore.setState({region: 'JEJU'}));
  await act(async () => useMeetRegionStore.setState({region: 'ALL'}));
  await act(async () => jeju.resolve({data: [{partyId: 2, guesthouseId: 2}]}));
  expect(list().props.data[0].guesthouseId).toBe(1);
});

test('a failed refresh keeps cards and permits immediate manual retry', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  api.getRecentParties.mockResolvedValueOnce({
    data: [{partyId: 1, guesthouseId: 1}],
  });
  await mount(<MeetMain />);
  api.getRecentParties.mockRejectedValueOnce(new Error('offline'));
  await act(async () => {
    list().props.refreshControl.props.onRefresh();
  });
  expect(list().props.data).toHaveLength(1);
  expect(list().props.refreshControl.props.refreshing).toBe(false);
  await act(async () => {
    list().props.refreshControl.props.onRefresh();
  });
  expect(api.getRecentParties).toHaveBeenCalledTimes(3);
});

test('iOS banner stops automatic updates when blurred and resumes on focus', async () => {
  jest.useFakeTimers();
  const start = jest.spyOn(global, 'setInterval');
  const stop = jest.spyOn(global, 'clearInterval');
  const banners = [
    {url: 'https://example.test/a'},
    {url: 'https://example.test/b'},
  ];
  await mount(<Banner banners={banners} />);
  const timer = start.mock.results[start.mock.results.length - 1].value;
  expect(start.mock.calls[start.mock.calls.length - 1][1]).toBe(4000);
  mockFocused = false;
  await act(async () => screen.update(<Banner banners={[...banners]} />));
  expect(stop).toHaveBeenCalledWith(timer);
  const startsWhileHidden = start.mock.calls.length;
  await act(async () => {
    jest.advanceTimersByTime(8000);
  });
  expect(start).toHaveBeenCalledTimes(startsWhileHidden);
  mockFocused = true;
  await act(async () => screen.update(<Banner banners={[...banners]} />));
  expect(start).toHaveBeenCalledTimes(startsWhileHidden + 1);
});

test('iOS banner releases its timer in background and its listener on unmount', async () => {
  jest.useFakeTimers();
  const start = jest.spyOn(global, 'setInterval');
  const stop = jest.spyOn(global, 'clearInterval');
  await mount(
    <Banner
      banners={[
        {url: 'https://example.test/a'},
        {url: 'https://example.test/b'},
      ]}
    />,
  );
  const subscription = AppState.addEventListener.mock.results[0].value;
  const timer = start.mock.results[start.mock.results.length - 1].value;
  await act(async () => appStateListener('background'));
  expect(stop).toHaveBeenCalledWith(timer);
  const startsWhileHidden = start.mock.calls.length;
  await act(async () => appStateListener('active'));
  expect(start).toHaveBeenCalledTimes(startsWhileHidden + 1);
  const resumedTimer = start.mock.results[start.mock.results.length - 1].value;
  await act(async () => screen.unmount());
  screen = null;
  expect(subscription.remove).toHaveBeenCalledTimes(1);
  expect(stop).toHaveBeenCalledWith(resumedTimer);
});
