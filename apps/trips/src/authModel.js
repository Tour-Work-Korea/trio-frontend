export const AUTH_KEY = 'nangman-auth-journey';
export const AUTH_TTL = 30 * 60 * 1000;
const allowed = new Set([
  '/trips/',
  '/trips/programs/',
  '/trips/reground-jeju/',
]);
export const programId = value =>
  /^[1-9]\d{0,9}$/.test(String(value)) ? Number(value) : null;

export function safeReturn(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  )
    return null;
  try {
    const url = new URL(value, 'https://ddakji.kr');
    if (url.origin !== 'https://ddakji.kr' || !allowed.has(url.pathname))
      return null;
    const query = new URLSearchParams();
    if (/^[1-3]$/.test(url.searchParams.get('day') || ''))
      query.set('day', url.searchParams.get('day'));
    const hash = /^#[a-zA-Z0-9_-]+$/.test(url.hash) ? url.hash : '';
    return `${url.pathname}${query.size ? `?${query}` : ''}${hash}`;
  } catch {
    return null;
  }
}
export function journeyFromSearch(search) {
  const query = new URLSearchParams(search);
  return {
    id: programId(query.get('apply')),
    back: safeReturn(query.get('back')) || '/trips/',
  };
}
export function loginHref({id, back}, resume = false) {
  const query = new URLSearchParams({back: safeReturn(back) || '/trips/'});
  if (programId(id)) query.set('apply', id);
  if (resume) query.set('resume', '1');
  return `/trips/login/?${query}`;
}
export function rememberJourney(storage, journey, now = Date.now()) {
  const value = {
    ...journey,
    id: programId(journey.id),
    back: safeReturn(journey.back) || '/trips/',
    createdAt: now,
    phase: 'pending',
  };
  storage.setItem(AUTH_KEY, JSON.stringify(value));
  // Verify storage is usable before leaving for OAuth; otherwise cancel safely.
  if (!readJourney(storage, now))
    throw new Error('로그인을 위해 브라우저 저장 공간을 허용해주세요.');
  return value;
}
export function readJourney(storage, now = Date.now()) {
  try {
    const v = JSON.parse(storage?.getItem(AUTH_KEY));
    if (
      safeReturn(v?.back) &&
      (v.id === null || programId(v.id)) &&
      ['pending', 'active'].includes(v.phase) &&
      Number.isFinite(v.createdAt) &&
      now >= v.createdAt &&
      now - v.createdAt < AUTH_TTL
    )
      return {...v, back: safeReturn(v.back), id: programId(v.id)};
    storage?.removeItem(AUTH_KEY);
  } catch {
    /* No valid journey. */
  }
  return null;
}
export function socialHref(journey) {
  const query = new URLSearchParams({tripsReturn: loginHref(journey, true)});
  return `/login/social?${query}#/SocialLogin?${new URLSearchParams({
    params: JSON.stringify({provider: 'KAKAO'}),
  })}`;
}

// Only the shared authentication shell runs this adapter. No account data is stored.
export function startAuthBridge({
  location,
  storage,
  events,
  schedule,
  unschedule,
  now = Date.now,
}) {
  const pending = readJourney(storage, now());
  if (!pending) return () => {};
  const authPath = path =>
    /^\/register(?:\/|$)/.test(path) || path === '/auth/kakao/callback';
  const explicit =
    location.pathname === '/login/social' &&
    new URLSearchParams(location.search).get('tripsReturn') ===
      loginHref(pending, true);
  const clear = () => {
    try {
      storage.removeItem(AUTH_KEY);
    } catch {}
  };
  if (!explicit && (!authPath(location.pathname) || pending.phase !== 'active')) {
    clear();
    return () => {};
  }
  if (explicit && pending.phase === 'active') {
    clear();
    location.replace(pending.back);
    return () => {};
  }
  pending.phase = 'active';
  try {
    storage.setItem(AUTH_KEY, JSON.stringify(pending));
  } catch {
    clear();
    location.replace(pending.back);
    return () => {};
  }
  let stopped = false;
  let timer;
  const stop = () => {
    stopped = true;
    unschedule(timer);
    events.removeEventListener('popstate', check);
    events.removeEventListener('pageshow', restored);
  };
  const leave = destination => {
    clear();
    stop();
    location.replace(destination);
  };
  const check = () => {
    if (stopped) return;
    if (now() - pending.createdAt >= AUTH_TTL) {
      clear();
      stop();
      return;
    }
    if (location.pathname === '/') leave(loginHref(pending, true));
    else if (
      /^\/login\/?$/.test(location.pathname) ||
      (location.pathname === '/login/social' && !explicit)
    )
      leave(pending.back);
    else if (
      location.pathname !== '/login/social' &&
      !authPath(location.pathname)
    ) {
      clear();
      stop();
    }
  };
  const restored = event => {
    if (event.persisted) leave(pending.back);
    else check();
  };
  timer = schedule(check, 100);
  events.addEventListener('popstate', check);
  events.addEventListener('pageshow', restored);
  check();
  return stop;
}

export function reservationBackTarget(params, isDetailsStep) {
  const back = safeReturn(params?.tripsBack);
  if (!back || !programId(params?.partyId)) return null;
  const guide =
    Array.isArray(params.partyAnnouncements) &&
    params.partyAnnouncements.some(x =>
      typeof x === 'string' ? x : x?.announcement,
    );
  return guide && isDetailsStep ? null : back;
}
