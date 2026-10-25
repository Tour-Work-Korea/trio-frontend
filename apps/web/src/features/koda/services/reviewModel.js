export function normalizeReviews(records = []) {
  if (!Array.isArray(records)) throw new Error('Invalid review collection.');
  const seen = new Set();
  return records
    .filter(record => !record.isTest)
    .map(record => {
      if (
        !record.id ||
        seen.has(record.id) ||
        !record.seriesId ||
        !Number.isInteger(record.rating) ||
        record.rating < 1 ||
        record.rating > 5 ||
        typeof record.nickname !== 'string' ||
        !record.nickname.trim() ||
        typeof record.text !== 'string' ||
        !record.text.trim() ||
        !/^\d{4}-\d{2}-\d{2}$/.test(record.eventDate) ||
        !Number.isFinite(Date.parse(record.submittedAt))
      ) {
        throw new Error('Invalid or duplicate review.');
      }
      seen.add(record.id);
      return {...record, text: record.text.replace(/<br\s*\/?>/gi, '\n')};
    })
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
}

export function reviewSummary(reviews) {
  return {
    count: reviews.length,
    average: reviews.length
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null,
  };
}

export function reviewsForEvent(reviews, event) {
  const seriesReviews = reviews.filter(
    review => review.seriesId === event.reviewSeriesId,
  );
  return {
    reviews: seriesReviews.length ? seriesReviews : reviews,
    reviewsFromOtherMeetups: !seriesReviews.length,
  };
}
