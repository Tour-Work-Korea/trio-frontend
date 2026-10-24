import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKING_RETURN_KEY, startBookingReturnBridge} from '../auth/bookingReturn.js';

function journey(pathname, search = '', saved = new Map(), now = 1000) {
  let tick;
  let result;
  let stopped = false;
  const location = {
    pathname,
    search,
    replace: url => {
      result = url;
    },
  };
  startBookingReturnBridge({
    location,
    now: () => now,
    storage: {
      getItem: key => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: key => saved.delete(key),
    },
    events: {addEventListener() {}, removeEventListener() {}},
    schedule: fn => {
      tick = fn;
      return 1;
    },
    unschedule: () => {
      stopped = true;
    },
  });
  return {
    location,
    saved,
    tick: () => tick?.(),
    result: () => result,
    active: () => !!tick && !stopped,
  };
}
const query = '?kodaBooking=%2Fkoda%2Fmy%2F%3Flang%3Den';

test('shared payment success returns only opted-in KODA visitors to their server-backed history', () => {
  const flow = journey('/contents-reservation', query);
  flow.location.pathname = '/contents-payment';
  flow.tick();
  assert.equal(flow.result(), undefined);
  assert.equal(flow.active(), true);
  flow.location.pathname = '/contents-payment/success';
  flow.tick();
  assert.equal(flow.result(), '/koda/my/?lang=en');
  assert.equal(flow.active(), false);
  assert.equal(flow.saved.size, 0);
  assert.equal(journey('/contents-payment/success').result(), undefined);
});

test('payment reload preserves return but cancellation or unrelated navigation clears it', () => {
  const flow = journey('/contents-reservation', query);
  const reload = journey('/contents-payment', '', flow.saved);
  assert.equal(reload.active(), true);
  reload.location.pathname = '/koda/event/';
  reload.tick();
  assert.equal(reload.active(), false);
  assert.equal(reload.saved.size, 0);
  assert.equal(reload.result(), undefined);
});

test('forged destinations, unrelated entry, expired and future sessions cannot redirect', () => {
  for (const value of [
    'https://evil.example',
    '//evil.example',
    '/my',
    '/koda/event/?id=party-1588',
  ]) {
    assert.equal(
      journey(
        '/contents-reservation',
        `?kodaBooking=${encodeURIComponent(value)}`,
      ).active(),
      false,
    );
  }
  assert.equal(journey('/contents-payment', query).active(), false);
  for (const createdAt of [null, 9999999999, 0]) {
    const saved = new Map([
      [
        BOOKING_RETURN_KEY,
        JSON.stringify({target: '/koda/my/', createdAt}),
      ],
    ]);
    assert.equal(
      journey('/contents-payment/success', '', saved, 3600001).result(),
      undefined,
    );
    assert.equal(saved.size, 0);
  }
});
