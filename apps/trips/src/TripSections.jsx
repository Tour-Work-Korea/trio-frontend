import React, {useEffect, useRef, useState} from 'react';
import {ApplyLink} from './ApplyLink.jsx';
import {TRIPS_API_BASE} from './programsApi.js';
import {formatPrice, publicSale, scheduleDayIndex} from './model.js';
const Arrow = () => <span aria-hidden="true">↗</span>;

export function useSales(trip) {
  const [sales, setSales] = useState({});
  useEffect(() => {
    if (!trip) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const ids = new Set([
      trip.partyId,
      ...(trip.priceOptions || []).map(item => item.partyId).filter(Boolean),
      ...trip.classes.map(item => item.partyId),
    ]);
    Promise.allSettled(
      [...ids].map(async id => {
        // Public, read-only production listings match the supplied booking URLs.
        const response = await fetch(`${TRIPS_API_BASE}/user/parties/${id}`, {
          credentials: 'omit',
          signal: controller.signal,
          headers: {'Accept-Language': 'ko'},
        });
        if (!response.ok) return;
        const sale = publicSale(await response.json(), id);
        if (sale && !controller.signal.aborted)
          setSales(previous => ({...previous, [id]: sale}));
      }),
    ).finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trip]);
  return sales;
}

export function SectionTitle({title, subtitle}) {
  return (
    <div className="nm-section-heading">
      <h2>{title}</h2>
      {subtitle && <p className="nm-section-description">{subtitle}</p>}
    </div>
  );
}

export function Schedule({trip, compact = false}) {
  const scheduleOptions = trip.scheduleOptions || [];
  const [activeScheduleId, setActiveScheduleId] = useState(
    scheduleOptions[0]?.id,
  );
  const activeSchedule = scheduleOptions.find(
    option => option.id === activeScheduleId,
  );
  const defaultDays = scheduleOptions[0]?.days || trip.days;
  const days = activeSchedule?.days?.length ? activeSchedule.days : defaultDays;
  const [active, setActive] = useState(() =>
    scheduleDayIndex(defaultDays, window.location.search),
  );
  const buttons = useRef([]);
  const day = days[active];
  const scheduleImage = activeSchedule?.scheduleImages?.[active < 2 ? 0 : 1];
  function onKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % days.length;
    if (event.key === 'ArrowLeft')
      next = (index - 1 + days.length) % days.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = days.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setActive(next);
      buttons.current[next]?.focus();
    }
  }
  return (
    <section id="schedule" className="nm-section nm-schedule">
      <SectionTitle
        title="2박 3일간의 일정"
        subtitle="원하는 날짜를 선택해 함께할 시간을 확인해보세요."
      />
      {scheduleOptions.length > 1 && (
        <div
          className="nm-day-tabs nm-schedule-options"
          role="group"
          aria-label="여행 날짜 선택">
          {scheduleOptions.map(option => (
            <button
              key={option.id}
              type="button"
              aria-pressed={activeScheduleId === option.id}
              onClick={() => {
                setActiveScheduleId(option.id);
                setActive(0);
              }}>
              <span>{option.label}</span>
              <small>{option.dates}</small>
            </button>
          ))}
        </div>
      )}
      <div className="nm-day-tabs" role="tablist" aria-label="날짜별 여행 일정">
        {days.map((item, index) => (
          <button
            key={item.day}
            id={`day-tab-${index}`}
            ref={el => {
              buttons.current[index] = el;
            }}
            role="tab"
            aria-selected={active === index}
            aria-controls="day-panel"
            tabIndex={active === index ? 0 : -1}
            onKeyDown={event => onKey(event, index)}
            onClick={() => setActive(index)}>
            <span>DAY {item.day}</span>
            <small>{item.date}</small>
          </button>
        ))}
      </div>
      <div
        className="nm-day-panel"
        id="day-panel"
        role="tabpanel"
        aria-labelledby={`day-tab-${active}`}
        tabIndex={0}>
        {activeSchedule?.scheduleImages ? (
          <div className="nm-schedule-images">
            <img
              src={scheduleImage.src}
              alt={scheduleImage.alt}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="nm-timeline">
            {day.events.map((event, index) => (
              <div className="nm-timeline-row" key={`${active}-${index}`}>
                {event.time ? (
                  <time>{event.time}</time>
                ) : (
                  <span aria-hidden="true" />
                )}
                <div>
                  <h4>
                    {event.classId &&
                    trip.classes.some(
                      item => item.partyId === event.classId,
                    ) ? (
                      <a
                        className="nm-schedule-class-link"
                        href={`#class-${event.classId}`}>
                        {event.title}
                        <span className="nm-optional">별도 신청 ↗</span>
                      </a>
                    ) : (
                      <>
                        {event.title}
                        {event.optional && (
                          <span className="nm-optional">별도 신청</span>
                        )}
                      </>
                    )}
                  </h4>
                  {(!compact || event.overview) && event.description && (
                    <p>{event.description}</p>
                  )}
                  {event.image && (
                    <img
                      className="nm-schedule-photo"
                      src={event.image}
                      alt={event.imageAlt || ''}
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            ))}
            {day.notes.map(note => (
              <p className="nm-note" key={note}>
                ※ {note}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Booking({trip, sales = {}}) {
  return (
    <section id="booking" className="nm-section nm-booking">
      <SectionTitle title="참가비와 신청" subtitle="2박 3일 트립 참가비예요." />
      <p className="nm-price-caption">
        <span>일정별 참가비</span>
        <small>1인 기준</small>
      </p>
      <div className="nm-price-grid">
        {trip.priceOptions.map(option => {
          const price = option.amount;
          return (
            <article className="nm-price-option" key={option.id}>
              <div className="nm-price-top">
                <h3>{option.name}</h3>
                <p className="nm-option-date">{option.dates}</p>
              </div>
              <div className="nm-price-bottom">
                <strong className="nm-option-price">
                  {formatPrice(price)}
                </strong>
                <ApplyLink className="nm-option-apply" id={option.partyId}>
                  {sales[option.partyId]?.isApplyOpen === false
                    ? '모집 상태 확인'
                    : '이 일정 신청'}{' '}
                  <Arrow />
                </ApplyLink>
              </div>
            </article>
          );
        })}
      </div>
      <div className="nm-inclusions">
        <div>
          <h3>포함 사항</h3>
          <ul>
            {trip.inclusions.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>불포함 사항</h3>
          <ul>
            {trip.exclusions.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
