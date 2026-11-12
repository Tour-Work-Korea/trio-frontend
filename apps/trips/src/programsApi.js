import {formatPrice} from './model.js';

export const REGROUND_GUESTHOUSE_ID = 97;
export const TRIPS_API_BASE = import.meta.env?.DEV
  ? '/trips-public-api'
  : 'https://api.ddakji.kr/api/v1';
const PAGE_SIZE = 50;
const categoryOverrides = {3861: 'trip', 4133: 'class', 4134: 'class'};
const categoryLabels = {trip: 'TRIP', class: 'CLASS', party: 'PARTY'};

export function eventCategory(event) {
  if (categoryOverrides[event.partyId]) return categoryOverrides[event.partyId];
  // The current API puts both trips and classes under PROGRAM.
  // Keep explicit IDs authoritative; use title/type rules for newly registered events.
  const title = event.partyTitle;
  if (/클래스|워크[숍샵]|원데이|\bclass\b|workshop/i.test(title))
    return 'class';
  if (/파티|나잇|프리즘|\bparty\b|\bnight\b|\bprism\b/i.test(title))
    return 'party';
  if (/트립|여행|\btrip\b|retreat/i.test(title)) return 'trip';
  return event.contentType === 'PROGRAM' ? 'trip' : 'party';
}

function eventDate(value) {
  if (typeof value !== 'string') return null;
  const iso = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === iso
    ? iso
    : null;
}

function publicImage(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'cdn.ddakji.kr'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function clockTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d/.test(value)
    ? value.slice(0, 5)
    : '';
}

// Whitelist public display fields. Never put profiles or participant data in state/cache.
export function publicDateEvent(row, guesthouseId) {
  if (
    !row ||
    row.guesthouseId !== guesthouseId ||
    row.scheduleType !== 'DATE_EVENT' ||
    row.isVisible === false ||
    !Number.isSafeInteger(row.partyId) ||
    row.partyId <= 0 ||
    typeof row.partyTitle !== 'string' ||
    !row.partyTitle.trim()
  )
    return null;
  const date = eventDate(row.eventDate) ?? eventDate(row.partyStartDateTime);
  if (!date) return null;
  return {
    partyId: row.partyId,
    guesthouseId,
    partyTitle: row.partyTitle.trim(),
    contentType: typeof row.contentType === 'string' ? row.contentType : '',
    date,
    startTime: clockTime(row.partyStartTime),
    endTime: clockTime(row.partyEndTime),
    image: publicImage(row.partyImageUrl),
    amount: Number.isFinite(row.amount) && row.amount >= 0 ? row.amount : null,
    partyStatus: typeof row.partyStatus === 'string' ? row.partyStatus : '',
    isApplyOpen: typeof row.isApplyOpen === 'boolean' ? row.isApplyOpen : null,
  };
}

export async function fetchDateEvents({
  guesthouseId = REGROUND_GUESTHOUSE_ID,
  signal,
  fetchImpl = fetch,
} = {}) {
  const byId = new Map();
  for (let page = 0; page < 100; page += 1) {
    const params = new URLSearchParams({
      sortBy: 'RECOMMEND',
      page: String(page),
      size: String(PAGE_SIZE),
    });
    const response = await fetchImpl(
      `${TRIPS_API_BASE}/user/parties/search?${params}`,
      {
        signal,
        credentials: 'omit',
        headers: {'Accept-Language': 'ko'},
      },
    );
    if (!response.ok)
      throw new Error(`Program list request failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data?.content) || typeof data.last !== 'boolean')
      throw new Error('Invalid program list response');
    for (const row of data.content) {
      const event = publicDateEvent(row, guesthouseId);
      if (event) byId.set(event.partyId, event);
    }
    if (data.last)
      return [...byId.values()].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(b.startTime) ||
          a.partyId - b.partyId,
      );
    if (!data.content.length) throw new Error('Incomplete program pagination');
  }
  throw new Error('Program pagination limit exceeded');
}

export function eventCards(events, programs) {
  return events.map(event => {
    const trip = programs.find(item => item.partyId === event.partyId);
    const classTrip = programs.find(item =>
      item.classes.some(item => item.partyId === event.partyId),
    );
    const classInfo = classTrip?.classes.find(
      item => item.partyId === event.partyId,
    );
    const category = eventCategory(event);
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][
      new Date(`${event.date}T00:00:00Z`).getUTCDay()
    ];
    const date = `${event.date.slice(5).replace('-', '.')} ${weekday}요일`;
    const sameTripDate = trip?.startDate.slice(0, 10) === event.date;
    const sameClassDate = classTrip?.days.some(
      day =>
        day.isoDate === event.date &&
        day.events.some(item => item.classId === event.partyId),
    );
    const closed =
      event.isApplyOpen === false ||
      ['CLOSED', 'FULL', 'PARTY_END', 'CANCELLED', 'CANCELED'].includes(
        event.partyStatus,
      );
    return {
      id: event.partyId,
      category,
      eyebrow: categoryLabels[category],
      title: event.partyTitle,
      caption: trip?.collaboration ?? classInfo?.title ?? '리그라운드 제주',
      image: event.image,
      alt: event.partyTitle,
      contain: category === 'trip' || classInfo?.imageFit === 'contain',
      date: sameTripDate ? `${trip.year}. ${trip.datesShort}` : date,
      // Keep the user-confirmed text schedule where API time fields conflict.
      time: sameClassDate
        ? classInfo.time
        : trip
        ? trip.stay.name
        : event.startTime
        ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ''}`
        : '상세 시간은 신청 페이지에서 확인',
      href: trip
        ? `/trips/${trip.slug}/`
        : classInfo
        ? `/trips/${classTrip.slug}/#class-${event.partyId}`
        : `https://ddakji.kr/contents/${event.partyId}`,
      price: event.amount === 0 ? '무료' : formatPrice(event.amount),
      note: closed
        ? '모집 상태는 상세 안내에서 확인해주세요.'
        : '옵션별 참가비는 상세 안내에서 확인해주세요.',
      status: closed ? '모집 마감' : '',
    };
  });
}
