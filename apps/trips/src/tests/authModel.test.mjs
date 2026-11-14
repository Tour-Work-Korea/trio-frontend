import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTH_KEY,
  AUTH_TTL,
  safeReturn,
  loginHref,
  journeyFromSearch,
  rememberJourney,
  readJourney,
  socialHref,
  startAuthBridge,
  reservationBackTarget,
} from '../authModel.js';
const memory = () => {
  const map = new Map();
  return {
    getItem: k => map.get(k),
    setItem: (k, v) => map.set(k, v),
    removeItem: k => map.delete(k),
  };
};
const journey = {id: 4133, back: '/trips/reground-jeju/?day=2#class-4133'};
function setup(path, search = '', store = memory()) {
  const callbacks = {};
  let tick;
  const replacements = [];
  const location = {pathname: path, search, replace: x => replacements.push(x)};
  let clock = 1000;
  const stop = startAuthBridge({
    location,
    storage: store,
    events: {
      addEventListener: (n, f) => (callbacks[n] = f),
      removeEventListener: n => delete callbacks[n],
    },
    schedule: f => {
      tick = f;
      return 1;
    },
    unschedule: () => {},
    now: () => clock,
  });
  return {
    location,
    replacements,
    callbacks,
    tick: () => tick?.(),
    stop,
    expire: () => (clock += AUTH_TTL),
  };
}
test('return destinations cannot redirect externally or leak auth query fields', () => {
  for (const x of [
    'https://evil.test',
    '//evil.test',
    '/\\evil.test/trips/',
    '/login',
    '/trips/login/',
    '/trips/../login',
  ])
    assert.equal(safeReturn(x), null);
  assert.equal(
    safeReturn('/trips/?code=secret&day=2#schedule'),
    '/trips/?day=2#schedule',
  );
  assert.deepEqual(
    journeyFromSearch(new URL(loginHref(journey), 'https://ddakji.kr').search),
    journey,
  );
});
test('storage must be available and stale state expires', () => {
  const s = memory();
  rememberJourney(s, journey, 1000);
  assert.equal(readJourney(s, 1000).id, 4133);
  assert.equal(readJourney(s, 1000 + AUTH_TTL), null);
  assert.throws(() =>
    rememberJourney(
      {
        setItem() {
          throw Error('blocked');
        },
      },
      journey,
    ),
  );
});
test('ordinary web and KODA auth remain inactive, even with abandoned travel state', () => {
  for (const path of ['/', '/login', '/koda/', '/contents/3861']) {
    const s = memory();
    rememberJourney(s, journey, 1000);
    const h = setup(path, '', s);
    h.tick();
    assert.deepEqual(h.replacements, []);
    assert.equal(readJourney(s, 1000), null);
  }
  const h = setup('/auth/kakao/callback');
  h.location.pathname = '/';
  h.tick();
  assert.deepEqual(h.replacements, []);
});
test('existing login and new signup return to the same requested class', () => {
  for (const path of [
    '/auth/kakao/callback',
    '/register/phone',
    '/register/agree',
    '/register/profile',
  ]) {
    const s = memory();
    rememberJourney(s, journey, 1000);
    s.setItem(AUTH_KEY, JSON.stringify({...readJourney(s, 1000), phase: 'active'}));
    const h = setup(path, '', s);
    h.location.pathname = '/';
    h.tick();
    assert.deepEqual(h.replacements, [loginHref(journey, true)]);
    assert.equal(readJourney(s, 1000), null);
    h.tick();
    assert.equal(h.replacements.length, 1);
  }
});
test('OAuth close, browser-back restoration and reloaded entry return to trip without auth loop', () => {
  const search = new URL(socialHref(journey), 'https://ddakji.kr').search;
  for (const kind of ['close', 'bfcache', 'reload']) {
    const s = memory();
    rememberJourney(s, journey, 1000);
    const h = setup('/login/social', search, s);
    if (kind === 'close') {
      h.location.pathname = '/login';
      h.tick();
    }
    if (kind === 'bfcache') h.callbacks.pageshow({persisted: true});
    if (kind === 'reload') {
      const reloaded = setup('/login/social', search, s);
      assert.deepEqual(reloaded.replacements, [journey.back]);
      continue;
    }
    assert.deepEqual(h.replacements, [journey.back]);
  }
});
test('expired pending auth does not hijack subsequent main navigation', () => {
  const s = memory();
  rememberJourney(s, journey, 1000);
  const h = setup('/register/profile', '', s);
  h.expire();
  h.location.pathname = '/';
  h.tick();
  assert.deepEqual(h.replacements, []);
});
test('an unstarted travel login cannot capture an ordinary signup or callback', () => {
  for (const path of ['/register/profile', '/auth/kakao/callback']) {
    const s = memory();
    rememberJourney(s, journey, 1000);
    const h = setup(path, '', s);
    h.location.pathname = '/';
    h.tick();
    assert.deepEqual(h.replacements, []);
    assert.equal(readJourney(s, 1000), null);
  }
});
test('reservation back retains guide step and leaves ordinary/KODA reservations unchanged', () => {
  const params = {
    partyId: 3861,
    tripsBack: journey.back,
    partyAnnouncements: [{announcement: '안내'}],
  };
  assert.equal(reservationBackTarget(params, true), null);
  assert.equal(reservationBackTarget(params, false), journey.back);
  assert.equal(
    reservationBackTarget({...params, partyAnnouncements: []}, true),
    journey.back,
  );
  assert.equal(
    reservationBackTarget({partyId: 3861, kodaBack: '/koda/'}, false),
    null,
  );
});
