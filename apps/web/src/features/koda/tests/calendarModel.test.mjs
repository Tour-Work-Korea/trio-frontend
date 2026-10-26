import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calendarMonth,
  eventDateKey,
  eventsInMonth,
  monthDays,
  selectedDayEvents,
  shiftMonth,
} from '../services/calendarModel.js';

test('calendar dates follow Seoul time across the UTC day boundary', () => {
  assert.equal(eventDateKey('2026-10-31T16:00:00Z'), '2026-11-01');
  assert.deepEqual(calendarMonth('2026-10-31T16:00:00Z'), {
    year: 2026,
    month: 11,
  });
});

test('month navigation handles both year boundaries', () => {
  assert.deepEqual(shiftMonth({year: 2026, month: 12}, 1), {
    year: 2027,
    month: 1,
  });
  assert.deepEqual(shiftMonth({year: 2026, month: 1}, -1), {
    year: 2025,
    month: 12,
  });
});

test('calendar pads complete weeks and includes leap days', () => {
  const october = monthDays({year: 2026, month: 10});
  assert.deepEqual(october[0].slice(0, 4), [null, null, null, null]);
  assert.equal(october[0][4], '2026-10-01');
  assert.equal(october.flat().filter(Boolean).length, 31);
  assert.ok(october.every(week => week.length === 7));
  assert.equal(
    monthDays({year: 2028, month: 2}).flat().filter(Boolean).length,
    29,
  );
});

const events = [
  {
    id: 'past',
    startsAt: '2026-10-10T19:00:00+09:00',
    endsAt: '2026-10-10T21:00:00+09:00',
  },
  {
    id: 'upcoming',
    startsAt: '2026-10-31T17:00:00+09:00',
    endsAt: '2026-10-31T20:00:00+09:00',
  },
  {
    id: 'same-day',
    startsAt: '2026-10-31T21:00:00+09:00',
    endsAt: '2026-10-31T23:00:00+09:00',
  },
  {
    id: 'next-month',
    startsAt: '2026-11-01T17:00:00+09:00',
    endsAt: '2026-11-01T20:00:00+09:00',
  },
];
const now = Date.parse('2026-10-23T12:00:00+09:00');

test('initial choice shows the next event day and every event on that day', () => {
  const month = eventsInMonth([...events].reverse(), {year: 2026, month: 10});
  assert.equal(month.length, 3);
  assert.deepEqual(
    selectedDayEvents(month, null, now).map(event => event.id),
    ['upcoming', 'same-day'],
  );
  assert.deepEqual(
    selectedDayEvents(month, '2026-10-10', now).map(event => event.id),
    ['past'],
  );
});

test('empty months and stale day selections never show another month’s event', () => {
  const month = eventsInMonth(events, {year: 2026, month: 11});
  assert.deepEqual(
    selectedDayEvents(month, '2026-10-31', now).map(event => event.id),
    ['next-month'],
  );
  assert.deepEqual(
    selectedDayEvents(
      eventsInMonth(events, {year: 2026, month: 12}),
      null,
      now,
    ),
    [],
  );
});

test('past-only months choose the latest event day', () => {
  const month = eventsInMonth(events, {year: 2026, month: 10});
  assert.equal(
    selectedDayEvents(month, null, Date.parse('2026-11-10T00:00:00Z'))[0].id,
    'upcoming',
  );
});
