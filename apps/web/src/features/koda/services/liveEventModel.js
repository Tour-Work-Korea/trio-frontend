// Local preview keeps the dev guard; a validated deployment explicitly enables booking.
export function automaticBookingConfig(mode, apiBaseUrl, releaseEnabled) {
  if (typeof releaseEnabled === 'boolean') {
    return releaseEnabled && /^https:\/\/[^/?#]+\/api\/v1\/?$/.test(apiBaseUrl || '')
      ? {enabled: true}
      : null;
  }
  return mode === 'development' &&
    apiBaseUrl?.replace(/\/$/, '') === 'https://dev.ddakji.kr/api/v1'
    ? {enabled: true}
    : null;
}

function seoulTimestamp(value) {
  if (typeof value !== 'string') {
    throw new Error('Missing event timestamp.');
  }
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? value
    : `${value}+09:00`;
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error('Invalid event timestamp.');
  }
  return timestamp;
}

export function adaptLiveEvent(detail, listing, binding) {
  if (
    detail?.partyId !== binding.partyId ||
    listing?.partyId !== binding.partyId ||
    detail?.reviewSummary?.templateId !== binding.templateId ||
    detail.organizerType !== 'PLATFORM'
  ) {
    throw new Error('Unexpected KODA content identity.');
  }
  const startsAt = seoulTimestamp(detail.partyStartDateTime);
  let endsAt;
  if (detail.partyEndDateTime) {
    endsAt = seoulTimestamp(detail.partyEndDateTime);
  } else {
    if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(detail.partyEndTime || '')) {
      throw new Error('Missing event end time.');
    }
    endsAt = seoulTimestamp(
      `${detail.partyStartDateTime.slice(0, 10)}T${detail.partyEndTime}`,
    );
    if (Date.parse(endsAt) <= Date.parse(startsAt)) {
      endsAt = new Date(Date.parse(endsAt) + 86400000).toISOString();
    }
  }
  const images = [...(detail.partyImages || [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
  const cover = images.find(image => image.isThumbnail) || images[0];
  const announcements = (detail.partyAnnouncements || [])
    .map(item => (typeof item === 'string' ? item : item.announcement))
    .filter(text => typeof text === 'string' && text.trim());
  const amount = detail.amount;
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid event price.');
  }
  return {
    id: `party-${detail.partyId}`,
    bookingPartyId: detail.partyId,
    reviewSeriesId: `template-${binding.templateId}`,
    title: detail.partyTitle,
    organizer: detail.organizerName,
    startsAt,
    endsAt,
    cover: cover ? {url: cover.imageUrl, alt: detail.partyTitle} : null,
    location: {name: detail.location, address: detail.meetingPlace},
    pricing: {amount, currency: 'KRW'},
    about: [...announcements, detail.extraInfo].filter(Boolean),
    introduction: (detail.events || []).map(item => ({
      title: item.eventName,
      description: item.eventDescription,
      images: (item.partyEventImageUrls || []).map(src => ({
        src,
        type: 'image',
      })),
    })),
    program: {description: detail.partySchedule},
    detailImages: images
      .filter(image => image !== cover)
      .map(image => ({src: image.imageUrl, type: 'image'})),
    booking: {
      isVisible: listing.isVisible === true && detail.isVisible !== false,
      isApplyOpen: detail.isApplyOpen === true,
      partyStatus: detail.partyStatus,
      attendance: detail.numOfAttendance,
      capacity: detail.maxAttendance,
      // The existing reservation screen fetches its own authenticated quote.
      // These values are only its initial display context, never a payment.
      params: {
        partyId: detail.partyId,
        partyTitle: detail.partyTitle,
        partyStartDateTime: detail.partyStartDateTime,
        partyStartTime: detail.partyStartTime,
        partyEndTime: detail.partyEndTime,
        applicationType: detail.applicationType,
        scheduleType: detail.scheduleType,
        amount,
        thumbnailUrl: cover?.imageUrl,
        partyAnnouncements: announcements.map(announcement => ({announcement})),
      },
    },
  };
}

export function bookingState(event, now = Date.now()) {
  if (now >= Date.parse(event.endsAt)) {
    return 'past';
  }
  if (!event.bookingPartyId || !event.booking) {
    return 'preparing';
  }
  const booking = event.booking;
  const full =
    Number.isFinite(booking.capacity) &&
    booking.capacity > 0 &&
    Number.isFinite(booking.attendance) &&
    booking.attendance >= booking.capacity;
  return booking.isVisible &&
    booking.isApplyOpen &&
    booking.partyStatus === 'RECRUIT' &&
    now < Date.parse(event.startsAt) &&
    !full
    ? 'open'
    : 'closed';
}

export function bookingLabel(event, language, now = Date.now()) {
  const labels = {
    past: ['지난 모임', 'Past meetup'],
    preparing: ['신청 준비 중', 'Coming soon'],
    open: ['신청 가능', 'Registration open'],
    closed: ['신청 마감', 'Registration closed'],
  };
  const state = bookingState(event, now);
  return labels[
    state === 'open' && !event.bookingEnabled ? 'preparing' : state
  ][language === 'en' ? 1 : 0];
}

// Current business rule: all Ddakji-hosted content belongs to this club.
// Add an API-provided program/brand discriminator here before other programs launch.
export function isClubContent(record) {
  return record?.organizerType === 'PLATFORM';
}

export function partyIdFromEventId(eventId) {
  if (typeof eventId !== 'string' || !/^party-[1-9]\d*$/.test(eventId))
    return null;
  const id = Number(eventId.slice(6));
  return Number.isSafeInteger(id) ? id : null;
}

// The current search contract has no verified organizer filter. Read every page
// and filter explicitly; never match titles or pick the first available meetup.
export async function readPlatformListings(api) {
  const visible = new Map();
  for (let page = 0; ; page += 1) {
    if (page >= 100) throw new Error('Content pagination limit exceeded.');
    const {data} = await api.searchParties({page, size: 100});
    if (!Array.isArray(data?.content) || typeof data.last !== 'boolean')
      throw new Error('Invalid content collection.');
    for (const item of data.content) {
      if (item.isVisible !== true || !isClubContent(item)) continue;
      if (!Number.isSafeInteger(item.partyId) || item.partyId <= 0)
        throw new Error('Invalid party identity.');
      visible.set(item.partyId, item);
    }
    if (data.last) return [...visible.values()];
  }
}

export async function readPlatformEvent(api, listing) {
  let data;
  try {
    ({data} = await api.getPartyDetail(listing.partyId));
  } catch (error) {
    // It may have been removed between the search and detail requests.
    if ([404, 410].includes(error?.response?.status)) return null;
    throw error;
  }
  if (data?.partyId !== listing.partyId)
    throw new Error('Unexpected party identity.');
  if (!isClubContent(data) || data.isVisible === false) return null;
  const templateId = data.reviewSummary?.templateId;
  if (!Number.isSafeInteger(templateId) || templateId <= 0)
    throw new Error('Invalid template identity.');
  return adaptLiveEvent(data, listing, {partyId: listing.partyId, templateId});
}

// Bound detail requests while the list response lacks isApplyOpen/templateId.
export async function mapContent(items, read) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({length: Math.min(4, items.length)}, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await read(items[index]);
      }
    }),
  );
  return results;
}
