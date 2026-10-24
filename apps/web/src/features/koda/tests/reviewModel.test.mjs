import test from 'node:test';
import assert from 'node:assert/strict';
import {reviews} from '../data/reviews.js';
import {
  normalizeReviews,
  reviewSummary,
  reviewsForEvent,
} from '../services/reviewModel.js';
import {eventRepository} from '../services/eventRepository.js';

test('imports all 14 real reviews, including critical feedback and original dates', () => {
  const normalized = normalizeReviews(reviews);
  assert.equal(normalized.length, 14);
  assert.equal(
    normalized.some(item => item.id === '94b1477a-6f26-471e-86a5-314d02a62026'),
    false,
  );
  assert.equal(normalized.filter(item => item.rating === 4).length, 3);
  assert.equal(
    normalized.find(item => item.nickname === 'Ria').eventDate,
    '2026-09-11',
  );
  assert.match(
    normalized.find(item => item.nickname === '오준호').text,
    /노이즈/,
  );
  assert.deepEqual(reviewSummary(normalized), {count: 14, average: '4.8'});
  assert.deepEqual(reviewSummary([]), {count: 0, average: null});
});

test('details select the matching meetup series and clearly flag fallback reviews', async () => {
  const itaewon = await eventRepository.getEventDetails('itaewon');
  const chicken = await eventRepository.getEventDetails('regular');
  const halloween = await eventRepository.getEventDetails('halloween');
  assert.equal(itaewon.reviews.length, 6);
  assert.equal(chicken.reviews.length, 5);
  assert.equal(chicken.reviewsFromOtherMeetups, false);
  assert.equal(halloween.reviews.length, 11);
  assert.equal(halloween.reviewsFromOtherMeetups, true);
  assert.ok(chicken.reviews.every(item => item.seriesId === 'chicken-chat'));
});

test('a future chicken meetup inherits reviews through its series, not its event ID', async () => {
  const catalog = await eventRepository.listEvents();
  const result = reviewsForEvent(catalog.reviews, {
    id: 'chicken-november',
    reviewSeriesId: 'chicken-chat',
  });
  assert.equal(result.reviews.length, 5);
  assert.equal(result.reviewsFromOtherMeetups, false);
});

test('normalization excludes marked tests, preserves line breaks, and rejects bad or duplicate reviews', () => {
  const sample = {...reviews[0], text: 'First<br>Second<br />Third'};
  assert.equal(
    normalizeReviews([sample, {isTest: true}])[0].text,
    'First\nSecond\nThird',
  );
  assert.throws(() => normalizeReviews([sample, sample]), /duplicate/);
  assert.throws(() => normalizeReviews([{...sample, rating: 6}]), /Invalid/);
  assert.throws(
    () => normalizeReviews([{...sample, submittedAt: 'invalid'}]),
    /Invalid/,
  );
});

test('public pages hide excluded reviews without altering source feedback or positive four-star reviews', async () => {
  const catalog = await eventRepository.listEvents();
  assert.equal(catalog.reviews.length, 11);
  assert.ok(
    catalog.reviews.every(
      review => !['오준호', 'yh', '이우열'].includes(review.nickname),
    ),
  );
  assert.equal(catalog.reviews.filter(review => review.rating === 4).length, 2);
  assert.equal(reviews.length, 14);
});
