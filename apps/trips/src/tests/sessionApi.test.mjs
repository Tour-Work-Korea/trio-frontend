import assert from 'node:assert/strict';
import test from 'node:test';
import {checkSession} from '../sessionApi.js';
import {bookingParams} from '../bookingModel.js';
test('only server session establishes login; unauthorized differs from server failure', async () => {
  const response = status => async () => ({
    status,
    ok: status === 200,
    json: async () => ({role: 'USER'}),
  });
  assert.equal(await checkSession({fetchImpl: response(200)}), true);
  for (const s of [401, 403])
    assert.equal(await checkSession({fetchImpl: response(s)}), false);
  for (const s of [429, 500, 503])
    await assert.rejects(checkSession({fetchImpl: response(s)}));
  await assert.rejects(
    checkSession({
      fetchImpl: async () => {
        throw Error('network');
      },
    }),
  );
  await checkSession({
    fetchImpl: async (url, opts) => {
      assert.equal(opts.credentials, 'include');
      assert.equal(opts.method, 'POST');
      assert.ok(url.endsWith('/user/auth/refresh'));
      return {ok: true, json: async () => ({role: 'USER'})};
    },
  });
});
const detail = {
  partyId: 3861,
  guesthouseId: 97,
  scheduleType: 'DATE_EVENT',
  partyTitle: 'Trip',
  partyStartDateTime: '2026-12-03T17:00:00',
  isApplyOpen: true,
  partyStatus: 'RECRUIT',
  maxAttendance: 12,
  numOfAttendance: 0,
  amount: 159000,
};
test('direct booking rejects mismatches, private, closed, full and past events', () => {
  const now = Date.parse('2026-11-12T00:00:00Z');
  assert.equal(bookingParams(detail, 3861, now).partyId, 3861);
  for (const patch of [
    {partyId: 4133},
    {guesthouseId: 98},
    {isVisible: false},
    {isApplyOpen: false},
    {partyStatus: 'CLOSED'},
    {numOfAttendance: 12},
    {partyStartDateTime: '2026-01-01T12:00:00'},
    {partyStartDateTime: 'broken'},
  ])
    assert.throws(() => bookingParams({...detail, ...patch}, 3861, now));
});
