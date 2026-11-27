import React, {useEffect, useState} from 'react';
import TripExtras from './TripExtras.jsx';
import TripsHeader from './TripsHeader.jsx';
import {useSales, Schedule, Booking} from './TripSections.jsx';
import {WorkationStory} from './WorkationStory.jsx';
import {formatPrice, trips} from './model.js';
import './trips-index.css';

const Arrow = () => <span aria-hidden="true">⟶</span>;

export default function TripsIndex({programs = trips}) {
  const featuredTrip = programs[0];
  const [showPriceInBar, setShowPriceInBar] = useState(false);
  const sales = useSales(featuredTrip);
  const price = featuredTrip?.priceOptions[0].amount;
  useEffect(() => {
    if (!featuredTrip) return;
    const update = () => {
      const booking = document.getElementById('booking');
      if (booking)
        setShowPriceInBar(
          booking.getBoundingClientRect().top <= window.innerHeight * 0.75,
        );
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [featuredTrip]);
  return (
    <>
      <main id="trip-main" className="nm-program-index">
        <a className="nm-skip" href="#trip-overview-title">
          트립 소개로 건너뛰기
        </a>
        <TripsHeader />
        {featuredTrip && (
          <>
            <section className="ti-cover" aria-label={featuredTrip.title}>
              <a
                className="ti-cover-poster"
                href="#trip-overview-title"
                aria-label={`${featuredTrip.title} 소개 보기`}>
                <img
                  src={featuredTrip.hero}
                  alt={featuredTrip.heroAlt}
                  width="1080"
                  height="1350"
                  fetchPriority="high"
                />
              </a>
              <div className="ti-cover-copy">
                <p>{featuredTrip.subtitle}</p>
                <a className="ti-mint-link" href="#booking">
                  트립 신청하기 <Arrow />
                </a>
                <a className="ti-calendar-shortcut" href="#schedule">
                  {featuredTrip.datesShort} 일정 보기 ↗
                </a>
              </div>
            </section>
            <section
              className="ti-trip-summary"
              aria-labelledby="trip-overview-title">
              <h1 id="trip-overview-title">{featuredTrip.title}</h1>
            </section>
            <section className="nm-at-a-glance" aria-label="트립 핵심 정보">
              <dl className="nm-facts">
                <div>
                  <dt>일정</dt>
                  <dd>
                    {featuredTrip.datesShort}
                    <small>
                      {featuredTrip.year}년 · {featuredTrip.duration}
                    </small>
                  </dd>
                </div>
                <div>
                  <dt>장소</dt>
                  <dd>
                    {featuredTrip.stay.name}
                    <small>서귀포 안덕면 덕수회관로 107</small>
                    <a className="ti-place-link" href={featuredTrip.stay.url}>
                      장소 자세히 보기 <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>인원</dt>
                  <dd>10–12명</dd>
                </div>
              </dl>
            </section>
            <section className="ti-places" aria-label="트립 공간과 숙박">
              <figure>
                <img
                  src="/trips-assets/workation-space.jpeg"
                  alt="리그라운드 제주에서 함께 머물며 이야기 나누는 공간"
                  width="733"
                  height="1280"
                  loading="lazy"
                />
                <figcaption>일하는 공간</figcaption>
              </figure>
              <figure>
                <img
                  src="/trips-assets/workation-room.jpeg"
                  alt="리그라운드 제주의 침실"
                  width="900"
                  height="675"
                  loading="lazy"
                />
                <figcaption>머무는 공간</figcaption>
              </figure>
            </section>
            <WorkationStory trip={featuredTrip} />
            <Schedule trip={featuredTrip} compact />
            <Booking trip={featuredTrip} sales={sales} />
            <TripExtras trip={featuredTrip} />
          </>
        )}
      </main>
      {featuredTrip && (
        <aside
          className="nm-booking-bar nm-index-booking-bar"
          aria-label="트립 신청">
          <div>
            {showPriceInBar ? (
              <>
                <span>일정별 · 1인</span>
                <strong>{formatPrice(price)}부터</strong>
              </>
            ) : (
              <span className="nm-index-bar-intro">
                제주 슬로우 도파민 · 2박 3일
              </span>
            )}
          </div>
          <a className="nm-button" href="#booking">
            일정 선택 <span aria-hidden="true">↗</span>
          </a>
        </aside>
      )}
    </>
  );
}
