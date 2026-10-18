import {COLORS} from '@constants/colors';
import i18n from '@trio/app/src/i18n';
import {getLocaleTag} from '@utils/localeFormat';

const PRICE_COLORS = [
  {backgroundColor: COLORS.secondary_pink, color: COLORS.semantic_red},
  {backgroundColor: COLORS.secondary_blue, color: COLORS.semantic_blue},
  {backgroundColor: COLORS.secondary_brown, color: COLORS.semantic_brown},
  {backgroundColor: COLORS.secondary_green, color: COLORS.semantic_green},
  {backgroundColor: COLORS.secondary_yellow, color: COLORS.semantic_brown},
];

export const calendarMessages = locale => {
  const translate = i18n.getFixedT(locale);
  return {
    selected: translate('reservationCalendar.selected'),
    unavailable: translate('reservationCalendar.unavailable'),
    checkIn: translate('reservationCalendar.checkIn'),
    checkOut: translate('reservationCalendar.checkOut'),
    today: translate('reservationCalendar.today'),
  };
};

export const getNightlyPrice = day => {
  if (day?.nightlyPrice == null || day.nightlyPrice === '') {
    return null;
  }
  const price = Number(day.nightlyPrice);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

export const CALENDAR_PRICE_BANDS = [25000, 30000, 35000, 40000, 45000].map(
  (price, index, prices) => ({
    price,
    min: price,
    max: prices[index + 1] ?? Infinity,
    ...PRICE_COLORS[index],
  }),
);

export const formatCalendarPrice = (price, locale, compact = false) => {
  const language = getLocaleTag();
  const amount = new Intl.NumberFormat(language, compact
    ? {notation: 'compact', maximumFractionDigits: 1}
    : {maximumFractionDigits: 0}).format(price);
  return compact ? amount : i18n.getFixedT(locale)('reservationCalendar.price', {amount});
};

