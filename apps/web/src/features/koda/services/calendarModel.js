const seoulDate = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function eventDateKey(value) {
  const parts = Object.fromEntries(
    seoulDate
      .formatToParts(new Date(value))
      .map(part => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function calendarMonth(value) {
  const [year, month] = eventDateKey(value).split('-').map(Number);
  return {year, month};
}

export function shiftMonth({year, month}, offset) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return {year: date.getUTCFullYear(), month: date.getUTCMonth() + 1};
}

export function monthDays({year, month}) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = Array(firstWeekday).fill(null);
  for (let day = 1; day <= count; day += 1)
    days.push(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0',
      )}`,
    );
  while (days.length % 7) days.push(null);
  return Array.from({length: days.length / 7}, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
}

export function eventsInMonth(events, {year, month}) {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  return events
    .filter(event => eventDateKey(event.startsAt).startsWith(prefix))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

export function selectedDayEvents(events, selectedDate, now) {
  const first =
    events.find(event => Date.parse(event.endsAt) > now) || events.at(-1);
  const day = events.some(
    event => eventDateKey(event.startsAt) === selectedDate,
  )
    ? selectedDate
    : first && eventDateKey(first.startsAt);
  return events.filter(event => eventDateKey(event.startsAt) === day);
}
