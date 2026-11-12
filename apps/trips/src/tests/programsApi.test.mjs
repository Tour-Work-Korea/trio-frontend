import assert from 'node:assert/strict';
import test from 'node:test';
import {
  eventCards,
  eventCategory,
  fetchDateEvents,
  publicDateEvent,
} from '../programsApi.js';
import {trips} from '../model.js';
import {tripsPublicApiMiddleware} from '../hosting/publicApiProxy.js';

const row = (overrides = {}) => ({
  partyId: 3861,
  guesthouseId: 97,
  partyTitle: '슬로우 도파민 트립',
  scheduleType: 'DATE_EVENT',
  contentType: 'PROGRAM',
  eventDate: '2026-12-03',
  partyStartTime: '19:00:00',
  partyEndTime: '22:00:00',
  amount: 159000,
  partyImageUrl: 'https://cdn.ddakji.kr/uploads/trip.jpg',
  isVisible: true,
  partyStatus: 'RECRUIT',
  profileSummary: {ownerUserId: 123},
  numOfAttendance: 5,
  ...overrides,
});
const response = (content, last = true) => ({
  ok: true,
  json: async () => ({content, last}),
});

test('only the selected guesthouse’s visible date events enter public state', () => {
  const event = publicDateEvent(row(), 97);
  assert.equal(event.partyId, 3861);
  assert.equal(event.amount, 159000);
  assert.equal('profileSummary' in event, false);
  assert.equal('numOfAttendance' in event, false);
  for (const overrides of [
    {guesthouseId: 98},
    {scheduleType: 'DAILY'},
    {isVisible: false},
    {partyId: -1},
    {partyTitle: ''},
    {eventDate: '2026-02-30'},
  ]) {
    assert.equal(publicDateEvent(row(overrides), 97), null);
  }
  assert.equal(
    publicDateEvent(row({partyImageUrl: 'javascript:alert(1)'}), 97).image,
    null,
  );
  assert.equal(publicDateEvent(row({amount: null}), 97).amount, null);
});

test('all pages are read, duplicates are removed, new registered events appear without a hardcoded ID list', async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const events = await fetchDateEvents({
    signal,
    fetchImpl: async (url, options) => {
      calls.push({url, options});
      return calls.length === 1
        ? response([row(), row({guesthouseId: 99})], false)
        : response([
            row(),
            row({
              partyId: 9001,
              partyTitle: '새로운 클래스',
              eventDate: '2026-12-04',
            }),
          ]);
    },
  });
  assert.deepEqual(
    events.map(event => event.partyId),
    [3861, 9001],
  );
  assert.equal(new URL(calls[1].url).searchParams.get('page'), '1');
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.signal, signal);
});

test('empty results stay empty; HTTP errors, bad pages and aborts do not become empty success', async () => {
  assert.deepEqual(
    await fetchDateEvents({fetchImpl: async () => response([])}),
    [],
  );
  await assert.rejects(
    fetchDateEvents({fetchImpl: async () => ({ok: false, status: 503})}),
    /503/,
  );
  await assert.rejects(
    fetchDateEvents({
      fetchImpl: async () => ({ok: true, json: async () => ({})}),
    }),
    /Invalid/,
  );
  await assert.rejects(
    fetchDateEvents({fetchImpl: async () => response([], false)}),
    /Incomplete/,
  );
  await assert.rejects(
    fetchDateEvents({
      fetchImpl: async () => {
        throw new DOMException('Aborted', 'AbortError');
      },
    }),
    {name: 'AbortError'},
  );
});

test('category overrides distinguish the three existing PROGRAM events; new title/type rules are explicit', () => {
  assert.deepEqual(
    [3861, 4133, 4134].map(partyId => eventCategory(row({partyId}))),
    ['trip', 'class', 'class'],
  );
  assert.equal(
    eventCategory(row({partyId: 9000, partyTitle: '도자기 워크숍'})),
    'class',
  );
  assert.equal(
    eventCategory(row({partyId: 9000, partyTitle: 'PRISM 연말파티'})),
    'party',
  );
  assert.equal(
    eventCategory(row({partyId: 9000, partyTitle: '제주 트립'})),
    'trip',
  );
  assert.equal(
    eventCategory(
      row({
        partyId: 9000,
        partyTitle: '함께하는 저녁',
        contentType: 'DINNER_PARTY',
      }),
    ),
    'party',
  );
});

test('cards use current API title/image/price, retain final editorial times, and never synthesize parties', () => {
  const events = [
    row(),
    row({partyId: 4133, eventDate: '2026-12-04', amount: 85000}),
    row({partyId: 4134, eventDate: '2026-12-05', amount: 75000}),
  ].map(item => publicDateEvent(item, 97));
  const cards = eventCards(events, trips);
  assert.deepEqual(
    ['trip', 'class', 'party'].map(
      category => cards.filter(item => item.category === category).length,
    ),
    [1, 2, 0],
  );
  assert.equal(cards[1].price, '85,000원');
  assert.equal(cards[1].title, events[1].partyTitle);
  assert.equal(cards[1].image, events[1].image);
  assert.equal(cards[1].time, '13:00 / 15:00');
  assert.equal(cards[2].time, '상세 시간 추후 안내');
  assert.equal(cards[2].href, '/trips/reground-jeju/#class-4134');
  assert.deepEqual(eventCards([], trips), []);
  const newParty = publicDateEvent(
    row({partyId: 9999, partyTitle: '새 파티', amount: 0}),
    97,
  );
  const [card] = eventCards([newParty], trips);
  assert.equal(card.href, 'https://ddakji.kr/contents/9999');
  assert.equal(card.price, '무료');
});

test('local preview API accepts only public GET routes and never forwards user credentials', async () => {
  const calls = [];
  const middleware = tripsPublicApiMiddleware(async (url, options) => {
    calls.push({url, options});
    return {status: 200, text: async () => '{}'};
  });
  function res() {
    return {
      statusCode: 200,
      setHeader() {},
      end(value) {
        this.body = value;
      },
    };
  }
  const allowed = res();
  await middleware(
    {
      url: '/trips-public-api/user/parties/search?page=1&size=50&target=evil',
      method: 'GET',
      headers: {cookie: 'private', authorization: 'private'},
    },
    allowed,
    () => {},
  );
  assert.equal(allowed.statusCode, 200);
  assert.equal(
    calls[0].url,
    'https://api.ddakji.kr/api/v1/user/parties/search?page=1&size=50&sortBy=RECOMMEND',
  );
  assert.deepEqual(calls[0].options.headers, {'Accept-Language': 'ko'});
  for (const [url, method, status] of [
    ['/trips-public-api/user/parties/3861', 'POST', 405],
    ['/trips-public-api/order/reservation', 'GET', 404],
    ['/trips-public-api/user/parties/search?size=99', 'GET', 400],
  ]) {
    const result = res();
    await middleware({url, method}, result, () => {});
    assert.equal(result.statusCode, status);
  }
  assert.equal(calls.length, 1);
  let nextCalled = false;
  await middleware({url: '/koda/', method: 'GET'}, res(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});
