export const GUESTHOUSE_MAP_BOUNDS = {
  ALL: {
    id: 0,
    name: '제주전체',
    swLat: 33.1,
    swLng: 126.08,
    neLat: 34.0,
    neLng: 127.0,
  },
  NORTH: {
    id: 1,
    name: '제주북부',
    swLat: 33.43,
    swLng: 126.35,
    neLat: 33.58,
    neLng: 126.7,
  },
  WEST: {
    id: 2,
    name: '제주서부',
    swLat: 33.25,
    swLng: 126.1,
    neLat: 33.5,
    neLng: 126.4,
  },
  SOUTH: {
    id: 3,
    name: '제주남부',
    swLat: 33.18,
    swLng: 126.35,
    neLat: 33.35,
    neLng: 126.75,
  },
  EAST: {
    id: 4,
    name: '제주동부',
    swLat: 33.3,
    swLng: 126.7,
    neLat: 33.55,
    neLng: 127.0,
  },
};

const REGION_IDS_TO_BOUNDS_KEY = {
  '1': 'EAST',
  '2': 'WEST',
  '3': 'SOUTH',
  '4': 'NORTH',
  '1,2,3,4': 'ALL',
};

export const getGuesthouseMapBoundsByRegionIds = regionIds => {
  if (!Array.isArray(regionIds) || regionIds.length === 0) {
    return null;
  }

  const key = [...regionIds]
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
    .join(',');

  const boundsKey = REGION_IDS_TO_BOUNDS_KEY[key];

  return boundsKey ? GUESTHOUSE_MAP_BOUNDS[boundsKey] : null;
};

export const getMapRegionFromBounds = bounds => {
  if (!bounds) {
    return null;
  }

  return {
    latitude: (bounds.swLat + bounds.neLat) / 2,
    longitude: (bounds.swLng + bounds.neLng) / 2,
    latitudeDelta: Math.max(bounds.neLat - bounds.swLat, 0.01),
    longitudeDelta: Math.max(bounds.neLng - bounds.swLng, 0.01),
  };
};
