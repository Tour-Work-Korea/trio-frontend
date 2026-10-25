import test from 'node:test';
import assert from 'node:assert/strict';
import {createBookingEventRepository} from '../services/bookingEventRepository.js';
import {eventRepository as editorial} from '../services/eventRepository.js';
import {eventCatalog} from '../data/events.js';
import {automaticBookingConfig} from '../services/liveEventModel.js';
import {reservationHref} from '../auth/bookingReturn.js';
import {selectClubReservations} from '../services/clubAccountModel.js';

const config = automaticBookingConfig(
  'development',
  'https://dev.ddakji.kr/api/v1',
);
const now = () => Date.parse('2026-10-23T00:00:00+09:00');
const offline = {
  searchParties: async () => {
    throw Error('offline');
  },
};
function createApi() {
  let currentIds = [9001, 9002];
  const calls = [];
  return {
    calls,
    replace: (...ids) => {
      currentIds = ids;
    },
    searchParties: async () => {
      calls.push('list');
      return {
        data: {
          content: currentIds.map(partyId => ({
            partyId,
            isVisible: true,
            organizerType: 'PLATFORM',
          })),
          last: true,
        },
      };
    },
    getPartyDetail: async id => {
      calls.push(id);
      return {
        data: {
          partyId: id,
          reviewSummary: {templateId: id + 100},
          organizerType: 'PLATFORM',
          partyTitle: `Admin meetup ${id}`,
          partyStartDateTime: '2026-10-31T19:00:00',
          partyStartTime: '19:00:00',
          partyEndTime: '21:00:00',
          amount: id,
          partyStatus: 'RECRUIT',
          isApplyOpen: true,
          scheduleType: 'DATE_EVENT',
        },
      };
    },
  };
}

test('multiple admin meetups supply list/calendar data while editorial URLs and photos remain intact', async () => {
  const api = createApi();
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    api,
    now,
  );
  const result = await repository.listEvents();
  assert.deepEqual(
    result.events.map(e => e.id),
    ['party-9001', 'party-9002', 'itaewon', 'regular'],
  );
  assert.ok(
    result.events.filter(e => e.bookingPartyId).every(e => e.bookingEnabled),
  );
  assert.equal(result.events[1].title.ko, 'Admin meetup 9002');
  const original = await editorial.listEvents();
  assert.deepEqual(result.gallery, original.gallery);
  assert.deepEqual(result.reviews, original.reviews);
  assert.deepEqual(
    await repository.getEventDetails('halloween'),
    await editorial.getEventDetails('halloween'),
  );
  assert.equal(await repository.getBookingTarget('halloween'), null);
  const detail = await repository.getEventDetails('party-9002');
  assert.equal(detail.event.bookingPartyId, 9002);
  assert.equal(detail.event.reviewSeriesId, 'template-9102');
  assert.equal(detail.reviewsFromOtherMeetups, true);
});

test('application keeps the selected ID and fresh server price; replacement never redirects to another meetup', async () => {
  const api = createApi();
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    api,
    now,
  );
  const target = await repository.getBookingTarget('party-9002');
  const params = JSON.parse(
    new URL(
      reservationHref(target, 'ko', now()),
      'https://example.test',
    ).searchParams.get('params'),
  );
  assert.equal(params.partyId, 9002);
  assert.equal(params.amount, 9002);
  assert.deepEqual(api.calls, ['list', 9002]);
  api.replace(9876);
  assert.equal(await repository.getBookingTarget('party-9002'), null);
  assert.equal(await repository.getEventDetails('party-9002'), null);
  assert.equal(
    (await repository.getBookingTarget('party-9876')).bookingPartyId,
    9876,
  );
});

test('closed/full/hidden/removed/reclassified meetups cannot enter checkout', async () => {
  for (const change of [
    {isApplyOpen: false},
    {numOfAttendance: 20, maxAttendance: 20},
    {partyStatus: 'ENDED'},
    {isVisible: false},
    {organizerType: 'GUESTHOUSE'},
  ]) {
    const api = createApi();
    const read = api.getPartyDetail;
    api.getPartyDetail = async id => ({
      data: {...(await read(id)).data, ...change},
    });
    const repository = createBookingEventRepository(
      eventCatalog,
      config,
      api,
      now,
    );
    assert.equal(await repository.getBookingTarget('party-9001'), null);
  }
  const api = createApi();
  const read = api.getPartyDetail;
  api.getPartyDetail = async id => {
    if (id === 9001) throw {response: {status: 404}};
    return read(id);
  };
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    api,
    now,
  );
  assert.equal(await repository.getBookingTarget('party-9001'), null);
  assert.deepEqual(
    (await repository.listEvents()).events.map(e => e.id),
    ['party-9002', 'itaewon', 'regular'],
  );
});

test('empty API keeps the explicit archives while failures remain visible', async () => {
  const api = createApi();
  api.replace();
  assert.deepEqual(
    (
      await createBookingEventRepository(
        eventCatalog,
        config,
        api,
        now,
      ).listEvents()
    ).events.map(event => event.id),
    ['itaewon', 'regular'],
  );
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    offline,
    now,
  );
  await assert.rejects(repository.listEvents(), /offline/);
  await assert.rejects(repository.getEventDetails('party-9001'), /offline/);
  await assert.rejects(repository.getBookingTarget('party-9001'), /offline/);
  assert.equal(
    (await repository.getEventDetails('itaewon')).event.id,
    'itaewon',
  );
});

test('reservation history resolves actual booked platform IDs after the published meetup changes', async () => {
  const api = createApi();
  api.replace(9876);
  const readDetail = api.getPartyDetail;
  api.getPartyDetail = async id => {
    const response = await readDetail(id);
    if (id === 123) response.data.organizerType = 'HOST';
    response.data.isVisible = false;
    response.data.partyStatus = 'ENDED';
    return response;
  };
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    api,
    now,
  );
  const {events, unavailablePartyIds} =
    await repository.resolveReservationEvents({
      content: [
        {partyId: 9001},
        {partyId: 9001},
        {partyId: 123},
        {partyId: 9876},
      ],
    });
  assert.deepEqual(api.calls, ['list', 9001, 123, 9876]);
  assert.deepEqual(
    events.map(event => event.bookingPartyId),
    [9001, 9876],
  );
  assert.deepEqual(
    events.map(event => event.id),
    ['party-9001', 'party-9876'],
  );
  assert.ok(events.every(event => !event.detailAvailable));
  assert.deepEqual(unavailablePartyIds, []);
  assert.deepEqual(await repository.resolveReservationEvents([]), {
    events: [],
    unavailablePartyIds: [],
  });
});

test('removed meetups do not hide valid reservations or become guessed KODA matches', async () => {
  const api = createApi();
  const readDetail = api.getPartyDetail;
  api.getPartyDetail = async id => {
    if (id === 11 || id === 12)
      throw {response: {status: id === 11 ? 404 : 410}};
    const response = await readDetail(id);
    if (id === 13) response.data.organizerType = 'HOST';
    return response;
  };
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    api,
    now,
  );
  const records = [11, 9001, 12, 13, 9001].map((partyId, index) => ({
    partyId,
    reservationId: index + 1,
    reservationStatus: 'PENDING',
    approvalStatus: 'WAITING_HOST',
  }));
  const result = await repository.resolveReservationEvents({content: records});
  assert.deepEqual(result.unavailablePartyIds, [11, 12]);
  assert.deepEqual(
    result.events.map(event => event.bookingPartyId),
    [9001],
  );
  assert.deepEqual(
    selectClubReservations(records, result.events).map(
      item => item.reservationId,
    ),
    [2, 5],
  );
  assert.deepEqual(api.calls, ['list', 9001, 13]);
  const missingOnly = await repository.resolveReservationEvents([
    {partyId: 11},
  ]);
  assert.deepEqual(missingOnly, {events: [], unavailablePartyIds: [11]});
});

test('authentication, network and server failures are not treated as deleted meetups', async () => {
  for (const failure of [
    {response: {status: 401}},
    {response: {status: 403}},
    {response: {status: 500}},
    new Error('Network error'),
  ]) {
    const api = createApi();
    const readDetail = api.getPartyDetail;
    api.getPartyDetail = async id => {
      if (id === 11) throw failure;
      return readDetail(id);
    };
    const repository = createBookingEventRepository(
      eventCatalog,
      config,
      api,
      now,
    );
    await assert.rejects(
      repository.resolveReservationEvents([{partyId: 9001}, {partyId: 11}]),
      error => error === failure,
    );
  }
});

test('malformed history and unexpected party identity cannot be classified as KODA reservations', async () => {
  const api = createApi();
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    api,
    now,
  );
  await assert.rejects(repository.resolveReservationEvents({}), /collection/);
  await assert.rejects(
    repository.resolveReservationEvents([{partyId: -1}]),
    /identity/,
  );
  api.getPartyDetail = async () => ({
    data: {partyId: 999, organizerType: 'PLATFORM'},
  });
  await assert.rejects(
    repository.resolveReservationEvents([{partyId: 9001}]),
    /identity/,
  );
});

test('unpublished reservations remain in history without a dead public detail link', async () => {
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    createApi(),
    now,
  );
  const {events} = await repository.resolveReservationEvents([
    {partyId: 9001},
    {partyId: 9876},
  ]);
  assert.deepEqual(
    events.map(e => [e.id, e.detailAvailable]),
    [
      ['party-9001', true],
      ['party-9876', false],
    ],
  );
});

test('production reads its API catalog but retains the existing booking rollout restriction', async () => {
  const repository = createBookingEventRepository(
    eventCatalog,
    null,
    createApi(),
    now,
  );
  assert.equal(repository.bookingEnabled, false);
  assert.ok(
    (await repository.listEvents()).events.every(e => !e.bookingEnabled),
  );
  assert.deepEqual(await repository.resolveReservationEvents(), {
    events: [],
    unavailablePartyIds: [],
  });
  assert.equal(await repository.getBookingTarget('party-9001'), null);
});

test('pre-admin archives retain their own content and reviews without server booking or reservation identity', async () => {
  const repository = createBookingEventRepository(
    eventCatalog,
    config,
    offline,
    now,
  );
  for (const [id, count] of [
    ['itaewon', 6],
    ['regular', 5],
  ]) {
    const detail = await repository.getEventDetails(id);
    assert.deepEqual(detail, await editorial.getEventDetails(id));
    assert.equal(detail.event.bookingEnabled, false);
    assert.equal(detail.event.bookingPartyId, null);
    assert.ok(Date.parse(detail.event.endsAt) < now());
    assert.equal(detail.reviews.length, count);
    assert.equal(detail.reviewsFromOtherMeetups, false);
    assert.equal(await repository.getBookingTarget(id), null);
  }
});
