import React from 'react';
import TripProgramsGrid from './TripProgramsGrid.jsx';
import TripsHeader from './TripsHeader.jsx';
import {trips} from './model.js';
import './trips-index.css';

const Arrow = () => <span aria-hidden="true">⟶</span>;

export default function TripsIndex({programs = trips}) {
  const featuredTrip = programs[0];
  return (
    <main id="trip-main" className="nm-program-index">
      <a className="nm-skip" href="#trip-programs">
        프로그램 목록으로 건너뛰기
      </a>
      <TripsHeader />

      {featuredTrip && (
        <section className="ti-cover" aria-label={featuredTrip.title}>
          <a
            className="ti-cover-poster"
            href={`/trips/${featuredTrip.slug}/`}
            aria-label={`${featuredTrip.title} 자세히 보기`}>
            <img
              src={featuredTrip.hero}
              alt={featuredTrip.heroAlt}
              width="1024"
              height="1280"
              fetchPriority="high"
            />
          </a>
          <div className="ti-cover-copy">
            <p>{featuredTrip.subtitle}</p>
            <a className="ti-mint-link" href={`/trips/${featuredTrip.slug}/`}>
              트립 만나보기 <Arrow />
            </a>
            <a
              className="ti-calendar-shortcut"
              href={`/trips/${featuredTrip.slug}/#schedule`}>
              {featuredTrip.datesShort} 일정 보기 ↗
            </a>
          </div>
        </section>
      )}

      {featuredTrip && (
        <div id="trip-calendar">
          <TripProgramsGrid programs={programs} />
        </div>
      )}
    </main>
  );
}
