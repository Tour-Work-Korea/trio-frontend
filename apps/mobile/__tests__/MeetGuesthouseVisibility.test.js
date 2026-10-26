import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import i18n from '@trio/app/src/i18n';
import api from '@utils/api/userMeetApi';
import MeetMain from '@screens/(Common)/BottomTabs/Meet/MeetMain';
import MeetDetail from '@screens/(Common)/Meet/MeetDetail';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
  useRoute: () => ({params: {partyId: 1588}}),
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));
jest.mock('@utils/api/userMeetApi', () => ({
  getRecentParties: jest.fn(),
  getPartyDetail: jest.fn(),
}));
jest.mock('@components/AppImage', () => ({
  __esModule: true,
  default: 'AppImage',
  prefetchImageUrls: jest.fn(),
}));
jest.mock('@components/modals/Meet/MeetFilterModal', () => () => null);
jest.mock('@components/modals/Meet/MeetSortModal', () => () => null);
jest.mock('@components/modals/ImageModal', () => () => null);
jest.mock('@components/LocalizedNaverMapView', () => 'Map');
jest.mock('@components/Avatar', () => 'Avatar');
jest.mock('@utils/toggleFavorite', () => ({toggleFavorite: jest.fn()}));
jest.mock('@utils/loginModalHub', () => ({showErrorModal: jest.fn()}));
jest.mock('@utils/api/axiosInstance', () => ({}));
jest.mock('@screens/(Common)/BottomTabs/Guesthouse/regions/RegionChips', () => () => null);
jest.mock('react-native-reanimated-carousel', () => 'Carousel');
jest.mock('@screens/(Common)/Meet/MeetDetail/PartyReview', () => () => null);
jest.mock('@hooks/useSwipeTabs', () => () => ({
  pagerRef: {current: null},
  activeKey: 'way',
  activeIndex: 3,
  isActive: key => key === 'way',
  pageWidth: 320,
  swipeEnabled: false,
}));

const party = {
  partyId: 1588,
  partyTitle: '게딱지 테스트',
  organizerType: 'PLATFORM',
  organizerName: '게딱지',
  applicationType: 'ADVANCE',
  scheduleType: 'DATE_EVENT',
  partyStatus: 'RECRUIT',
  partyStartDateTime: '2099-10-31T19:00:00',
  partyStartTime: '19:00:00',
  partyEndTime: '21:00:00',
  chargeType: 'PAID',
  amount: 29959,
  maxAttendance: 20,
  location: '테스트',
};
let screen;
const renderText = async component => {
  await act(async () => { screen = Renderer.create(component); });
  const text = node => {
    if (typeof node === 'string') { return node; }
    if (Array.isArray(node)) { return node.map(text).join(' '); }
    return text(node?.children ?? []);
  };
  return text(screen.toJSON());
};
afterEach(async () => {
  if (screen) { await act(async () => screen.unmount()); }
  jest.clearAllMocks();
});

test.each(['ko', 'en'])('%s: 게하 없는 이벤트는 목록에서 게하 이동 영역을 숨긴다', async language => {
  await i18n.changeLanguage(language);
  api.getRecentParties.mockResolvedValue({data: [party]});
  const output = await renderText(<MeetMain />);
  expect(output).toContain(party.partyTitle);
  expect(screen.root.findAll(node => node.props.children === i18n.t('common.guestHouse'))).toHaveLength(0);
  expect(output).not.toContain(i18n.t('common.goSeeGuesthouse'));
});

test('게하 없는 일반 콘텐츠도 목록 이동 영역을 숨긴다', async () => {
  api.getRecentParties.mockResolvedValue({data: [{...party, scheduleType: 'DAILY'}]});
  const output = await renderText(<MeetMain />);
  expect(output).toContain(party.partyTitle);
  expect(output).not.toContain(i18n.t('common.goSeeGuesthouse'));
});

test.each(['ko', 'en'])('%s: 게하 없는 상세는 장소를 유지하고 게하 이동 영역을 숨긴다', async language => {
  await i18n.changeLanguage(language);
  api.getPartyDetail.mockResolvedValue({data: party});
  const output = await renderText(<MeetDetail />);
  expect(output).toContain(party.location);
  expect(output).not.toContain(i18n.t('common.goSeeGuesthouse'));
});

test('게하에 연결된 이벤트는 기존 목록 이동 영역을 유지한다', async () => {
  api.getRecentParties.mockResolvedValue({data: [{...party, guesthouseId: 7, guesthouseName: '연결 숙소'}]});
  const output = await renderText(<MeetMain />);
  expect(output).toContain('연결 숙소');
  expect(output).toContain(i18n.t('common.goSeeGuesthouse'));
});

test('중첩된 게하 ID를 가진 상세도 기존 이동 영역을 유지한다', async () => {
  api.getPartyDetail.mockResolvedValue({data: {...party, guesthouse: {id: 7}, guesthouseName: '연결 숙소'}});
  const output = await renderText(<MeetDetail />);
  expect(output).toContain(i18n.t('common.goSeeGuesthouse'));
});
