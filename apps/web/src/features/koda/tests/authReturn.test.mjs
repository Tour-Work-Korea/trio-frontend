import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTH_RETURN_KEY,
  AUTH_RETURN_TTL,
  authHref,
  kakaoAuthHref,
  safeKodaReturn,
  readAuthReturn,
  startAuthReturnBridge,
} from '../auth/authReturn.js';

function storage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

function journey(pathname, search = '', saved = storage()) {
  let tick;
  let replaced;
  let stopped = false;
  const listeners = new Map();
  const location = {
    pathname,
    search,
    replace: target => {
      replaced = target;
    },
  };
  const dispose = startAuthReturnBridge({
    location,
    storage: saved,
    now: () => 1000,
    events: {
      addEventListener: (type, cb) => listeners.set(type, cb),
      removeEventListener: type => listeners.delete(type),
    },
    schedule: cb => {
      tick = cb;
      return 1;
    },
    unschedule: () => {
      stopped = true;
    },
  });
  return {
    location,
    saved,
    tick: () => tick?.(),
    result: () => replaced,
    active: () => Boolean(tick) && !stopped,
    dispose,
    listeners,
  };
}

test('auth links reuse login and USER registration with event, language and anchor preserved', () => {
  const target = '/koda/event/?id=halloween&lang=en#faq';
  const login = new URL(authHref(target), 'https://ddakji.kr');
  const register = new URL(authHref(target, true), 'https://ddakji.kr');
  assert.equal(login.pathname, '/login');
  assert.equal(login.searchParams.get('kodaReturn'), target);
  assert.equal(register.pathname, '/register/agree');
  assert.deepEqual(JSON.parse(register.searchParams.get('params')), {
    user: 'USER',
  });
});

test('return destinations reject external, disguised, unrelated and auth URLs', () => {
  for (const path of [
    'https://evil.test/',
    '//evil.test/',
    '/\\evil.test/',
    '/koda/../login',
    '/koda/auth/',
    '/my',
    'javascript:alert(1)',
    '/koda/%2e%2e/login',
  ]) {
    assert.equal(safeKodaReturn(path), null, path);
  }
  assert.equal(
    safeKodaReturn(
      '/koda/?lang=ko&token=secret&code=secret#meetups',
    ),
    '/koda/?lang=ko#meetups',
  );
});

test('ordinary app visitors do not start a return watcher', () => {
  const flow = journey('/login');
  assert.equal(flow.active(), false);
  assert.equal(flow.result(), undefined);
});

test('email login, signup steps and password recovery preserve one journey until MainTabs', () => {
  const flow = journey(
    '/login',
    '?kodaReturn=%2Fkoda%2Fevent%2F%3Fid%3Dregular%26lang%3Den',
  );
  for (const path of [
    '/login/email',
    '/find/password',
    '/register/agree',
    '/register/phone',
    '/register/profile',
    '/register/result',
  ]) {
    flow.location.pathname = path;
    flow.tick();
    assert.equal(flow.active(), true);
    assert.equal(flow.result(), undefined);
  }
  flow.location.pathname = '/';
  flow.tick();
  assert.equal(flow.result(), '/koda/event/?id=regular&lang=en');
  assert.equal(flow.saved.getItem(AUTH_RETURN_KEY), null);
  assert.equal(flow.active(), false);
  assert.equal(flow.listeners.size, 0);
});

test('OAuth reload keeps the return destination and login cancellation also returns to KODA', () => {
  const saved = storage();
  const initial = journey(
    '/login',
    '?kodaReturn=%2Fkoda%2F%3Flang%3Dko%23meetups',
    saved,
  );
  initial.dispose();
  const callback = journey('/auth/kakao/callback', '?code=not-stored', saved);
  assert.equal(callback.active(), true);
  assert.ok(!saved.getItem(AUTH_RETURN_KEY).includes('not-stored'));
  callback.dispose();
  const home = journey('/', '', saved);
  assert.equal(home.result(), '/koda/?lang=ko#meetups');
  const cancel = journey('/login', '?kodaReturn=%2Fkoda%2F');
  cancel.location.pathname = '/';
  cancel.tick();
  assert.equal(cancel.result(), '/koda/');
});

test('leaving auth for another app page cancels the journey', () => {
  const flow = journey('/login', '?kodaReturn=%2Fkoda%2F');
  flow.location.pathname = '/my';
  flow.tick();
  assert.equal(flow.result(), undefined);
  assert.equal(flow.saved.getItem(AUTH_RETURN_KEY), null);
  assert.equal(flow.active(), false);
});

test('expired, future or malformed state cannot redirect subsequent visits', () => {
  const saved = storage();
  for (const createdAt of [0, AUTH_RETURN_TTL + 1, null]) {
    saved.setItem(
      AUTH_RETURN_KEY,
      JSON.stringify({target: '/koda/', createdAt}),
    );
    assert.equal(readAuthReturn(saved, AUTH_RETURN_TTL), null);
  }
  saved.setItem(AUTH_RETURN_KEY, 'bad json');
  assert.equal(readAuthReturn(saved), null);
});

test('storage restrictions do not break the current login journey', () => {
  const denied = {
    getItem() {
      throw Error('denied');
    },
    setItem() {
      throw Error('denied');
    },
    removeItem() {
      throw Error('denied');
    },
  };
  const flow = journey('/login', '?kodaReturn=%2Fkoda%2F', denied);
  flow.location.pathname = '/';
  flow.tick();
  assert.equal(flow.result(), '/koda/');
});

test('Kakao entry reuses the web SocialLogin route and preserves the KODA return journey', () => {
  const destination = '/koda/event/?id=regular&lang=en#reviews';
  const url = new URL(kakaoAuthHref(destination), 'https://example.com');
  assert.equal(url.pathname, '/login/social');
  assert.equal(url.searchParams.get('kodaReturn'), destination);
  assert.equal(url.hash.split('?')[0], '#/SocialLogin');
  assert.deepEqual(
    JSON.parse(new URLSearchParams(url.hash.split('?')[1]).get('params')),
    {provider: 'KAKAO'},
  );
  const flow = journey(url.pathname, url.search);
  assert.equal(flow.active(), true);
  flow.location.pathname = '/auth/kakao/callback';
  flow.tick();
  assert.equal(flow.active(), true);
  flow.location.pathname = '/';
  flow.tick();
  assert.equal(flow.result(), destination);
  assert.equal(
    new URL(
      kakaoAuthHref('https://evil.example/'),
      'https://example.com',
    ).searchParams.get('kodaReturn'),
    '/koda/',
  );
});
