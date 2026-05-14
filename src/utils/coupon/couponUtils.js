import dayjs from 'dayjs';

export const getCouponId = coupon =>
  coupon?.userCouponId || coupon?.couponId || coupon?.id;

export const getCouponTitle = coupon =>
  coupon?.couponName || coupon?.name || coupon?.title || '쿠폰';

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

  return `${discountValue.toLocaleString('ko-KR')}원`;
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
      `${minimumOrderAmount.toLocaleString('ko-KR')}원 이상 결제 시 사용 가능`,
    );
  }

  if (maximumDiscountAmount > 0) {
    parts.push(`최대 ${maximumDiscountAmount.toLocaleString('ko-KR')}원 할인`);
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
  return `${Math.max(daysLeft, 0)}일 남음`;
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
