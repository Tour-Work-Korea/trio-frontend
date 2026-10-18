const SERVICE_REGION_NAMES = {
  JEJU_EAST: '제주 동부',
  JEJU_WEST: '제주 서부',
  JEJU_SOUTH: '제주 남부',
  JEJU_NORTH: '제주 북부',
  BUSAN: '부산',
  UNKNOWN: '지역 미정',
};

export const formatServiceRegion = regionType =>
  SERVICE_REGION_NAMES[regionType] ?? regionType ?? '';
