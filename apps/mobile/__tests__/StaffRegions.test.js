import {
  countRecruitingRecruits,
  useStaffRegionStore,
  withRecruitRegion,
} from '@screens/(Common)/BottomTabs/Community/Staff/regions';

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

test('counts only currently recruiting staff posts', () => {
  expect(
    countRecruitingRecruits([
      {recruitId: 1, isRecruiting: true},
      {recruitId: 2, isRecruiting: false},
      {recruitId: 3},
    ]),
  ).toBe(2);
});

test('keeps the selected staff region independently', () => {
  useStaffRegionStore.getState().setRegion('JEJU');
  expect(useStaffRegionStore.getState().region).toBe('JEJU');
});
