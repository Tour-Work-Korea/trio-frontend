const getReviewItems = payload => {
  if (Array.isArray(payload?.reviews)) {
    return payload.reviews;
  }

  return Array.isArray(payload) ? payload : [];
};

export const getReviewableItems = payload =>
  getReviewItems(payload).filter(item => item?.isReviewed === false);

export const getReviewableReservationIds = payload =>
  new Set(
    getReviewableItems(payload)
      .map(item => String(item?.reservationId ?? ''))
      .filter(Boolean)
  );

const normalizeLocalTime = time => {
  if (!time || typeof time === 'string') {
    return time;
  }

  if (typeof time.hour !== 'number') {
    return undefined;
  }

  const pad = value => String(value ?? 0).padStart(2, '0');
  return `${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;
};

export const mergeReviewableItemsWithReservations = (
  reviewPayload,
  reservations = []
) => {
  const reservationsById = new Map(
    reservations.map(item => [String(item?.reservationId ?? ''), item])
  );

  return getReviewableItems(reviewPayload).map(review => {
    const reservation = reservationsById.get(String(review.reservationId)) ?? {};

    return {
      ...reservation,
      ...review,
      checkIn: review.reservationCheckIn ?? reservation.checkIn,
      checkOut: review.reservationCheckOut ?? reservation.checkOut,
      guesthouseCheckIn:
        normalizeLocalTime(review.checkIn) ?? reservation.guesthouseCheckIn,
      guesthouseCheckOut:
        normalizeLocalTime(review.checkOut) ?? reservation.guesthouseCheckOut,
      guesthouseImage: reservation.guesthouseImage,
      guesthouseAddress: reservation.guesthouseAddress,
    };
  });
};
