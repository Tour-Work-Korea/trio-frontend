import React from 'react';
import {createRoot} from 'react-dom/client';
import {I18nextProvider} from 'react-i18next';
import i18n from '@trio/app/src/i18n';
import useLocaleStore, {initializeLocale} from '@stores/localeStore';
import '../../fonts.css';
import KodaRouter from './KodaRouter';
import {resolveEventRequest} from './services/eventModel';
import {ClubAuthProvider} from './auth/ClubAuth';

const request = resolveEventRequest(
  document.documentElement.dataset.event,
  window.location.search,
);
const page = (
  <ClubAuthProvider>
    <KodaRouter request={request} />
  </ClubAuthProvider>
);
const root = createRoot(document.getElementById('root'));

async function renderPage() {
  // Share the app's saved language. A shared URL can explicitly select KO/EN.
  await initializeLocale();
  const language = new URLSearchParams(window.location.search).get('lang');
  if (language === 'ko' || language === 'en') {
    await useLocaleStore.getState().setLanguage(language);
  }
  root.render(<I18nextProvider i18n={i18n}>{page}</I18nextProvider>);
}

renderPage().catch(() => {
  // A storage restriction must not prevent reading the event details.
  root.render(<I18nextProvider i18n={i18n}>{page}</I18nextProvider>);
});
