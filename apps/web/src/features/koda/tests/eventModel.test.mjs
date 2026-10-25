import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eventHref,
  resolveEventRequest,
  toEventViewModel,
} from '../services/eventModel.js';
import {createEventRepository, eventRepository} from '../services/eventRepository.js';

const minimal = {
  id: 'new-meetup',
  title: {ko: '새로운 언어교환'},
  startsAt: '2026-11-01T19:00:00+09:00',
  endsAt: '2026-11-01T21:00:00+09:00',
};

test('a new event only needs data, with translation fallback and optional sections', () => {
  const event = toEventViewModel(minimal);
  assert.equal(event.path, '/koda/event/?id=new-meetup');
  assert.equal(event.title.en, minimal.title.ko);
  assert.equal(event.cover, null);
  assert.equal(event.programImage, null);
  for (const field of ['about', 'program', 'faqs', 'gallery', 'relatedIds'])
    assert.deepEqual(event[field], []);
  assert.equal(event.price.ko, '추후 안내');
});

test('IDs and language survive URL encoding and existing detail aliases', () => {
  const url = new URL(eventHref('hello & 안녕?', 'en'), 'https://example.com');
  assert.equal(url.searchParams.get('id'), 'hello & 안녕?');
  assert.equal(url.searchParams.get('lang'), 'en');
  assert.deepEqual(resolveEventRequest('event', url.search), {
    type: 'detail',
    id: 'hello & 안녕?',
  });
  assert.deepEqual(resolveEventRequest('regular', ''), {
    type: 'detail',
    id: 'regular',
  });
  assert.equal(resolveEventRequest('event', '').id, null);
  assert.equal(resolveEventRequest('home', '').type, 'home');
  assert.deepEqual(resolveEventRequest('about', '?lang=en'), {type: 'about'});
  assert.deepEqual(resolveEventRequest('gatherings', '?lang=en'), {
    type: 'gatherings',
  });
});

test('dates use Seoul time, including overnight events, and reject ambiguous intervals', () => {
  const event = toEventViewModel({
    ...minimal,
    startsAt: '2026-11-01T14:00:00Z',
    endsAt: '2026-11-01T16:00:00Z',
  });
  assert.match(event.time.en, /November 2/);
  assert.match(event.time.en, /KST$/);
  assert.throws(() => toEventViewModel({...minimal, endsAt: minimal.startsAt}));
  assert.throws(() =>
    toEventViewModel({...minimal, startsAt: '2026-11-01T19:00:00'}),
  );
});

test('prices format a single currency without translating or converting the amount', () => {
  const event = toEventViewModel({
    ...minimal,
    pricing: {amount: 20000, currency: 'KRW'},
  });
  assert.match(event.price.ko, /20,000/);
  assert.match(event.price.en, /20,000/);
  assert.doesNotThrow(() =>
    toEventViewModel({...minimal, pricing: {amount: 0, currency: 'KRW'}}),
  );
  assert.throws(() =>
    toEventViewModel({...minimal, pricing: {amount: -1, currency: 'KRW'}}),
  );
});

test('media and map fields cannot introduce executable or protocol-relative links', () => {
  for (const url of [
    'javascript:alert(1)',
    '//example.com/a.png',
    '/\\example.com/a.png',
    'data:text/html,hello',
  ]) {
    assert.throws(() => toEventViewModel({...minimal, cover: {url}}));
    assert.throws(() =>
      toEventViewModel({...minimal, location: {mapUrl: url}}),
    );
  }
  assert.equal(
    toEventViewModel({...minimal, cover: {url: 'https://example.com/a.png'}})
      .poster,
    'https://example.com/a.png',
  );
});

test('repository handles a newly supplied event and resolves related IDs', async () => {
  const related = {...minimal, id: 'another-event'};
  const repository = createEventRepository(async () => ({
    events: [
      {...minimal, relatedIds: ['another-event', 'missing', 'another-event']},
      related,
    ],
  }));
  assert.equal((await repository.listEvents()).events.length, 2);
  assert.deepEqual(
    (await repository.getEventDetails(minimal.id)).relatedEvents.map(
      event => event.id,
    ),
    ['another-event'],
  );
  assert.equal(await repository.getEventDetails('missing'), null);
});

test('repository propagates request and invalid-data failures rather than returning local fixtures', async () => {
  await assert.rejects(
    createEventRepository(async () => {
      throw new Error('offline');
    }).listEvents(),
    /offline/,
  );
  await assert.rejects(
    createEventRepository(async () => ({
      events: [minimal, minimal],
    })).listEvents(),
    /Duplicate/,
  );
  await assert.rejects(
    createEventRepository(async () => ({})).listEvents(),
    /Invalid/,
  );
});

test('all migrated events resolve with related events and optional program images', async () => {
  const {events} = await eventRepository.listEvents();
  assert.deepEqual(
    events.map(event => event.id),
    ['itaewon', 'regular', 'halloween'],
  );
  for (const event of events) {
    assert.ok(event.cover && event.program.length && event.faqs.length);
    const detail = await eventRepository.getEventDetails(event.id);
    assert.equal(detail.relatedEvents.length, 2);
    assert.ok(event.gallery.length);
  }
  const {event} = await eventRepository.getEventDetails('itaewon');
  assert.equal(event.programImage, null);
  assert.equal(event.venue.ko, '이태원한스');
  assert.ok(event.gallery.every(item => item.src.includes('itaewon')));
});
