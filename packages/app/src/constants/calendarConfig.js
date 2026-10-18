import i18n from '@trio/app/src/i18n';
import {LocaleConfig} from 'react-native-calendars';

import {COLORS} from './colors';

const createCalendarLocale = () => ({
  monthNames: [
    i18n.t('common.january'),
    i18n.t('common.february'),
    i18n.t('common.march'),
    i18n.t('common.april'),
    i18n.t('common.may'),
    i18n.t('common.june'),
    i18n.t('common.july'),
    i18n.t('common.august'),
    i18n.t('common.september'),
    i18n.t('common.october'),
    i18n.t('common.november'),
    i18n.t('common.december'),
  ],

  monthNamesShort: [
    i18n.t('common.january'),
    i18n.t('common.february'),
    i18n.t('common.march'),
    i18n.t('common.april'),
    i18n.t('common.may'),
    i18n.t('common.june'),
    i18n.t('common.july'),
    i18n.t('common.august'),
    i18n.t('common.september'),
    i18n.t('common.october'),
    i18n.t('common.november'),
    i18n.t('common.december'),
  ],

  dayNames: [
    i18n.t('common.sunday'),
    i18n.t('common.monday'),
    i18n.t('common.tuesday'),
    i18n.t('common.wednesday'),
    i18n.t('common.thursday'),
    i18n.t('common.friday'),
    i18n.t('common.saturday'),
  ],

  dayNamesShort: [
    i18n.t('common.work'),
    i18n.t('common.month'),
    i18n.t('common.angry'),
    i18n.t('common.number'),
    i18n.t('common.neck'),
    i18n.t('common.gold'),
    i18n.t('common.sat'),
  ],
  today: i18n.t('common.today'),
});

const applyCalendarLocale = language => {
  const locale = language === 'en' ? 'en' : 'ko';
  LocaleConfig.locales[locale] = createCalendarLocale();
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
