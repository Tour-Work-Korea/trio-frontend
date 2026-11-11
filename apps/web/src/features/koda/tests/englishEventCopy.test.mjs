import test from 'node:test';
import assert from 'node:assert/strict';
import {toEventViewModel} from '../services/eventModel.js';

const record = {
  id: 'party-3982',
  title: '[KODA Club] 언어교환 | What’s Your Vibe?',
  location: {name: '연남 부카'},
  startsAt: '2026-11-25T19:00:00+09:00',
  endsAt: '2026-11-25T21:00:00+09:00',
  pricing: {
    amount: 20000,
    currency: 'KRW',
    options: [
      {id: 1648, amount: 15000},
      {id: 1649, amount: 17000},
    ],
  },
  about: ['※ 할인 혜택은 중복 적용되지 않습니다.'],
  booking: {params: {partyId: 3982, amount: 20000}},
};

test('temporary English copy preserves Korean admin content and booking amounts', () => {
  const before = structuredClone(record);
  const event = toEventViewModel(record);
  assert.equal(
    event.title.en,
    '[KODA Club] Language Exchange | What’s Your Vibe?',
  );
  assert.equal(event.title.ko, record.title);
  assert.equal(event.venue.en, 'BUKA, Yeonnam');
  assert.equal(event.about[0].en, 'Discounts cannot be combined.');
  assert.deepEqual(
    event.paypalDiscounts.map(rate => rate.usdAmount),
    [13, 15],
  );
  assert.equal(event.price.en, '$17 USD');
  assert.equal(event.booking.params.amount, 20000);
  assert.deepEqual(record, before);
});

test('admin edits and future API translations take precedence over temporary copy', () => {
  assert.equal(
    toEventViewModel({...record, title: '새 제목'}).title.en,
    '새 제목',
  );
  assert.equal(
    toEventViewModel({
      ...record,
      title: {ko: record.title, en: 'Updated title'},
    }).title.en,
    'Updated title',
  );
  assert.equal(
    toEventViewModel({...record, id: 'party-9999'}).title.en,
    record.title,
  );
});

test('stale or removed server price options cannot advertise the old PayPal discounts', () => {
  assert.deepEqual(
    toEventViewModel({...record, pricing: {...record.pricing, amount: 21000}})
      .paypalDiscounts,
    [],
  );
  assert.deepEqual(
    toEventViewModel({...record, pricing: {...record.pricing, options: []}})
      .paypalDiscounts,
    [],
  );
  assert.deepEqual(
    toEventViewModel({
      ...record,
      pricing: {...record.pricing, options: [{id: 1648, amount: 16000}]},
    }).paypalDiscounts,
    [],
  );
});

test('early bird follows the admin KRW price without changing payment amounts or applying old discounts', () => {
  const early = structuredClone(record);
  early.pricing.amount = 15000;
  early.booking.params.amount = 15000;
  const before = structuredClone(early);
  const event = toEventViewModel(early);
  assert.equal(event.price.ko, '15,000원');
  assert.equal(event.price.en, '$12.5 USD');
  assert.deepEqual(event.earlyBird.regularPrice, {ko: '20,000원', en: '$17 USD'});
  assert.deepEqual(event.paypalDiscounts, []);
  assert.equal(event.booking.params.amount, 15000);
  assert.deepEqual(early, before);
  assert.equal(toEventViewModel(record).earlyBird, null);
  const changed = toEventViewModel({...early, pricing: {...early.pricing, amount: 16000}});
  assert.equal(changed.earlyBird, null);
  assert.equal(changed.price.en, 'USD price to be confirmed');
});
