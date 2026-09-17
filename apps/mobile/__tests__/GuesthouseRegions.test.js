import {getServiceRegionMapBounds} from '@screens/(Common)/BottomTabs/Guesthouse/regions/mapBounds';
import api from '@utils/api/axiosInstance';
import {regionGuesthouseApi} from '@screens/(Common)/BottomTabs/Guesthouse/regions/api';
import {useGuesthouseRegionStore} from '@screens/(Common)/BottomTabs/Guesthouse/regions/store';

jest.mock('@utils/api/axiosInstance', () => ({get: jest.fn()}));

const regions = [
  {code: 'ALL', displayName: '전체', mapBounds: null},
  {
    code: 'JEJU',
    displayName: '제주',
    mapBounds: {swLat: 33.1, swLng: 126.1, neLat: 33.65, neLng: 127},
  },
  {
    code: 'BUSAN',
    displayName: '부산',
    mapBounds: {swLat: 34.85, swLng: 128.75, neLat: 35.4, neLng: 129.35},
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  useGuesthouseRegionStore.setState({
    region: 'ALL',
    regions: [],
    loaded: false,
    loading: false,
  });
});

test.each([
  'getGuesthouseList',
  'getGuesthouseFilterCount',
  'getGuesthouseMap',
])(
  '%s sends one region and preserves other filters without legacy regionIds',
  method => {
    const params = {
      checkIn: '2026-10-01',
      checkOut: '2026-10-03',
      region: 'BUSAN',
      regionIds: [1, 2],
      guestCount: 2,
      minPrice: 30000,
      amenityIds: [3, 5],
    };
    regionGuesthouseApi[method](params);
    const options = api.get.mock.calls[0][1];
    expect(options.params).toEqual({...params, regionIds: undefined});
    expect(options.paramsSerializer(options.params)).toContain('region=BUSAN');
    expect(options.paramsSerializer(options.params)).not.toContain('regionIds');
    expect(options.paramsSerializer(options.params)).toContain(
      'amenityIds=3&amenityIds=5',
    );
  },
);

test('keyword search keeps region and the registered keyword pair together', () => {
  regionGuesthouseApi.getGuesthouseList({
    region: 'JEJU',
    keyword: '애월',
    keywordId: 12,
  });
  expect(api.get.mock.calls[0][1].params).toEqual({
    region: 'JEJU',
    keyword: '애월',
    keywordId: 12,
  });
});

test('ALL map requests preserve the supplied viewport', () => {
  const bounds = {swLat: 35.1, swLng: 129, neLat: 35.25, neLng: 129.25};
  regionGuesthouseApi.getGuesthouseMap({region: 'ALL', ...bounds});
  expect(api.get.mock.calls[0][1].params).toEqual({region: 'ALL', ...bounds});
});

test('loads server ordering and future service regions without resetting selection', async () => {
  const expanded = [
    ...regions,
    {code: 'MOKPO', displayName: '목포', mapBounds: null},
  ];
  api.get.mockResolvedValue({data: expanded});
  useGuesthouseRegionStore.getState().setRegion('BUSAN');
  await useGuesthouseRegionStore.getState().loadRegions();
  await useGuesthouseRegionStore.getState().loadRegions();
  expect(api.get).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenCalledWith('/common/service-regions', {
    withAuth: false,
  });
  expect(useGuesthouseRegionStore.getState().regions).toEqual(expanded);
  expect(useGuesthouseRegionStore.getState().region).toBe('BUSAN');
});

test('deduplicates concurrent metadata loads', async () => {
  let resolve;
  api.get.mockReturnValue(
    new Promise(done => {
      resolve = done;
    }),
  );
  const first = useGuesthouseRegionStore.getState().loadRegions();
  await useGuesthouseRegionStore.getState().loadRegions();
  expect(api.get).toHaveBeenCalledTimes(1);
  resolve({data: regions});
  await first;
  expect(useGuesthouseRegionStore.getState().loading).toBe(false);
});


test('ALL camera bounds include Jeju and Busan with room at the edges', () => {
  const bounds = getServiceRegionMapBounds(regions, 'ALL');
  expect(bounds.swLat).toBeLessThan(33.1);
  expect(bounds.swLng).toBeLessThan(126.1);
  expect(bounds.neLat).toBeGreaterThan(35.4);
  expect(bounds.neLng).toBeGreaterThan(129.35);
});

test('individual camera bounds remain unchanged and missing metadata waits', () => {
  expect(getServiceRegionMapBounds(regions, 'BUSAN')).toEqual(regions[2].mapBounds);
  expect(getServiceRegionMapBounds([], 'ALL')).toBeNull();
});
