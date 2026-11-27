import assert from 'node:assert/strict';
import test from 'node:test';
import {
  optionPrice,
  publicSale,
  tripRoute,
  scheduleDayIndex,
  trips,
} from '../model.js';

test('travel routes do not capture the shared app, KODA or similarly named paths', () => {
  for (const path of [
    '/',
    '/contents/3861',
    '/koda/',
    '/trips-other',
    '/trip',
    '/download',
  ])
    assert.equal(tripRoute(path), null);
  assert.deepEqual(tripRoute('/trips/'), {page: 'index'});
  assert.deepEqual(tripRoute('/trips/programs/'), {page: 'programs'});
  assert.deepEqual(tripRoute('/trips/programs'), {page: 'programs'});
  assert.equal(tripRoute('/trips/explore/').page, 'not-found');
  assert.equal(tripRoute('/trips/explore').page, 'not-found');
  assert.equal(tripRoute('/trips/explore/extra').page, 'not-found');
  assert.equal(tripRoute('/trips/programs/extra').page, 'not-found');
  assert.equal(tripRoute('/trips/reground-jeju').trip.partyId, 3861);
  assert.equal(tripRoute('/trips/reground-jeju/').page, 'detail');
  assert.equal(tripRoute('/trips/unknown/').page, 'not-found');
  assert.equal(tripRoute('/trips/reground-jeju/extra').page, 'not-found');
});

test('program links select the requested final schedule and invalid days fall back safely', () => {
  const [thuSat, friSun] = trips[0].scheduleOptions;
  assert.equal(
    thuSat.days[scheduleDayIndex(thuSat.days, '?day=02')].isoDate,
    '2026-12-04',
  );
  assert.equal(
    friSun.days[scheduleDayIndex(friSun.days, '?day=03')].isoDate,
    '2026-12-06',
  );
  for (const option of [thuSat, friSun]) {
    for (const search of ['', '?day=99', '?day=-1', '?day=NaN']) {
      assert.equal(scheduleDayIndex(option.days, search), 0);
    }
    assert.deepEqual(
      option.days.map(day => new Date(`${day.isoDate}T00:00:00Z`).getUTCDay()),
      option === thuSat ? [4, 5, 6] : [5, 6, 0]
    );
  }
});

test('each trip date option resolves its own live price', () => {
  const trip = trips[0];
  const sale = publicSale(
    {
      partyId: trip.partyId,
      priceOptions: [
        {id: 3861, optionName: '목·금·토', amount: 179000},
        {id: 4617, optionName: '금·토·일', amount: 189000},
      ],
    },
    trip.partyId,
  );
  assert.equal(trip.priceOptions.length, 2);
  assert.equal(
    optionPrice(sale, trip.priceOptions[0].id, trip.priceOptions[0].amount),
    179000,
  );
  assert.equal(
    optionPrice(sale, trip.priceOptions[1].id, trip.priceOptions[1].amount),
    189000,
  );
});

test('public listing prices are scoped to the requested program and strip user information', () => {
  const input = {
    partyId: 3861,
    isApplyOpen: false,
    profileSummary: {ownerUserId: 123},
    numOfAttendance: 8,
    priceOptions: [
      {id: 1754, amount: 169000, optionName: '참가비'},
      {id: 2, amount: -10},
      {id: 3, amount: '119000'},
    ],
  };
  assert.equal(publicSale(input, 4133), null);
  assert.equal(publicSale({partyId: 3861}, 3861), null);
  assert.deepEqual(publicSale(input, 3861), {
    isApplyOpen: false,
    options: [{id: 1754, amount: 169000, name: '참가비'}],
  });
});

test('live price replaces editorial price, and removed options never advertise stale prices', () => {
  const sale = publicSale(
    {
      partyId: 3861,
      isApplyOpen: true,
      priceOptions: [{id: 1754, amount: 179000}],
    },
    3861,
  );
  assert.equal(optionPrice(sale, 1754, 159000), 179000);
  assert.equal(optionPrice(sale, 1755, 119000), null);
  assert.equal(optionPrice(null, 1754, 159000), 159000);
  assert.equal(
    optionPrice({options: [{id: 1754, amount: 0}]}, 1754, 159000),
    0,
  );
});

 test('single-option trips follow recreated live IDs without confusing class options', () => {
  const sale = publicSale({partyId: 3861, priceOptions: [{id: 1846, amount: 159000}]}, 3861);
  assert.equal(optionPrice(sale, 1830, 179000, true), 159000);
  assert.equal(optionPrice(sale, 1830, 179000), null);
  assert.equal(optionPrice({options: [{id: 2000, amount: 179000}]}, 1846, 159000, true), 179000);
  assert.equal(optionPrice({options: []}, 1846, 159000, true), null);
  assert.equal(optionPrice({options: [{id: 1, amount: 70000}, {id: 2, amount: 80000}]}, 1846, 159000, true), null);
});
