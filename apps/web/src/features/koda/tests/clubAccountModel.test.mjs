import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectClubReservations,
  reservationStatusLabel,
  reservationSummary,
  reservationLoadStatus,
  formatReservationSchedule,
} from '../services/clubAccountModel.js';
import {resolveEventRequest, toEventViewModel} from '../services/eventModel.js';
import {authHref, safeKodaReturn} from '../auth/authReturn.js';

test('reservation schedules use Seoul dates and weekdays for overseas visitors', () => {
  assert.deepEqual(formatReservationSchedule('2026-10-31T19:00:00', 'ko'), {
    date: '2026.10.31 (토)', time: '19:00', dateTime: '2026-10-31T19:00:00+09:00',
  });
  assert.deepEqual(formatReservationSchedule('2026-10-30T16:00:00Z', 'en'), {
    date: '2026.10.31 (Sat)', time: '01:00', dateTime: '2026-10-30T16:00:00Z',
  });
  assert.equal(formatReservationSchedule(null, 'ko'), null);
  assert.equal(formatReservationSchedule('invalid', 'ko'), null);
});

test('KODA reservations require an explicit backend ID, never a matching title', () => {
  const events = [{id: 'regular', bookingPartyId: 42}];
  const records = [
    {reservationId: 1, partyId: 42, reservationStatus: 'PENDING'},
    {
      reservationId: 2,
      partyId: 99,
      partyName: '치킨 언어교환',
      reservationStatus: 'CONFIRMED',
    },
  ];
  assert.deepEqual(
    selectClubReservations(records, events).map(item => item.reservationId),
    [1],
  );
  assert.equal(selectClubReservations({content: records}, events).length, 1);
  assert.deepEqual(selectClubReservations(records, []), []);
  assert.throws(() => selectClubReservations({}, events), /Invalid/);
});
test('reservation cards use booked server facts, not the editorial event', () => {
  const record = {
    partyName: '게딱지 테스트',
    startDateTime: '2026-10-31T19:00:00',
    guesthouseAddress: '서울시 테스트 장소',
    partyImage: 'https://example.com/booked.jpg',
    event: {
      title: {ko: '할로윈 언어교환'},
      startsAt: '2026-10-31T17:00:00+09:00',
    },
  };
  assert.deepEqual(reservationSummary(record), {
    title: record.partyName,
    startDateTime: record.startDateTime,
    location: record.guesthouseAddress,
    image: record.partyImage,
  });
  assert.deepEqual(reservationSummary({event: record.event}), {
    title: '', startDateTime: null, location: '', image: null,
  });
  assert.equal(reservationSummary({startDateTime: 'invalid'}).startDateTime, null);
  assert.equal(reservationSummary({partyImage: 'javascript:alert(1)'}).image, null);
});
test('failed authentication remains an error, never an empty reservation list', () => {
  for (const status of [401, 403]) {
    assert.equal(reservationLoadStatus({response: {status}}), 'authError');
  }
  assert.equal(reservationLoadStatus({response: {status: 500}}), 'error');
  assert.equal(reservationLoadStatus(new Error('Network Error')), 'error');
});
test('expired and withdrawn applications have accurate labels and categories', () => {
  const records = ['EXPIRED', 'WITHDRAWN'].map(approvalStatus => ({
    partyId: 42, reservationStatus: 'PENDING', approvalStatus,
  }));
  const result = selectClubReservations(records, [{bookingPartyId: 42}]);
  assert.deepEqual(result.map(item => item.category), ['cancelled', 'cancelled']);
  assert.equal(reservationStatusLabel(result[0], 'ko'), '승인 대기 만료');
  assert.equal(reservationStatusLabel(result[1], 'ko'), '신청 철회');
  assert.equal(reservationStatusLabel({
    reservationStatus: 'CANCELLED', approvalStatus: 'REJECTED',
  }, 'ko'), '취소됨');
});
test('server approval and cancellation states remain distinct from payment success', () => {
  const records = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(
    (reservationStatus, index) => ({
      partyId: 42,
      reservationId: index,
      reservationStatus,
    }),
  );
  records.push({
    partyId: 42,
    reservationId: 5,
    reservationStatus: 'PENDING',
    approvalStatus: 'REJECTED',
  });
  const result = selectClubReservations(records, [{bookingPartyId: 42}]);
  assert.deepEqual(
    result.map(item => item.category),
    ['upcoming', 'upcoming', 'past', 'cancelled', 'cancelled'],
  );
  assert.equal(reservationStatusLabel(result[0], 'ko'), '예약 대기');
  assert.equal(
    reservationStatusLabel(
      {reservationStatus: 'PENDING', approvalStatus: 'NONE'},
      'ko',
    ),
    '결제 대기',
  );
  assert.equal(
    reservationStatusLabel(
      {reservationStatus: 'PENDING', approvalStatus: 'WAITING_HOST'},
      'ko',
    ),
    '승인 대기',
  );
  assert.equal(reservationStatusLabel(result[4], 'en'), 'Not approved');
  assert.equal(
    reservationStatusLabel({reservationStatus: 'UNKNOWN'}, 'ko'),
    '상태 확인 중',
  );
});
test('My KODA supports direct routing and safe login/signup returns', () => {
  assert.deepEqual(resolveEventRequest('my', ''), {type: 'my'});
  const target = '/koda/my/?lang=en';
  assert.equal(safeKodaReturn(target), target);
  assert.equal(
    new URL(authHref(target, true), 'https://example.com').searchParams.get(
      'kodaReturn',
    ),
    target,
  );
  const record = {
    id: 'new',
    title: 'New',
    startsAt: '2026-11-01T19:00:00+09:00',
    endsAt: '2026-11-01T21:00:00+09:00',
  };
  assert.equal(toEventViewModel(record).bookingPartyId, null);
  assert.equal(
    toEventViewModel({...record, bookingPartyId: 42}).bookingPartyId,
    42,
  );
});
