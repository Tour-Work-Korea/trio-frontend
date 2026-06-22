export const stripLocationHtml = value =>
  String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

export const getFiniteLocationNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
};

const normalizeNaverCoordinate = value => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.abs(number) > 1000 ? number / 10000000 : number;
};

export const normalizeCommunityLocation = location => {
  if (!location || typeof location !== 'object') {
    return null;
  }

  const placeName = stripLocationHtml(
    location.placeName ??
      location.name ??
      location.title ??
      location.locationName,
  );
  const roadAddress = stripLocationHtml(
    location.roadAddress ?? location.roadAddr ?? location.roadNameAddress,
  );
  const address = stripLocationHtml(
    location.address ?? location.jibunAddress ?? location.addressName,
  );
  const latitude = getFiniteLocationNumber(
    location.latitude,
    location.lat,
    location.y,
    normalizeNaverCoordinate(location.mapy),
  );
  const longitude = getFiniteLocationNumber(
    location.longitude,
    location.lng,
    location.x,
    normalizeNaverCoordinate(location.mapx),
  );

  if (!placeName && !roadAddress && !address) {
    return null;
  }

  return {
    placeName,
    address,
    roadAddress,
    latitude,
    longitude,
    category: stripLocationHtml(location.category ?? location.categoryName),
  };
};

export const normalizePlaceSearchResult = item =>
  normalizeCommunityLocation({
    ...item,
    placeName: item.placeName ?? item.name ?? item.title,
    latitude: item.latitude ?? item.lat,
    longitude: item.longitude ?? item.lng,
  });
