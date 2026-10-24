import React from 'react';
import useLocaleStore from '@stores/localeStore';
import {WEB_ROUTES} from '@web/routes';
import {copy} from '../data/copy';
import KodaLogo from './KodaLogo';
import {useClubAuth} from '../auth/ClubAuth';
import {communityLinks} from '../data/communityLinks';
import '../styles/koda-auth.css';

export default function EventHeader({detail = false}) {
  const language = useLocaleStore(state => state.language);
  const setLanguage = useLocaleStore(state => state.setLanguage);
  const labels = copy[language];
  const {ready, authenticated, openLogin} = useClubAuth();
  const changeLanguage = next => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
    void setLanguage(next);
  };

  return (
    <header className="le-header">
      <a
        className="le-home"
        href={detail ? `/koda/?lang=${language}` : WEB_ROUTES.HOME}
        aria-label={detail ? labels.page : labels.home}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true">
          <path d="m14 6-6 6 6 6" />
        </svg>
      </a>
      <a
        className="le-brand-link"
        href={`/koda/?lang=${language}`}
        aria-label={`KODA CLUB · ${labels.page}`}>
        <KodaLogo />
      </a>
      <a
        className="le-instagram-link"
        href={communityLinks.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          language === 'ko'
            ? 'KODA 인스타그램 (새 창)'
            : 'KODA Instagram (opens in a new tab)'
        }>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <div
        className="le-auth-actions"
        role="group"
        aria-label={language === 'ko' ? '계정' : 'Account'}
        aria-busy={!ready}>
        {authenticated ? (
          <a href={`/koda/my/?lang=${language}`}>
            {language === 'ko' ? '마이페이지' : 'My KODA'}
          </a>
        ) : (
          <button type="button" onClick={openLogin} aria-haspopup="dialog">
            {language === 'ko' ? '로그인' : 'Log in'}
          </button>
        )}
      </div>
      <div className="le-languages" role="group" aria-label="Language">
        <button
          type="button"
          lang="ko"
          aria-pressed={language === 'ko'}
          onClick={() => changeLanguage('ko')}>
          한국어
        </button>
        <button
          type="button"
          lang="en"
          aria-pressed={language === 'en'}
          onClick={() => changeLanguage('en')}>
          EN
        </button>
      </div>
    </header>
  );
}
