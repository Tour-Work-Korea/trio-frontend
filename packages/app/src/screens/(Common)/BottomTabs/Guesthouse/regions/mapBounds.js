// 서비스 지역 메타데이터를 기준으로 전체 지도의 표시 범위를 계산한다.
export const getServiceRegionMapBounds = (regions, selectedRegion) => {
  if (selectedRegion !== 'ALL') {
    return regions.find(item => item.code === selectedRegion)?.mapBounds ?? null;
  }
  const bounds = regions
    .filter(item => item.code !== 'ALL')
    .map(item => item.mapBounds)
    .filter(Boolean);
  if (!bounds.length) {
    return null;
  }
  const combined = {
    swLat: Math.min(...bounds.map(item => item.swLat)),
    swLng: Math.min(...bounds.map(item => item.swLng)),
    neLat: Math.max(...bounds.map(item => item.neLat)),
    neLng: Math.max(...bounds.map(item => item.neLng)),
  };
  const latitudePadding = (combined.neLat - combined.swLat) * 0.08;
  const longitudePadding = (combined.neLng - combined.swLng) * 0.08;
  return {
    swLat: combined.swLat - latitudePadding,
    swLng: combined.swLng - longitudePadding,
    neLat: combined.neLat + latitudePadding,
    neLng: combined.neLng + longitudePadding,
  };
};
