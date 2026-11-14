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
        <h1>프로그램</h1>
        <p>제주 워케이션 · 클래스와 파티는 별도 선택</p>
      </div>
      <TripProgramsGrid programs={programs} id="program-list" />
    </main>
  );
}
