import dayjs from 'dayjs';

import {GUESTHOUSE_MAP_BOUNDS} from './guesthouseMapRegions';

export const getDefaultGuesthouseListParams = () => {
  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  return {
    displayDate: `${today.format('M.D dd')} - ${tomorrow.format('M.D dd')}`,
    adultCount: 1,
    childCount: 0,
    regionBounds: GUESTHOUSE_MAP_BOUNDS.ALL,
    searchText: '',
    initialMapView: true,
    mapResetKey: Date.now(),
  };
};
