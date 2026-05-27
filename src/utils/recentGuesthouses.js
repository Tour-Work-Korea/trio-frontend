import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_GUESTHOUSES_KEY = 'recent-guesthouses';
const MAX_RECENT_GUESTHOUSES = 10;

const getGuesthouseId = guesthouse =>
  guesthouse?.guesthouseId ?? guesthouse?.id ?? guesthouse?.guestHouseId;

const getThumbnailUrl = guesthouse => {
  if (guesthouse?.thumbnailUrl) {
    return guesthouse.thumbnailUrl;
  }

  const images = Array.isArray(guesthouse?.guesthouseImages)
    ? guesthouse.guesthouseImages
    : [];
  const thumbnail = images.find(image => image?.isThumbnail) ?? images[0];

  return thumbnail?.guesthouseImageUrl ?? thumbnail?.imageUrl ?? null;
};

const getTagLabels = guesthouse =>
  (Array.isArray(guesthouse?.hashtags) ? guesthouse.hashtags : [])
    .map(tag =>
      typeof tag === 'string' ? tag : tag?.hashtag ?? tag?.name ?? null,
    )
    .filter(Boolean)
    .slice(0, 2);

const normalizeRecentGuesthouse = guesthouse => {
  const id = getGuesthouseId(guesthouse);

  if (!id) {
    return null;
  }

  return {
    id,
    guesthouseId: id,
    guesthouseName:
      guesthouse?.guesthouseName ?? guesthouse?.name ?? guesthouse?.title ?? '',
    thumbnailUrl: getThumbnailUrl(guesthouse),
    address:
      guesthouse?.guesthouseAddress ??
      guesthouse?.address ??
      guesthouse?.region ??
      '',
    addressDetail: guesthouse?.guesthouseAddressDetail ?? '',
    hashtags: getTagLabels(guesthouse),
    isLiked: Boolean(guesthouse?.isLiked ?? guesthouse?.isFavorite),
    viewedAt: Date.now(),
  };
};

export const getRecentGuesthouses = async () => {
  const value = await AsyncStorage.getItem(RECENT_GUESTHOUSES_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed
          .map(item => ({
            id: item?.id ?? item?.guesthouseId,
            guesthouseId: item?.guesthouseId ?? item?.id,
            guesthouseName: item?.guesthouseName ?? '',
            thumbnailUrl: item?.thumbnailUrl ?? null,
            address: item?.address ?? '',
            addressDetail: item?.addressDetail ?? '',
            hashtags: Array.isArray(item?.hashtags) ? item.hashtags : [],
            isLiked: Boolean(item?.isLiked),
            viewedAt: item?.viewedAt,
          }))
          .slice(0, MAX_RECENT_GUESTHOUSES)
      : [];
  } catch {
    return [];
  }
};

export const addRecentGuesthouse = async guesthouse => {
  const nextGuesthouse = normalizeRecentGuesthouse(guesthouse);

  if (!nextGuesthouse) {
    return [];
  }

  const currentGuesthouses = await getRecentGuesthouses();
  const nextGuesthouses = [
    nextGuesthouse,
    ...currentGuesthouses.filter(item => String(item.id) !== String(nextGuesthouse.id)),
  ].slice(0, MAX_RECENT_GUESTHOUSES);

  await AsyncStorage.setItem(
    RECENT_GUESTHOUSES_KEY,
    JSON.stringify(nextGuesthouses),
  );

  return nextGuesthouses;
};

export const setRecentGuesthouses = async guesthouses => {
  const nextGuesthouses = Array.isArray(guesthouses)
    ? guesthouses.slice(0, MAX_RECENT_GUESTHOUSES)
    : [];

  await AsyncStorage.setItem(
    RECENT_GUESTHOUSES_KEY,
    JSON.stringify(nextGuesthouses),
  );

  return nextGuesthouses;
};

export const clearRecentGuesthouses = async () => {
  await AsyncStorage.removeItem(RECENT_GUESTHOUSES_KEY);
};
