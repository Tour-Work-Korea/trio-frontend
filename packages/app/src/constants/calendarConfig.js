import i18n, {normalizeLanguage} from '@trio/app/src/i18n';
import {LocaleConfig} from 'react-native-calendars';

import {COLORS} from './colors';

const createCalendarLocale = language => {
  const t = i18n.getFixedT(language);
  return {
    monthNames: [
      t('common.january'),
      t('common.february'),
      t('common.march'),
      t('common.april'),
      t('common.may'),
      t('common.june'),
      t('common.july'),
      t('common.august'),
      t('common.september'),
      t('common.october'),
      t('common.november'),
      t('common.december'),
    ],

    monthNamesShort: [
      t('common.january'),
      t('common.february'),
      t('common.march'),
      t('common.april'),
      t('common.may'),
      t('common.june'),
      t('common.july'),
      t('common.august'),
      t('common.september'),
      t('common.october'),
      t('common.november'),
      t('common.december'),
    ],

    dayNames: [
      t('common.sunday'),
      t('common.monday'),
      t('common.tuesday'),
      t('common.wednesday'),
      t('common.thursday'),
      t('common.friday'),
      t('common.saturday'),
    ],

    dayNamesShort: [
      t('common.work'),
      t('common.month'),
      t('common.angry'),
      t('common.number'),
      t('common.neck'),
      t('common.gold'),
      t('common.sat'),
    ],
    today: t('common.today'),
    formatAccessibilityLabel:
      language === 'ko' ? 'yyyy년 M월 d일 dddd' : 'dddd, MMMM d, yyyy',
  };
};

const applyCalendarLocale = language => {
  const locale = normalizeLanguage(language);
  LocaleConfig.locales[locale] = createCalendarLocale(locale);
  LocaleConfig.defaultLocale = locale;
};

applyCalendarLocale(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', applyCalendarLocale);

export const CALENDAR_THEME = {
  todayTextColor: COLORS.primary_orange,
  arrowColor: COLORS.primary_orange,
};

export const CALENDAR_COMMON_PROPS = {
  monthFormat: 'yyyy.MM',
  firstDay: 1,
  hideExtraDays: true,
};

//   const todayLocalDate = getTodayLocalDate();
//   const markedDates = {
//     // [todayLocalDate]: {
//     //   marked: true,
//     //   dotColor: COLORS.primary_orange,
//     // },
//     [selectedDate]: {
//       selected: true,
//       selectedColor: COLORS.primary_orange,
//       // ...(todayLocalDate === selectedDate
//       //   ? { marked: true, dotColor: COLORS.grayscale_0 }
//       //   : {}),
//     },
//   };
