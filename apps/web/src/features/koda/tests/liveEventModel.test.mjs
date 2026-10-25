import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptLiveEvent,
  bookingState,
  bookingLabel,
  automaticBookingConfig,
  readPlatformListings,
  partyIdFromEventId,
} from '../services/liveEventModel.js';
import {toEventViewModel} from '../services/eventModel.js';
import {reservationHref} from '../auth/bookingReturn.js';

test('unconnected editorial content never advertises live registration', () => {
  const event = {
    startsAt: '2026-10-31T17:00:00+09:00',
    endsAt: '2026-10-31T20:00:00+09:00',
    bookingEnabled: true,
  };
  const now = Date.parse('2026-10-23T12:00:00+09:00');
  assert.equal(bookingLabel(event, 'ko', now), '신청 준비 중');
  assert.equal(bookingLabel(event, 'en', now), 'Coming soon');
  assert.equal(
    bookingLabel({...event, bookingEnabled: false}, 'ko', now),
    '신청 준비 중',
  );
  assert.equal(
    bookingLabel(event, 'ko', Date.parse('2026-11-01T00:00:00+09:00')),
    '지난 모임',
  );
});

const binding = {eventId: 'halloween', partyId: 1588, templateId: 29};
const listing = {partyId: 1588, isVisible: true};
const detail = {
  partyId: 1588,
  partyTitle: '게딱지 테스트',
  reviewSummary: {templateId: 29},
  organizerType: 'PLATFORM',
  organizerName: '게딱지',
  partyStartDateTime: '2026-10-31T19:00:00',
  partyStartTime: '19:00:00',
  partyEndTime: '21:00:00',
  amount: 29959,
  partyImages: [
    {id: 2, imageUrl: 'https://cdn.example.com/2.png', displayOrder: 1},
    {
      id: 1,
      imageUrl: 'https://cdn.example.com/1.png',
      isThumbnail: true,
      displayOrder: 0,
    },
  ],
  partyAnnouncements: [{announcement: '테스트'}],
  partySchedule: '테스트',
  location: '테스트',
  isApplyOpen: true,
  partyStatus: 'RECRUIT',
  numOfAttendance: 0,
  maxAttendance: 20,
  scheduleType: 'DATE_EVENT',
  applicationType: 'ADVANCE',
};
const now = Date.parse('2026-10-23T12:00:00+09:00');
const event = (overrides = {}, summary = listing) =>
  toEventViewModel(adaptLiveEvent({...detail, ...overrides}, summary, binding));

test('automatic booking is enabled only for the dev API, without a hardcoded server ID', () => {
  assert.deepEqual(
    automaticBookingConfig('development', 'https://dev.ddakji.kr/api/v1'),
    {enabled: true},
  );
  for (const mode of ['production', 'test', 'staging'])
    assert.deepEqual(
      automaticBookingConfig(mode, 'https://dev.ddakji.kr/api/v1'),
      null,
    );
  assert.deepEqual(
    automaticBookingConfig('development', 'https://api.ddakji.kr/api/v1'),
    null,
  );
  assert.deepEqual(automaticBookingConfig('development', ''), null);
});

test('server data supplies identity, KST dates, original photos and price', () => {
  const value = event();
  assert.equal(value.bookingPartyId, 1588);
  assert.equal(value.reviewSeriesId, 'template-29');
  assert.equal(value.startsAt, '2026-10-31T19:00:00+09:00');
  assert.equal(value.endsAt, '2026-10-31T21:00:00+09:00');
  assert.equal(value.price.ko, '29,959원');
  assert.equal(value.poster, 'https://cdn.example.com/1.png');
  assert.equal(value.detailImages[0].src, 'https://cdn.example.com/2.png');
  assert.deepEqual(value.gallery, []);
  assert.equal(value.detailImages[0].caption.ko, '');
  assert.equal(value.about[0].ko, '테스트');
  assert.equal(value.title.en, '게딱지 테스트');
  const overnight = event({partyEndTime: '01:00:00'});
  assert.equal(
    Date.parse(overnight.endsAt) - Date.parse(overnight.startsAt),
    6 * 3600000,
  );
});

test('content identity mismatches fail rather than book another program or template', () => {
  for (const fields of [
    {partyId: 29},
    {reviewSummary: {templateId: 30}},
    {organizerType: 'HOST'},
  ])
    assert.throws(() => event(fields), /identity/);
  assert.throws(() => event({amount: -1}), /price/);
  assert.throws(() => event({partyStartDateTime: null}), /timestamp/);
});

test('closed, full, hidden, ended and unconnected events cannot open reservations', () => {
  assert.equal(bookingState(event(), now), 'open');
  for (const fields of [
    {isApplyOpen: false},
    {isApplyOpen: undefined},
    {partyStatus: 'ENDED'},
    {numOfAttendance: 20},
    {isVisible: false},
  ]) {
    assert.equal(bookingState(event(fields), now), 'closed');
    assert.throws(() => reservationHref(event(fields), 'ko', now));
  }
  assert.equal(
    bookingState(event({}, {...listing, isVisible: false}), now),
    'closed',
  );
  assert.equal(
    bookingState(event(), Date.parse('2026-10-31T19:00:00+09:00')),
    'closed',
  );
  assert.equal(
    bookingState(event(), Date.parse('2026-10-31T21:00:00+09:00')),
    'past',
  );
  assert.equal(
    bookingState({...event(), bookingPartyId: null}, now),
    'preparing',
  );
});

test('reservation entry uses actual party ID, leaves price quoting to the shared form', () => {
  const url = new URL(
    reservationHref(
      event(),
      'en',
      now,
      '/koda/event/?id=halloween&lang=en',
    ),
    'https://local.example',
  );
  assert.equal(url.pathname, '/contents-reservation');
  const params = JSON.parse(url.searchParams.get('params'));
  assert.equal(params.partyId, 1588);
  assert.equal(params.amount, 29959);
  assert.equal(params.scheduleType, 'DATE_EVENT');
  assert.equal(params.selectedPriceOptionId, undefined);
  assert.equal(
    params.kodaBack,
    '/koda/event/?id=halloween&lang=en',
  );
  assert.equal(
    url.searchParams.get('kodaBooking'),
    '/koda/my/?lang=en',
  );
  assert.throws(() =>
    reservationHref({...event(), bookingPartyId: 999}, 'ko', now),
  );
});

test('public listings follow all pages, deduplicate and exclude hidden/host content', async () => {
  const item = (partyId, extra = {}) => ({
    partyId,
    isVisible: true,
    organizerType: 'PLATFORM',
    ...extra,
  });
  const pages = [
    [
      item(1, {organizerType: 'GUESTHOUSE'}),
      item(2, {isVisible: false}),
      item(3),
    ],
    [item(3), item(4)],
  ];
  const calls = [];
  const result = await readPlatformListings({
    searchParties: async ({page}) => {
      calls.push(page);
      return {data: {content: pages[page], last: page === 1}};
    },
  });
  assert.deepEqual(calls, [0, 1]);
  assert.deepEqual(
    result.map(x => x.partyId),
    [3, 4],
  );
  await assert.rejects(
    readPlatformListings({searchParties: async () => ({data: {}})}),
    /collection/,
  );
  await assert.rejects(
    readPlatformListings({
      searchParties: async () => ({data: {content: [item(-1)], last: true}}),
    }),
    /identity/,
  );
});

test('dynamic event URLs only accept positive safe integer party IDs', () => {
  assert.equal(partyIdFromEventId('party-123'), 123);
  for (const id of [
    'halloween',
    'party-0',
    'party--1',
    'party-01',
    'party-1.5',
    'party-1e3',
    'party-9007199254740992',
    null,
  ])
    assert.equal(partyIdFromEventId(id), null);
});

test('admin content introduction uses events photos/title/body independently of program and cover images', () => {
  const value = event({
    events: [
      {
        id: 107,
        eventName: '콘텐츠 소개 제목',
        eventDescription: '첫 문단\n\n다음 문단',
        partyEventImageUrls: [
          'https://cdn.example.com/venue1.JPG',
          'https://cdn.example.com/venue2.JPG',
        ],
      },
    ],
  });
  assert.equal(value.introduction.length, 1);
  assert.equal(value.introduction[0].title.ko, '콘텐츠 소개 제목');
  assert.equal(value.introduction[0].description.en, '첫 문단\n\n다음 문단');
  assert.deepEqual(
    value.introduction[0].images.map(image => image.src),
    [
      'https://cdn.example.com/venue1.JPG',
      'https://cdn.example.com/venue2.JPG',
    ],
  );
  assert.equal(value.detailImages.length, 1);
  assert.deepEqual(event().introduction, []);
  assert.throws(
    () => event({events: [{partyEventImageUrls: ['javascript:alert(1)']}]}),
    /URL/,
  );
});
