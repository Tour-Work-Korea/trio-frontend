import {
  useStaffRegionStore,
  withRecruitRegion,
} from '@screens/(Common)/BottomTabs/Community/Staff/regions';
import {formatServiceRegion} from '@utils/formatServiceRegion';

beforeEach(() => {
  useStaffRegionStore.setState({region: 'ALL'});
});

test('defaults staff recruit requests to all service regions', () => {
  expect(withRecruitRegion({page: 0, size: 8})).toEqual({
    page: 0,
    size: 8,
    region: 'ALL',
  });
});

test('does not send the incompatible locationIds filter with region', () => {
  expect(
    withRecruitRegion(
      {page: 0, size: 8, locationIds: [1, 2]},
      'BUSAN',
    ),
  ).toEqual({page: 0, size: 8, region: 'BUSAN'});
});

test('formats detailed response regions without treating them as request regions', () => {
  expect(formatServiceRegion('JEJU_NORTH')).toBe('제주 북부');
  expect(formatServiceRegion('BUSAN')).toBe('부산');
  expect(formatServiceRegion('UNKNOWN')).toBe('지역 미정');
});

test('keeps the selected staff region independently', () => {
  useStaffRegionStore.getState().setRegion('JEJU');
  expect(useStaffRegionStore.getState().region).toBe('JEJU');
});
