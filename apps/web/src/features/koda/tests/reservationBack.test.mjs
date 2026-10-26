import test from 'node:test';
import assert from 'node:assert/strict';
import {reservationBackTarget} from '../auth/reservationBack.js';

const kodaBack = '/koda/event/?id=halloween&lang=en';

test('no-guide reservations return immediately without an invisible extra step', () => {
  for (const partyAnnouncements of [undefined, [], ['', null, {}]]) {
    assert.equal(
      reservationBackTarget({kodaBack, partyAnnouncements}, true),
      kodaBack,
    );
  }
});

test('guide reservations preserve details-to-guide back before returning to KODA', () => {
  for (const partyAnnouncements of [['Welcome'], [{announcement: 'Welcome'}]]) {
    const params = {kodaBack, partyAnnouncements};
    assert.equal(reservationBackTarget(params, true), null);
    assert.equal(reservationBackTarget(params, false), kodaBack);
    assert.equal(
      reservationBackTarget(JSON.parse(JSON.stringify(params)), false),
      kodaBack,
    );
  }
});

test('ordinary reservations and external return URLs keep the original back handler', () => {
  for (const kodaBack of [
    undefined,
    'https://evil.example',
    '//evil.example',
    '/contents-payment',
  ]) {
    assert.equal(reservationBackTarget({kodaBack}, false), null);
  }
  assert.equal(reservationBackTarget(undefined, false), null);
});
