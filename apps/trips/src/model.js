import {regroundJeju} from './data/regroundJeju.js';

export const trips = [regroundJeju];
export function tripRoute(pathname) {
  if (!/^\/trips(?:\/|$)/.test(pathname)) return null;
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length === 1) return {page: 'index'};
  if (parts.length === 2 && parts[1] === 'login') return {page: 'login'};
  if (parts.length === 2 && parts[1] === 'programs') return {page: 'programs'};
  const trip = parts.length === 2 && trips.find(item => item.slug === parts[1]);
  return trip ? {page: 'detail', trip} : {page: 'not-found'};
}
export function formatPrice(amount) {
  return Number.isFinite(amount)
    ? amount.toLocaleString('ko-KR') + '원'
    : '신청 화면에서 확인';
}

// Accept only public sale fields; never retain profile, user or attendance data.
export function publicSale(data, expectedId) {
  if (data?.partyId !== expectedId || !Array.isArray(data.priceOptions))
    return null;
  return {
    isApplyOpen:
      typeof data.isApplyOpen === 'boolean' ? data.isApplyOpen : null,
    options: data.priceOptions
      .filter(
        item =>
          Number.isFinite(item.id) &&
          Number.isFinite(item.amount) &&
          item.amount >= 0,
      )
      .map(({id, amount, optionName}) => ({
        id,
        amount,
        name: typeof optionName === 'string' ? optionName : '',
      })),
  };
}
export function optionPrice(sale, optionId, fallback, singleOption = false) {
  if (!sale) return fallback;
  const exact = sale.options.find(option => option.id === optionId);
  if (exact) return exact.amount;
  // A single-option trip follows its sole live option even when admin recreates it.
  // Multi-option classes must never substitute another option's price.
  return singleOption && sale.options.length === 1
    ? sale.options[0].amount
    : null;
}

// A program schedule link opens the corresponding detail tab; invalid values use day one.
export function scheduleDayIndex(days, search) {
  const dayId = new URLSearchParams(search).get('day');
  return Math.max(
    0,
    days.findIndex(day => day.day === dayId),
  );
}
