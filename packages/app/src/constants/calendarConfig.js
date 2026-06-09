import { LocaleConfig } from 'react-native-calendars';

import { COLORS } from './colors';

LocaleConfig.locales.ko = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: [
    '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'ko';

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