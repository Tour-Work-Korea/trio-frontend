import {withPartyRegion} from '@screens/(Common)/BottomTabs/Meet/regions/params';
import {useMeetRegionStore} from '@screens/(Common)/BottomTabs/Meet/regions/store';

beforeEach(() => {
  useMeetRegionStore.setState({region: 'ALL'});
});

test('defaults content requests to all regions', () => {
  expect(withPartyRegion({sortBy: 'RECOMMEND'})).toEqual({
    sortBy: 'RECOMMEND',
    region: 'ALL',
  });
});

test('preserves every other filter when the region changes', () => {
  const filters = {
    contentTypes: ['BOOK'],
    isGuest: true,
    attendeeRange: 'FROM_3_TO_10',
    priceRange: 'UNDER_30000',
  };

  expect(withPartyRegion(filters, 'BUSAN')).toEqual({
    ...filters,
    region: 'BUSAN',
  });
});

test('shares the selected content region across screens and the filter modal', () => {
  useMeetRegionStore.getState().setRegion('JEJU');
  expect(useMeetRegionStore.getState().region).toBe('JEJU');
});
