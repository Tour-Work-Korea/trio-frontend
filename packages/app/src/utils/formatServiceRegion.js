import i18n from '@trio/app/src/i18n';
const SERVICE_REGION_NAMES = {
  JEJU_EAST: 'regions.jejuEast',
  JEJU_WEST: 'regions.jejuWest',
  JEJU_SOUTH: 'regions.jejuSouth',
  JEJU_NORTH: 'regions.jejuNorth',
  BUSAN: 'regions.busan',
  UNKNOWN: 'regions.unknown',
};

export const formatServiceRegion = regionType =>
  SERVICE_REGION_NAMES[regionType]
    ? i18n.t(SERVICE_REGION_NAMES[regionType])
    : regionType ?? '';
