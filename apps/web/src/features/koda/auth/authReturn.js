export const AUTH_RETURN_KEY = 'koda-auth-return';
export const AUTH_RETURN_TTL = 30 * 60 * 1000;
const allowedPaths = new Set([
  '/koda/',
  '/koda/gatherings/',
  '/koda/about/',
  '/koda/my/',
  '/koda/event/',
  '/koda/chicken-chat/',
  '/koda/halloween/',
]);

// Store only a local KODA destination, never auth parameters or external URLs.
export function safeKodaReturn(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  )
    return null;
  try {
    const url = new URL(value, 'https://koda.invalid');
    if (
      url.origin !== 'https://koda.invalid' ||
      !allowedPaths.has(url.pathname)
    )
      return null;
    const query = new URLSearchParams();
    const id = url.searchParams.get('id');
    const lang = url.searchParams.get('lang');
    if (id && /^[a-zA-Z0-9_-]{1,80}$/.test(id)) query.set('id', id);
    if (lang === 'ko' || lang === 'en') query.set('lang', lang);
    const hash = /^#[a-zA-Z0-9_-]+$/.test(url.hash) ? url.hash : '';
    return `${url.pathname}${query.size ? `?${query}` : ''}${hash}`;
  } catch {
    return null;
  }
}

export function authHref(destination, register = false) {
  const query = new URLSearchParams({
    kodaReturn: safeKodaReturn(destination) || '/koda/',
  });
  if (register) query.set('params', JSON.stringify({user: 'USER'}));
  return `${register ? '/register/agree' : '/login'}?${query}`;
}

// Reuse the existing web navigator's supported legacy route for SocialLogin.
// Keep the /login prefix so the return bridge survives the OAuth round trip.
export function kakaoAuthHref(destination) {
  return socialAuthHref(destination, 'KAKAO');
}

export function socialAuthHref(destination, provider) {
  if (!['KAKAO', 'GOOGLE'].includes(provider))
    throw new Error('Unsupported provider');
  const query = new URLSearchParams({
    kodaReturn: safeKodaReturn(destination) || '/koda/',
  });
  const route = new URLSearchParams({
    params: JSON.stringify(
      provider === 'GOOGLE' ? {provider, koda: true} : {provider},
    ),
  });
  return `/login/social?${query}#/SocialLogin?${route}`;
}

export function isAuthPath(pathname) {
  return (
    /^\/(login|register|find)(\/|$)/.test(pathname) ||
    pathname === '/auth/kakao/callback'
  );
}

export function readAuthReturn(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(AUTH_RETURN_KEY));
    const target = safeKodaReturn(value?.target);
    if (
      !target ||
      !Number.isFinite(value?.createdAt) ||
      now < value.createdAt ||
      now - value.createdAt >= AUTH_RETURN_TTL
    ) {
      storage.removeItem(AUTH_RETURN_KEY);
      return null;
    }
    return {...value, target};
  } catch {
    return null;
  }
}

// The existing navigator writes history without a route-change event.
// Watch only while a KODA auth journey is active; no global history patches.
export function startAuthReturnBridge({
  location,
  storage,
  events,
  schedule,
  unschedule,
  now = Date.now,
}) {
  let pending = readAuthReturn(storage, now());
  const incoming = safeKodaReturn(
    new URLSearchParams(location.search).get('kodaReturn'),
  );
  if (incoming && isAuthPath(location.pathname)) {
    pending = {target: incoming, createdAt: now()};
    try {
      storage.setItem(AUTH_RETURN_KEY, JSON.stringify(pending));
    } catch {
      /* Same-page fallback. */
    }
  }
  if (!pending) return () => {};
  let timer;
  let stopped = false;
  const stop = () => {
    stopped = true;
    unschedule(timer);
    events.removeEventListener('popstate', check);
    events.removeEventListener('pageshow', check);
  };
  const clear = () => {
    try {
      storage.removeItem(AUTH_RETURN_KEY);
    } catch {
      /* Storage may be unavailable. */
    }
    stop();
  };
  const check = () => {
    if (stopped) return;
    if (now() - pending.createdAt >= AUTH_RETURN_TTL) {
      clear();
      return;
    }
    // Login success and the existing close button both reset to MainTabs (/).
    if (location.pathname === '/') {
      clear();
      location.replace(pending.target);
    } else if (!isAuthPath(location.pathname)) {
      clear();
    }
  };
  timer = schedule(check, 250);
  events.addEventListener('popstate', check);
  events.addEventListener('pageshow', check);
  check();
  return stop;
}
