import React from 'react';
import useLocaleStore from '@stores/localeStore';
import EventHeader from '../components/EventHeader';
import ClubNavigation from '../components/ClubNavigation';
import KodaLogo from '../components/KodaLogo';
import ClubPartner from '../components/ClubPartner';
import {clubCopy, clubPartners} from '../data/clubContent';
import {useEventMetadata} from '../hooks';
import {copy} from '../data/copy';
import '../styles/koda.css';
import '../styles/koda-home.css';
import '../styles/koda-about.css';

export default function KodaAboutPage() {
  const language = useLocaleStore(state => state.language);
  const text = clubCopy[language];
  const ko = language === 'ko';
  useEventMetadata({
    title: ko ? '클럽 소개' : 'About the club',
    description: text.aboutText,
    path: '/koda/about/',
    language,
    image: '/koda-assets/media/itaewon-group.jpg',
  });
  return (
    <div className="le-page le-page--hub le-page--about">
      <a className="le-skip" href="#club-content">
        {copy[language].skip}
      </a>
      <EventHeader detail />
      <ClubNavigation language={language} page="about" />
      <main id="club-content">
        <header className="le-about-page-heading">
          <h1 lang="en">About the club.</h1>
          <p>Koin × Ddakji</p>
        </header>
        <section
          className="le-hub-section le-about-story"
          aria-labelledby="club-story-title">
          <div className="le-section-index">
            <span>01</span>
            <span>OUR STORY</span>
          </div>
          <h2 id="club-story-title">{text.about}</h2>
          <p className="le-about-description">{text.aboutText}</p>
          {/* Name reference: https://www.native-languages.org/mailbag/koda.htm */}
          <div className="le-name-story">
            <h3>{text.nameMeaning}</h3>
            <p>{text.nameStory}</p>
          </div>
        </section>
        <section
          className="le-hub-section le-about-apps"
          aria-labelledby="club-apps-title">
          <div className="le-section-index">
            <span>02</span>
            <span>THE APPS BEHIND THE CLUB</span>
          </div>
          <h2 id="club-apps-title">
            {ko ? '함께 만드는 두 앱' : 'Two apps, one shared hello.'}
          </h2>
          <p className="le-about-apps-intro">
            {ko
              ? 'Koin과 게딱지가 만나, 언어와 문화가 이어지는 자리를 만들어요.'
              : 'Koin and Ddakji come together to connect people through language and culture.'}
          </p>
          {clubPartners.map(partner => (
            <ClubPartner
              key={partner.id}
              partner={partner}
              language={language}
            />
          ))}
        </section>
        <div className="le-about-browse">
          <a
            className="le-primary-link"
            href={`/koda/gatherings/?lang=${language}`}>
            {ko ? '언어교환 모임 둘러보기' : 'Explore our meetups'}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </main>
      <footer className="le-club-footer">
        <div>
          <KodaLogo />
          <a href={`/koda/?lang=${language}`}>
            {ko ? '클럽 메인으로' : 'Back to the club'} ↗
          </a>
        </div>
        <small>Hosted by Koin × Ddakji</small>
      </footer>
    </div>
  );
}
