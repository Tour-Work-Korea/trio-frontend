import React from 'react';

export default function ClubNavigation({language, page = 'home'}) {
  const home = page !== 'home' ? `/koda/?lang=${language}` : '';
  const labels =
    language === 'ko'
      ? ['모임', '일정', '소개']
      : ['Meetups', 'Calendar', 'About'];
  return (
    <nav
      className="le-hub-nav"
      aria-label={language === 'ko' ? '클럽 메뉴' : 'Club navigation'}>
      <a
        href={`/koda/gatherings/?lang=${language}`}
        aria-current={page === 'gatherings' ? 'page' : undefined}>
        {labels[0]}
      </a>
      <a href={`${home}#meetups`}>{labels[1]}</a>
      <a
        href={`/koda/about/?lang=${language}`}
        aria-current={page === 'about' ? 'page' : undefined}>
        {labels[2]}
      </a>
    </nav>
  );
}
