import test from 'node:test';
import assert from 'node:assert/strict';
import {
  paypalCheckoutLink,
  paypalCheckoutUrl,
  registrationLabel,
  internationalRegistrationUrl,
} from '../services/paypalCheckout.js';

const now = Date.parse('2026-11-08T12:00:00+09:00');
const event = {
  id: 'party-123',
  bookingPartyId: 123,
  bookingEnabled: true,
  startsAt: '2026-11-09T19:00:00+09:00',
  endsAt: '2026-11-09T21:00:00+09:00',
  booking: {
    isVisible: true,
    isApplyOpen: true,
    partyStatus: 'RECRUIT',
    capacity: 20,
    attendance: 10,
  },
};
const url = 'https://www.paypal.com/ncp/payment/TEST-LINK';
const resolve = (value = event, link = url, at = now) =>
  paypalCheckoutUrl(value, link, at);

test('international checkout requires the selected meetup form and never falls back to direct payment', () => {
  const form = 'https://forms.gle/ExampleForm';
  assert.equal(internationalRegistrationUrl(event, undefined, now), null);
  assert.equal(internationalRegistrationUrl(event, form, now), form);
  assert.equal(internationalRegistrationUrl({...event, bookingEnabled: false}, form, now), form);
  assert.equal(internationalRegistrationUrl(event, form, Date.parse(event.startsAt)), null);
  assert.equal(internationalRegistrationUrl({...event, booking: {...event.booking, isVisible: false}}, form, now), null);
  for (const unsafe of [url, 'javascript:alert(1)', 'https://forms.gle.evil.example/form', 'https://user:secret@forms.gle/form', 'https://docs.google.com/document/d/form/edit', 'http://forms.gle/form']) {
    assert.equal(internationalRegistrationUrl(event, unsafe, now), null);
  }
  const full = 'https://docs.google.com/forms/d/e/ExampleForm/viewform';
  assert.equal(internationalRegistrationUrl(event, full, now), full);
});

test('one configured link is shared by open meetups; missing links stay hidden', () => {
  assert.equal(resolve(), url);
  assert.equal(paypalCheckoutUrl(event, undefined, now), paypalCheckoutLink);
  assert.equal(resolve(event, ''), null);
  assert.equal(resolve({...event, id: 'party-456', bookingPartyId: 456}), url);
});

test('manual PayPal stays open when platform checkout is disabled', () => {
  const previewEvent = {...event, bookingEnabled: false};
  assert.equal(resolve(previewEvent), url);
  assert.equal(registrationLabel(previewEvent, 'ko', now), '신청 가능');
  assert.equal(registrationLabel(previewEvent, 'en', now), 'Registration open');
});

test('archived, closed, hidden, full and started meetups cannot take PayPal payments', () => {
  assert.equal(resolve(null), null);
  assert.equal(resolve({...event, bookingPartyId: null}), null);
  for (const changes of [
    {isApplyOpen: false},
    {isVisible: false},
    {partyStatus: 'CLOSED'},
    {attendance: 20},
  ]) {
    assert.equal(
      resolve({...event, booking: {...event.booking, ...changes}}),
      null,
    );
  }
  assert.equal(resolve(event, url, Date.parse(event.startsAt)), null);
  assert.equal(resolve(event, url, Date.parse(event.endsAt)), null);
});

test('only explicit HTTPS PayPal destinations are accepted', () => {
  for (const invalid of [
    'javascript:alert(1)',
    'http://www.paypal.com/ncp/payment/test',
    'https://www.paypal.com.evil.example/pay',
    'https://paypal.com@evil.example/pay',
    'https://user:password@paypal.com/pay',
    'https://paypal.com:8443/pay',
    'https://www.paypal.com/',
    '/checkout',
    '',
  ]) {
    assert.equal(resolve(event, invalid), null);
  }
  const paypalMe = 'https://paypal.me/ExampleOnly';
  assert.equal(resolve(event, paypalMe), paypalMe);
});
