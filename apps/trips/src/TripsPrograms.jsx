import React from 'react';
import TripsHeader from './TripsHeader.jsx';
import TripProgramsGrid from './TripProgramsGrid.jsx';
import {trips} from './model.js';
import './trips-index.css';

export default function TripsPrograms({programs = trips}) {
  return (
    <main id="trip-main" className="nm-program-index nm-programs-page">
      <a className="nm-skip" href="#program-list">
        프로그램 목록으로 건너뛰기
      </a>
      <TripsHeader programs />
      <div className="ti-list-heading">
        <h1 lang="en">Programs</h1>
        <p>트립부터 클래스, 파티까지.</p>
      </div>
      <TripProgramsGrid programs={programs} id="program-list" />
    </main>
  );
}
