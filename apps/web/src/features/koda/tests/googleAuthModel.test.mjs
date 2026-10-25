import test from 'node:test';
import assert from 'node:assert/strict';
import {googleAuthOutcome} from '../auth/googleAuthModel.js';
import {socialAuthHref, kakaoAuthHref} from '../auth/authReturn.js';

test('Google new and unlinked accounts require a signup session; linked accounts log in', () => {
  for (const status of [
    'NEW_USER_SIGNUP_REQUIRED',
    'SOCIAL_ACCOUNT_NOT_LINKED',
  ]) {
    assert.equal(
      googleAuthOutcome({status, socialSignupToken: 'test-session'}),
      'signup',
    );
    assert.throws(() => googleAuthOutcome({status}));
  }
  assert.equal(
    googleAuthOutcome({isNewUser: true, socialSignupToken: 'test-session'}),
    'signup',
  );
  assert.equal(googleAuthOutcome({status: 'LINKED'}), 'login');
  assert.equal(googleAuthOutcome({isNewUser: false}), 'login');
  for (const data of [
    null,
    {},
    {status: 'ERROR'},
    {status: 'REJECTED', isNewUser: false},
  ])
    assert.throws(() => googleAuthOutcome(data));
});

test('Google entry uses the KODA adapter and safe return; Kakao keeps its existing route', () => {
  const target = '/koda/event/?id=regular&lang=en';
  const url = new URL(socialAuthHref(target, 'GOOGLE'), 'https://example.com');
  assert.equal(url.searchParams.get('kodaReturn'), target);
  assert.deepEqual(
    JSON.parse(new URLSearchParams(url.hash.split('?')[1]).get('params')),
    {provider: 'GOOGLE', koda: true},
  );
  assert.equal(socialAuthHref(target, 'KAKAO'), kakaoAuthHref(target));
  assert.equal(
    new URL(
      socialAuthHref('https://evil.example', 'GOOGLE'),
      'https://example.com',
    ).searchParams.get('kodaReturn'),
    '/koda/',
  );
  assert.throws(() => socialAuthHref(target, 'OTHER'));
});
