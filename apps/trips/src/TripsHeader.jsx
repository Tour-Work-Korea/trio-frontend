import React from 'react';
import {trips} from './model.js';

export default function TripsHeader({detail = false, programs = false}) {
  return (
    <header className="nm-header">
      {detail ? (
        <a
          className="nm-header-side"
          href="/trips/programs/"
          aria-label="여행 목록으로 돌아가기">
          <span aria-hidden="true">←</span> 목록
        </a>
      ) : (
        <details
          className="nm-header-menu"
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}>
          <summary>
            <span className="nm-menu-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            MENU
          </summary>
          <nav
            className="nm-menu-links"
            aria-label="여행 메뉴"
            onClick={event => {
              if (event.target.closest('a')) {
                event.currentTarget.closest('details').open = false;
              }
            }}>
            <a href="/trips/">
              홈 <span aria-hidden="true">↗</span>
            </a>
            <a href={`/trips/${trips[0].slug}/#schedule`}>
              여행 일정 <span aria-hidden="true">↗</span>
            </a>
            <a href="/trips/programs/">
              프로그램 목록 <span aria-hidden="true">↗</span>
            </a>
            <a href="https://ddakji.kr/login">로그인·회원가입 <span aria-hidden="true">↗</span></a>
          </nav>
        </details>
      )}
      <a className="nm-wordmark" href="/trips/" aria-label="낭만모드 홈">
        <span>NANGMAN</span>
        <span>MODE</span>
      </a>
      <a
        className="nm-header-programs"
        href={programs ? '/trips/' : '/trips/programs/'}>
        {programs ? '홈' : '프로그램'} <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
