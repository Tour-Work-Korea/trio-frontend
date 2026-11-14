import React, {useEffect, useRef, useState} from 'react';
import {ApplyLink} from './ApplyLink.jsx';
import {TRIPS_API_BASE} from './programsApi.js';
import {
  formatPrice,
  optionPrice,
  publicSale,
  scheduleDayIndex,
} from './model.js';
const Arrow = () => <span aria-hidden="true">↗</span>;

export function useSales(trip) {
  const [sales, setSales] = useState({});
  useEffect(() => {
    if (!trip) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const ids = [trip.partyId, ...trip.classes.map(item => item.partyId)];
    Promise.allSettled(
      ids.map(async id => {
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
  const [active, setActive] = useState(() =>
    scheduleDayIndex(trip.days, window.location.search),
  );
  const buttons = useRef([]);
  const day = trip.days[active];
  function onKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % trip.days.length;
    if (event.key === 'ArrowLeft')
      next = (index - 1 + trip.days.length) % trip.days.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = trip.days.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setActive(next);
      buttons.current[next]?.focus();
    }
  }
  return (
    <section id="schedule" className="nm-section nm-schedule">
      <SectionTitle
        title={`${trip.days.length}일간의 일정`}
        subtitle="날짜별로 함께할 시간을 확인해보세요."
      />
      <div className="nm-day-tabs" role="tablist" aria-label="날짜별 여행 일정">
        {trip.days.map((item, index) => (
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
        <div className="nm-timeline">
          {day.events.map((event, index) => (
            <div className="nm-timeline-row" key={`${active}-${index}`}>
              <time>{event.time}</time>
              <div>
                <h4>
                  {event.classId &&
                  trip.classes.some(item => item.partyId === event.classId) ? (
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
      </div>
    </section>
  );
}

export function Booking({trip, sale}) {
  return (
    <section id="booking" className="nm-section nm-booking">
      <SectionTitle
        title="참가비와 신청"
        subtitle="2박 3일 워케이션 참가비예요."
      />
      <p className="nm-price-caption">
        <span>얼리버드 · 11월 19일까지</span>
        <small>1인 기준</small>
      </p>
      <div className="nm-price-grid">
        {trip.priceOptions.map(option => {
          const price = optionPrice(sale, option.id, option.amount, trip.priceOptions.length === 1);
          const discount = Number.isFinite(price)
            ? Math.max(0, option.regularAmount - price)
            : 0;
          return (
            <article className="nm-price-option" key={option.id}>
              <div className="nm-price-top">
                <h3>{option.name}</h3>
                <p className="nm-option-date">{option.dates}</p>
              </div>
              <div className="nm-price-bottom">
                {discount > 0 && (
                  <span className="nm-price-discount">
                    <del>{formatPrice(option.regularAmount)}</del>
                    <small>{formatPrice(discount)} 할인</small>
                  </span>
                )}
                <strong className="nm-option-price">
                  {formatPrice(price)}
                </strong>
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
      <ApplyLink className="nm-button" id={trip.partyId}>
        {sale?.isApplyOpen === false
          ? '현재 모집 상태 확인'
          : '2박 3일 신청하기'}{' '}
        <Arrow />
      </ApplyLink>
    </section>
  );
}
