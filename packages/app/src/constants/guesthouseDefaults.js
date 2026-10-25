import dayjs from 'dayjs';

import {GUESTHOUSE_MAP_BOUNDS} from './guesthouseMapRegions';

export const getDefaultGuesthouseListParams = () => {
  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  return {
    displayDate: `${today.format('M.D ddd')} - ${tomorrow.format('M.D ddd')}`,
    adultCount: 1,
    childCount: 0,
    regionBounds: GUESTHOUSE_MAP_BOUNDS.ALL,
    searchText: '',
    categoryTags: [],
    initialMapView: true,
    mapResetKey: Date.now(),
    fromHomeCategory: false,
  };
};
