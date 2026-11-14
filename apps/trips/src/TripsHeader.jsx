import React, {useEffect, useRef, useState} from 'react';
import AccountMenu from './AccountMenu.jsx';

export default function TripsHeader({detail = false, programs = false}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef(null);
  useEffect(() => {
    const restore = event => {
      if (event.persisted && menu.current) {
        menu.current.open = false;
        setMenuOpen(false);
      }
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  return (
    <header className="nm-header">
      {detail ? (
        <a
          className="nm-header-side"
          href="/trips/"
          aria-label="워케이션 메인으로 돌아가기">
          <span aria-hidden="true">←</span> 홈
        </a>
      ) : (
        <details
          className="nm-header-menu"
          ref={menu}
          onToggle={event => setMenuOpen(event.currentTarget.open)}
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
            <a href="/trips/#schedule">
              여행 일정 <span aria-hidden="true">↗</span>
            </a>
            <AccountMenu open={menuOpen} />
          </nav>
        </details>
      )}
      <a className="nm-wordmark" href="/trips/" aria-label="낭만모드 홈">
        <span>NANGMAN</span>
        <span>MODE</span>
      </a>
      <a
        className="nm-header-programs"
        href={programs ? '/trips/' : '#booking'}>
        {programs ? '홈' : '신청 안내'} <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
