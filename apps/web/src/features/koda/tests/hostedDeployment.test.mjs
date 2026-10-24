import test from 'node:test';
import assert from 'node:assert/strict';
import {hostedKodaRoute} from '../build/hostedRouting.js';
import {hostedBookingEnabled} from '../build/hostedBuild.js';
import {automaticBookingConfig} from '../services/liveEventModel.js';

test('shared SPA fallback recognizes every KODA page and explicit HTML aliases', () => {
  for (const [slug, page] of Object.entries({
    '': 'home', about: 'about', gatherings: 'gatherings', event: 'event',
    my: 'my', join: 'join', 'chicken-chat': 'regular', halloween: 'halloween',
  })) {
    const base = `/koda${slug ? `/${slug}` : ''}`;
    for (const pathname of [base, `${base}/`, `${base}.html`, `${base}/index.html`]) {
      assert.deepEqual(hostedKodaRoute(pathname), {page, redirect: null}, pathname);
    }
    const legacy = base.replace('/koda', '/language-exchange');
    for (const pathname of [legacy, `${legacy}/`, `${legacy}.html`, `${legacy}/index.html`]) {
      assert.deepEqual(hostedKodaRoute(pathname), {page, redirect: `${base}/`}, pathname);
    }
  }
});

test('ordinary web, auth and payment routes never switch to KODA', () => {
  for (const pathname of [
    '/', '/index.html', '/download', '/guesthouses', '/contents/1646',
    '/login', '/login/email', '/auth/kakao/callback', '/register/phone',
    '/contents-reservation', '/contents-payment', '/my/reservations/contents',
    '/assets/app.js', '/koda-other/', '/koda/unknown/', '/koda/assets/logo.svg',
    '/language-exchange-other', '//koda/', '/koda/%2e%2e/login',
  ]) assert.equal(hostedKodaRoute(pathname), null, pathname);
});

test('branch deployment enables booking in a production bundle while local preview retains the dev guard', () => {
  const devApi = 'https://dev.ddakji.kr/api/v1';
  const prodApi = 'https://api.ddakji.kr/api/v1';
  assert.equal(hostedBookingEnabled(undefined, devApi), undefined);
  for (const [target, api] of [['dev', devApi], ['prod', prodApi]]) {
    assert.deepEqual(automaticBookingConfig('production', api, hostedBookingEnabled(target, api)), {enabled: true});
  }
  assert.equal(automaticBookingConfig('production', devApi), null);
  assert.equal(automaticBookingConfig('production', prodApi, false), null);
  assert.deepEqual(automaticBookingConfig('development', devApi), {enabled: true});
});

test('unknown or mixed deployment API settings fail before deployment', () => {
  for (const [target, api] of [
    ['dev', 'https://api.ddakji.kr/api/v1'], ['prod', 'https://dev.ddakji.kr/api/v1'],
    ['stage', 'https://dev.ddakji.kr/api/v1'], ['dev', ''],
    ['dev', 'http://dev.ddakji.kr/api/v1'], ['dev', 'https://dev.ddakji.kr/other'],
    ['dev', 'https://user:secret@dev.ddakji.kr/api/v1'],
    ['dev', 'https://dev.ddakji.kr/api/v1?token=x'],
  ]) assert.throws(() => hostedBookingEnabled(target, api));
});
