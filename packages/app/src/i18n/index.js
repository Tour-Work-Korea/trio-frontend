import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ko';

import en from '../locales/en.json';
import ko from '../locales/ko.json';

export const DEFAULT_LANGUAGE = 'ko';
export const SUPPORTED_LANGUAGES = ['ko', 'en'];

export const normalizeLanguage = language => {
  const normalized = String(language ?? '')
    .trim()
    .toLowerCase();

  if (normalized === 'ko' || normalized.startsWith('ko-')) {
    return 'ko';
  }

  if (
    normalized === 'en' ||
    normalized.startsWith('en-') ||
    normalized === 'ja' ||
    normalized.startsWith('ja-') ||
    normalized === 'zh' ||
    normalized.startsWith('zh-')
  ) {
    return 'en';
  }

  return DEFAULT_LANGUAGE;
};

export const toApiLanguage = language =>
  normalizeLanguage(language) === 'ko' ? 'KO' : 'EN';

export const toAcceptLanguage = language => normalizeLanguage(language);

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    ko: {translation: ko},
    en: {translation: en},
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

dayjs.locale(DEFAULT_LANGUAGE);
i18n.on('languageChanged', language => {
  dayjs.locale(normalizeLanguage(language));
});

export default i18n;
