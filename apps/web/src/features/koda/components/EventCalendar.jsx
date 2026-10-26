import React, {useState} from 'react';
import {eventHref} from '../services/eventModel';
import {bookingLabel, bookingState} from '../services/liveEventModel';
import {
  calendarMonth,
  eventDateKey,
  eventsInMonth,
  monthDays,
  selectedDayEvents,
  shiftMonth,
} from '../services/calendarModel';

const calendarCopy = {
  ko: {
    previous: '이전 달',
    next: '다음 달',
    today: '이번 달',
    legend: '모임이 있는 날',
    past: '지난 모임',
    empty: '이 달에는 등록된 모임이 없어요.',
    emptyNote: '다른 달을 살펴보거나 모임 목록을 확인해 주세요.',
    browse: '모든 모임 보기',
    preparing: '신청 준비 중',
    detail: '신청하기',
    view: '모임 안내 보기',
    count: '개의 모임',
    schedule: '모임 달력',
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
  },
  en: {
    previous: 'Previous month',
    next: 'Next month',
    today: 'This month',
    legend: 'Meetup dates',
    past: 'Past meetup',
    empty: 'No meetups scheduled this month.',
    emptyNote: 'Explore another month or browse all our gatherings.',
    browse: 'View all meetups',
    preparing: 'Registration coming soon',
    detail: 'Join meetup',
    view: 'View meetup',
    count: 'meetups',
    schedule: 'Meetup calendar',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
};

export default function EventCalendar({events, language, now}) {
  const text = calendarCopy[language];
  const [month, setMonth] = useState(() => calendarMonth(now));
  const [selectedDate, setSelectedDate] = useState(null);
  const monthEvents = eventsInMonth(events, month);
  const selected = selectedDayEvents(monthEvents, selectedDate, now);
  const activeDay = selected[0] && eventDateKey(selected[0].startsAt);
  const today = eventDateKey(now);
  const monthLabel = `${month.year}. ${String(month.month).padStart(2, '0')}`;
  const monthName = new Intl.DateTimeFormat('en', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));
  const changeMonth = next => {
    setMonth(next);
    setSelectedDate(null);
  };

  return (
    <div className="le-calendar">
      <div className="le-calendar-sheet">
        <div className="le-calendar-toolbar">
          <button
            type="button"
            aria-label={text.previous}
            onClick={() => changeMonth(shiftMonth(month, -1))}>
            ←
          </button>
          <h3 aria-live="polite" aria-label={monthLabel}>
            <span className="le-calendar-month" lang="en" aria-hidden="true">
              {monthName}
            </span>
          </h3>
          <button
            type="button"
            aria-label={text.next}
            onClick={() => changeMonth(shiftMonth(month, 1))}>
            →
          </button>
        </div>
        <table className="le-calendar-table">
          <caption className="le-visually-hidden">
            {monthLabel} · {text.schedule} · KST
          </caption>
          <thead>
            <tr>
              {text.weekdays.map(day => (
                <th scope="col" key={day}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthDays(month).map((week, index) => (
              <tr key={index}>
                {week.map((day, column) => {
                  const matches = day
                    ? monthEvents.filter(
                        event => eventDateKey(event.startsAt) === day,
                      )
                    : [];
                  return (
                    <td key={day || `blank-${column}`}>
                      {day &&
                        (matches.length ? (
                          <button
                            type="button"
                            aria-label={`${day} · ${matches.length} ${
                              text.count
                            }: ${matches
                              .map(event =>
                                event.title[language].replace('\n', ' '),
                              )
                              .join(', ')}`}
                            aria-pressed={day === activeDay}
                            aria-current={day === today ? 'date' : undefined}
                            onClick={() => setSelectedDate(day)}>
                            <span className="le-calendar-day">
                              {Number(day.slice(-2))}
                            </span>
                            {matches[0].poster && (
                              <img
                                src={matches[0].poster}
                                alt=""
                                loading="lazy"
                              />
                            )}
                            <i aria-hidden="true" />
                          </button>
                        ) : (
                          <span
                            aria-current={day === today ? 'date' : undefined}>
                            <span className="le-calendar-day">
                              {Number(day.slice(-2))}
                            </span>
                          </span>
                        ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="le-calendar-key">
          <span>
            <i aria-hidden="true" />
            {text.legend}
          </span>
          <button type="button" onClick={() => changeMonth(calendarMonth(now))}>
            {text.today}
          </button>
        </div>
      </div>
      <div
        className="le-calendar-selection"
        aria-live="polite"
        aria-atomic="false">
        {selected.length ? (
          selected.map(event => (
            <article className="le-selected-event" key={event.id}>
              <div className="le-selected-top">
                {event.poster && (
                  <img
                    src={event.poster}
                    alt={event.cover.alt[language] || event.title[language]}
                    width="1080"
                    height="1350"
                    loading="lazy"
                  />
                )}
                <div>
                  <span
                    className={`le-event-status${
                      now >= Date.parse(event.endsAt)
                        ? ' le-event-status--past'
                        : ''
                    }`}>
                    {bookingLabel(event, language, now)}
                  </span>
                  <h3>{event.title[language]}</h3>
                  <p>{event.venue[language]}</p>
                  <strong>{event.price[language]}</strong>
                </div>
              </div>
              <div className="le-selected-schedule">
                <time dateTime={event.startsAt}>{event.date[language]}</time>
                <span>{event.time[language]}</span>
              </div>
              <a
                className="le-primary-link"
                href={eventHref(event.id, language)}>
                {event.bookingEnabled && bookingState(event, now) === 'open'
                  ? text.detail
                  : text.view}
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))
        ) : (
          <div className="le-calendar-empty">
            <h3>{text.empty}</h3>
            <p>{text.emptyNote}</p>
            <a
              className="le-primary-link"
              href={`/koda/gatherings/?lang=${language}`}>
              {text.browse}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
