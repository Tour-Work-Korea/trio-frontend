import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canSubmitSignup,
  isEligibleBirthday,
  signupPayload,
  signupDestination,
  clubSignupHref,
  completeEmailSignup,
} from '../auth/signupModel.js';
import {resolveEventRequest} from '../services/eventModel.js';

const now = new Date('2026-10-23T03:00:00Z');
const definitions = [
  {id: 'TERMS_OF_SERVICE', isRequired: true},
  {id: 'MARKETING_NOTIFICATION', isRequired: false},
];
const form = {
  email: 'test@example.com',
  phoneNum: '01012345678',
  nickname: 'KodaTest',
  name: ' Test ',
  birthday: '2000-02-29',
  gender: 'F',
  password: 'Testpass1!',
  passwordConfirm: 'Testpass1!',
};
const input = {
  form,
  definitions,
  agreements: {TERMS_OF_SERVICE: true},
  verifiedEmail: form.email,
  verifiedPhone: form.phoneNum,
  checkedNickname: form.nickname,
};

test('signup requires verified recipients, checked nickname and required consent; optional consent stays optional', () => {
  assert.equal(canSubmitSignup(input, now), true);
  for (const changed of [
    {agreements: {}},
    {verifiedEmail: ''},
    {verifiedPhone: ''},
    {checkedNickname: ''},
    {form: {...form, email: 'changed@example.com'}},
    {form: {...form, phoneNum: '01099999999'}},
    {form: {...form, nickname: 'Changed'}},
    {form: {...form, passwordConfirm: 'Different1!'}},
    {form: {...form, password: 'short', passwordConfirm: 'short'}},
    {form: {...form, name: ' '}},
    {form: {...form, gender: ''}},
    {form: {...form, birthday: '2020-01-01'}},
  ])
    assert.equal(canSubmitSignup({...input, ...changed}, now), false);
});
test('birthday validation rejects impossible dates and handles the 14th birthday in Seoul', () => {
  assert.equal(isEligibleBirthday('2000-02-29', now), true);
  assert.equal(isEligibleBirthday('2001-02-29', now), false);
  assert.equal(isEligibleBirthday('2012-10-23', now), true);
  assert.equal(isEligibleBirthday('2012-10-24', now), false);
  assert.equal(
    isEligibleBirthday('2012-10-24', new Date('2026-10-23T15:00:00Z')),
    true,
  );
  assert.equal(isEligibleBirthday('2028-01-01', now), false);
});
test('signup sends the existing USER contract and explicit false for optional consent', () => {
  const payload = signupPayload(
    {...form, unrelated: 'do not send'},
    input.agreements,
    definitions,
  );
  assert.deepEqual(payload, {
    ...form,
    name: 'Test',
    userRole: 'USER',
    agreements: [
      {agreementType: 'TERMS_OF_SERVICE', agreed: true},
      {agreementType: 'MARKETING_NOTIFICATION', agreed: false},
    ],
  });
});
test('signup routes preserve safe KODA destinations and reject redirects outside the club', () => {
  const target = '/koda/event/?id=regular&lang=en';
  const href = clubSignupHref(target, 'en');
  assert.equal(
    signupDestination(new URL(href, 'https://example.com').search, 'en'),
    target,
  );
  for (const unsafe of [
    'https://evil.example/',
    '//evil.example/',
    '/my/',
    '/koda/join/',
  ])
    assert.equal(
      signupDestination(`?returnTo=${encodeURIComponent(unsafe)}`, 'en'),
      '/koda/my/?lang=en',
    );
  assert.deepEqual(resolveEventRequest('join', ''), {type: 'join'});
});
test('registration success survives auto-login failure without another signup call', async () => {
  const calls = [];
  const result = await completeEmailSignup({
    payload: form,
    register: async data => calls.push(['register', data]),
    login: async (...args) => {
      calls.push(['login', ...args]);
      throw new Error('Login unavailable');
    },
  });
  assert.deepEqual(result, {registered: true, loggedIn: false});
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], ['login', form.email, form.password, 'USER']);
});
test('registration failure never attempts login and successful signup logs in once', async () => {
  let logins = 0;
  await assert.rejects(
    completeEmailSignup({
      payload: form,
      register: async () => {
        throw new Error('Duplicate email');
      },
      login: async () => logins++,
    }),
    /Duplicate email/,
  );
  assert.equal(logins, 0);
  assert.deepEqual(
    await completeEmailSignup({
      payload: form,
      register: async () => {},
      login: async () => logins++,
    }),
    {registered: true, loggedIn: true},
  );
  assert.equal(logins, 1);
});
