import i18n, {normalizeLanguage} from '../i18n';

export const getLocaleTag = () =>
  normalizeLanguage(i18n.resolvedLanguage || i18n.language) === 'ko'
    ? 'ko-KR'
    : 'en-US';

export const formatNumber = value =>
  Number(value || 0).toLocaleString(getLocaleTag());

export const formatCurrency = value =>
  new Intl.NumberFormat(getLocaleTag(), {
    style: 'currency',
    currency: 'KRW',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDate = (value, options) =>
  new Intl.DateTimeFormat(getLocaleTag(), options).format(new Date(value));
