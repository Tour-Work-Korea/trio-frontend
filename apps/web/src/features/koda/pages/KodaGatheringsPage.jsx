import React, {useState} from 'react';
import useLocaleStore from '@stores/localeStore';
import EventHeader from '../components/EventHeader';
import ClubNavigation from '../components/ClubNavigation';
import KodaLogo from '../components/KodaLogo';
import {eventHref} from '../services/eventModel';
import {bookingLabel} from '../services/liveEventModel';
import {useEventClock, useEventMetadata} from '../hooks';
import {copy} from '../data/copy';
import '../styles/koda.css';
import '../styles/koda-home.css';
import '../styles/koda-gatherings.css';

const listingCopy = {
  ko: {
    title: '언어교환 모임',
    intro: '새로운 인사부터, 함께했던 시간까지.',
    filters: ['전체', '예정된 모임', '지난 모임'],
    filterLabel: '모임 시기',
    count: count => `전체 ${count}개`,
    sort: '모임 정렬',
    recent: '최신 일정순',
    oldest: '오래된 일정순',
    preparing: '신청 준비 중',
    past: '지난 모임',
    empty: '아직 등록된 모임이 없어요.',
    emptyNote: '다른 목록에서 우리의 모임을 만나보세요.',
    reset: '전체 모임 보기',
    home: '클럽 메인으로',
  },
  en: {
    title: 'Language exchange meetups',
    intro: 'New hellos and moments we’ve shared.',
    filters: ['All', 'Upcoming', 'Past'],
    filterLabel: 'Meetup dates',
    count: count => `${count} ${count === 1 ? 'meetup' : 'meetups'}`,
    sort: 'Sort meetups',
    recent: 'Newest first',
    oldest: 'Oldest first',
    preparing: 'Coming soon',
    past: 'Past meetup',
    empty: 'No meetups here yet.',
    emptyNote: 'Explore our other meetups in the full list.',
    reset: 'View all meetups',
    home: 'Back to the club',
  },
};

export default function KodaGatheringsPage({events = []}) {
  const language = useLocaleStore(state => state.language);
  const text = listingCopy[language];
  const now = useEventClock();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const visible = events
    .filter(
      event =>
        filter === 'all' ||
        (filter === 'past'
          ? Date.parse(event.endsAt) <= now
          : Date.parse(event.endsAt) > now),
    )
    .sort(
      (a, b) =>
        (Date.parse(b.startsAt) - Date.parse(a.startsAt)) *
        (sort === 'recent' ? 1 : -1),
    );
  useEventMetadata({
    title: text.title,
    description: text.intro,
    path: '/koda/gatherings/',
    language,
    image: '/koda-assets/media/itaewon-group.jpg',
  });
  return (
    <div className="le-page le-page--hub le-page--listing">
      <a className="le-skip" href="#gathering-content">
        {copy[language].skip}
      </a>
      <EventHeader detail />
      <ClubNavigation language={language} page="gatherings" />
      <main id="gathering-content" className="le-list-main">
        <header className="le-list-heading">
          <h1 lang="en">Our gatherings.</h1>
        </header>
        <div
          className="le-list-filters"
          role="group"
          aria-label={text.filterLabel}>
          {['all', 'upcoming', 'past'].map((value, index) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}>
              {text.filters[index]}
            </button>
          ))}
        </div>
        <div className="le-list-toolbar">
          <p role="status">{text.count(visible.length)}</p>
          <select
            aria-label={text.sort}
            value={sort}
            onChange={event => setSort(event.target.value)}>
            <option value="recent">{text.recent}</option>
            <option value="oldest">{text.oldest}</option>
          </select>
        </div>
        {visible.length ? (
          <div className="le-list-grid">
            {visible.map(event => (
              <a
                key={event.id}
                className="le-list-card"
                href={eventHref(event.id, language)}>
                {event.poster ? (
                  <img
                    src={event.poster}
                    alt=""
                    width="1080"
                    height="1350"
                    loading="lazy"
                  />
                ) : (
                  <div className="le-list-placeholder" aria-hidden="true">
                    hello.
                  </div>
                )}
                <span className="le-list-status">
                  {bookingLabel(event, language, now)}
                </span>
                <h2>{event.title[language].replace('\n', ' ')}</h2>
                <time dateTime={event.startsAt}>
                  {new Intl.DateTimeFormat(language, {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(event.startsAt))}
                </time>
                <p>{event.venue[language]}</p>
                <strong>
                  {event.price[language]} <span aria-hidden="true">↗</span>
                </strong>
              </a>
            ))}
          </div>
        ) : (
          <div className="le-list-empty">
            <p>{text.empty}</p>
            <span>{text.emptyNote}</span>
            {filter !== 'all' && (
              <button type="button" onClick={() => setFilter('all')}>
                {text.reset} ↗
              </button>
            )}
          </div>
        )}
      </main>
      <footer className="le-club-footer">
        <div>
          <KodaLogo />
          <a href={`/koda/?lang=${language}`}>{text.home} ↗</a>
        </div>
        <small>Hosted by Koin × Ddakji</small>
      </footer>
    </div>
  );
}
