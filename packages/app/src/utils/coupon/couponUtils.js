import dayjs from 'dayjs';
import i18n from '../../i18n';
import {formatCurrency} from '../localeFormat';

export const getCouponId = coupon =>
  coupon?.userCouponId || coupon?.couponId || coupon?.id;

export const getCouponTitle = coupon =>
  coupon?.couponName ||
  coupon?.name ||
  coupon?.title ||
  i18n.t('common.coupon');

export const getMinimumOrderAmount = coupon =>
  Number(
    coupon?.minimumOrderAmount ??
      coupon?.minOrderAmount ??
      coupon?.minimumPaymentAmount ??
      coupon?.minOrderPrice ??
      coupon?.minAmount ??
      0,
  );

export const getMaximumDiscountAmount = coupon =>
  Number(
    coupon?.maximumDiscountAmount ??
      coupon?.maxDiscountAmount ??
      coupon?.maxDiscountPrice ??
      coupon?.maxAmount ??
      0,
  );

export const getDiscountRateLabel = coupon => {
  const discountType = coupon?.discountType || coupon?.couponType;
  const discountValue = Number(
    coupon?.discountValue ?? coupon?.amount ?? coupon?.discountAmount ?? 0,
  );

  if (discountType === 'PERCENTAGE' || discountType === 'PERCENT') {
    return `${discountValue}%`;
  }

  return formatCurrency(discountValue);
};

export const getDiscountAmount = (coupon, totalPrice) => {
  const discountType = coupon?.discountType || coupon?.couponType;
  const discountValue = Number(
    coupon?.discountValue ?? coupon?.amount ?? coupon?.discountAmount ?? 0,
  );
  const safeTotalPrice = Number(totalPrice || 0);

  if (discountType === 'PERCENTAGE' || discountType === 'PERCENT') {
    const percentDiscount = Math.floor((safeTotalPrice * discountValue) / 100);
    const maximumDiscountAmount = getMaximumDiscountAmount(coupon);

    if (maximumDiscountAmount > 0) {
      return Math.min(percentDiscount, maximumDiscountAmount, safeTotalPrice);
    }

    return Math.min(percentDiscount, safeTotalPrice);
  }

  return Math.min(discountValue, safeTotalPrice);
};

export const getCouponConditionText = coupon => {
  const minimumOrderAmount = getMinimumOrderAmount(coupon);
  const maximumDiscountAmount = getMaximumDiscountAmount(coupon);
  const parts = [];

  if (minimumOrderAmount > 0) {
    parts.push(
      i18n.t('coupon.minimumOrderCondition', {
        amount: formatCurrency(minimumOrderAmount),
      }),
    );
  }

  if (maximumDiscountAmount > 0) {
    parts.push(
      i18n.t('coupon.maximumDiscount', {
        amount: formatCurrency(maximumDiscountAmount),
      }),
    );
  }

  return (
    parts.join(', ') ||
    coupon?.description ||
    coupon?.condition ||
    coupon?.couponDescription ||
    ''
  );
};

export const getExpiryDate = coupon =>
  coupon?.expiredAt ||
  coupon?.expiresAt ||
  coupon?.endAt ||
  coupon?.validTo ||
  coupon?.validUntil;

export const getRemainingDaysText = coupon => {
  const expiryDate = getExpiryDate(coupon);

  if (!expiryDate) {
    return null;
  }

  const daysLeft = dayjs(expiryDate).endOf('day').diff(dayjs(), 'day') + 1;
  return i18n.t('coupon.daysRemaining', {count: Math.max(daysLeft, 0)});
};

export const isCouponDisabled = (coupon, totalPrice) => {
  const expiryDate = getExpiryDate(coupon);
  const minimumOrderAmount = getMinimumOrderAmount(coupon);
  const isExpired = expiryDate
    ? dayjs(expiryDate).endOf('day').isBefore(dayjs())
    : false;

  return Boolean(
    coupon?.status !== 'ISSUED' ||
      isExpired ||
      Number(totalPrice || 0) < minimumOrderAmount,
  );
};

export const getUsableCouponCount = (coupons, totalPrice) =>
  (Array.isArray(coupons) ? coupons : []).filter(
    coupon => !isCouponDisabled(coupon, totalPrice),
  ).length;
