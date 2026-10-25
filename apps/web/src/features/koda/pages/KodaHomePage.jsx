import React from 'react';
import useLocaleStore from '@stores/localeStore';
import EventHeader from '../components/EventHeader';
import KodaLogo from '../components/KodaLogo';
import EventCalendar from '../components/EventCalendar';
import PhotoBooth from '../components/PhotoBooth';
import MeetupReviews from '../components/MeetupReviews';
import {MeetupGallery} from '../components/EventSections';
import {
  useEventClock,
  useEventMetadata,
  useInitialFragmentNavigation,
} from '../hooks';
import ClubNavigation from '../components/ClubNavigation';
import {copy} from '../data/copy';
import {communityLinks} from '../data/communityLinks';
import '../styles/koda.css';
import '../styles/koda-home.css';

const homeCopy = {
  ko: {
    nav: ['모임 일정', '클럽 소개', '지난 순간'],
    title: '서로의 언어로,\n대화가 친구가 되는 곳.',
    intro: '서로의 언어와 문화를 나누는 서울의 언어교환 모임.',
    browse: '언어교환 모임 둘러보기',
    calendar: '어떤 날에,\n우리 만날까요?',
    calendarNote: '표시된 날짜를 누르면 모임을 자세히 볼 수 있어요.',
    collection: '취향 따라 만나는 우리',
    collectionNote: '새로운 만남부터 함께했던 시간까지.',
    preparing: '신청 준비 중',
    past: '지난 모임',
    moments: '우리 사이에 남은 장면들',
    momentsNote: '사진 속 웃음처럼, 다음 만남도 편안하게.',
    closing: '다음 인사는, 당신과 함께.',
    top: '맨 위로',
  },
  en: {
    nav: ['Meetups', 'About us', 'Moments'],
    title: 'Practice a language.\nMeet a new friend.',
    intro: 'A language exchange in Seoul, sharing languages and cultures.',
    browse: 'Find your language exchange',
    calendar: 'Make room for\na new connection.',
    calendarNote: 'Choose a marked date to explore the meetup.',
    collection: 'Find your kind of gathering',
    collectionNote: 'New connections and evenings we shared.',
    preparing: 'Coming soon',
    past: 'Past meetup',
    moments: 'A few moments between us',
    momentsNote: 'Real people, easy conversations, and a reason to smile.',
    closing: 'Our next hello could be yours.',
    top: 'Back to top',
  },
};

function SectionHeading({eyebrow, title, description, number, displayTitle}) {
  return (
    <div className="le-hub-section-heading">
      <div className="le-section-index">
        <span>{number}</span>
        <span>{eyebrow}</span>
      </div>
      {displayTitle && (
        <p className="le-editorial-title" aria-hidden="true">
          {displayTitle}
        </p>
      )}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default function KodaHomePage({
  events = [],
  gallery = [],
  reviews = [],
}) {
  const language = useLocaleStore(state => state.language);
  const text = homeCopy[language];
  const labels = copy[language];
  const now = useEventClock();
  useInitialFragmentNavigation();
  useEventMetadata({
    title: labels.page,
    description: text.intro,
    path: '/koda/',
    image: '/koda-assets/media/hongdae-chicken-chat.jpg',
    language,
  });

  return (
    <div className="le-page le-page--hub le-page--home" id="club-top">
      <a className="le-skip" href="#event-content">
        {labels.skip}
      </a>
      <EventHeader />
      <ClubNavigation language={language} />
      <main id="event-content">
        <section className="le-club-hero" aria-labelledby="club-title">
          <div className="le-hero-meta">
            <span>LANGUAGES & CULTURES</span>
            <span>SEOUL, KR ↗</span>
          </div>
          <div className="le-hero-composition">
            <p className="le-hero-display" lang="en">
              <span>Language</span>
              <span>exchange.</span>
            </p>
            <PhotoBooth items={gallery} language={language} />
            <p className="le-hero-display le-hero-display--ending" lang="en">
              <span>A new</span>
              <span>connection.</span>
            </p>
          </div>
          <div className="le-hero-description">
            <h1 id="club-title">{text.title}</h1>
            <p>{text.intro}</p>
          </div>
          <a
            className="le-hero-link"
            href={`/koda/gatherings/?lang=${language}`}>
            {text.browse}
            <span aria-hidden="true">↗</span>
          </a>
        </section>

        <section
          className="le-hub-section le-calendar-section"
          id="meetups"
          aria-label={text.nav[0]}>
          <SectionHeading
            number="01"
            displayTitle="The calendar."
            eyebrow="MAKE TIME TO CONNECT"
            title={text.calendar}
            description={text.calendarNote}
          />
          <EventCalendar events={events} language={language} now={now} />
        </section>

        <MeetupReviews reviews={reviews} language={language} home />
        {gallery.length > 0 && (
          <section
            className="le-hub-section le-moments-section"
            id="memories"
            aria-label={labels.memories}>
            <SectionHeading
              number="03"
              displayTitle="The moments."
              eyebrow="REAL PEOPLE, REAL CONNECTIONS"
              title={text.moments}
              description={text.momentsNote}
            />
            <MeetupGallery
              items={gallery}
              language={language}
              labels={labels}
            />
          </section>
        )}
        <section className="le-club-closing" aria-label={text.closing}>
          <p className="le-closing-note" lang="en">
            See you at
            <br />
            <em>the next hello.</em>
          </p>
          <h2>{text.closing}</h2>
          <a
            className="le-primary-link"
            href={`/koda/gatherings/?lang=${language}`}>
            {text.browse}
            <span aria-hidden="true">↗</span>
          </a>
        </section>
        <section className="le-community" aria-labelledby="community-title">
          <p className="le-community-eyebrow">STAY IN TOUCH</p>
          <h2 id="community-title">
            {language === 'ko'
              ? '함께 이야기해요.'
              : 'Keep the conversation going.'}
          </h2>
          <div className="le-community-links">
            <a
              href={communityLinks.kakao}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                language === 'ko'
                  ? '카카오 오픈채팅 (새 창)'
                  : 'Kakao Open Chat (opens in a new tab)'
              }>
              <span>
                <strong>
                  {language === 'ko' ? '카카오 오픈채팅' : 'Kakao Open Chat'}
                </strong>
                <small>
                  {language === 'ko'
                    ? '다음 모임 소식과 편한 대화'
                    : 'Meetup updates and everyday conversations'}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
            <a
              href={communityLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                language === 'ko'
                  ? 'KODA 인스타그램 (새 창)'
                  : 'KODA Instagram (opens in a new tab)'
              }>
              <span>
                <strong>
                  Instagram{' '}
                  <span className="le-community-handle">@koda.club.kr</span>
                </strong>
                <small>
                  {language === 'ko'
                    ? 'KODA의 분위기와 함께한 순간들'
                    : 'The people and moments of KODA'}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>
      <footer className="le-club-footer">
        <div>
          <KodaLogo />
          <a href="#club-top">{text.top} ↑</a>
        </div>
        <p>Different languages. Shared stories.</p>
        <small>Hosted by Koin × Ddakji</small>
      </footer>
    </div>
  );
}
