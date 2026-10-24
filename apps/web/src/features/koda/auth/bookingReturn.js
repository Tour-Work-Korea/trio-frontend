import {safeKodaReturn} from './authReturn.js';
import {bookingState} from '../services/liveEventModel.js';

export const BOOKING_RETURN_KEY = 'koda-booking-return';
const TTL = 60 * 60 * 1000;
const bookingPaths = new Set([
  '/contents-reservation',
  '/contents-payment',
  '/contents-payment/success',
  '/my/reservations/contents',
]);

export function reservationHref(event, language, now = Date.now(), returnTo) {
  if (
    bookingState(event, now) !== 'open' ||
    event.booking.params.partyId !== event.bookingPartyId
  ) {
    throw new Error('This meetup is not open for registration.');
  }
  const query = new URLSearchParams({
    params: JSON.stringify({
      ...event.booking.params,
      kodaBack:
        safeKodaReturn(returnTo) ||
        `/koda/gatherings/?lang=${
          language === 'en' ? 'en' : 'ko'
        }`,
    }),
    kodaBooking: `/koda/my/?lang=${
      language === 'en' ? 'en' : 'ko'
    }`,
  });
  return `/contents-reservation?${query}`;
}

function target(value) {
  const safe = safeKodaReturn(value);
  return safe?.startsWith('/koda/my/') ? safe : null;
}

// Opt-in adapter around the untouched shared reservation/payment screens.
// A return URL is navigation only; My KODA always reads actual server status.
export function startBookingReturnBridge({
  location,
  storage,
  events,
  schedule,
  unschedule,
  now = Date.now,
}) {
  let pending;
  try {
    const saved = JSON.parse(storage.getItem(BOOKING_RETURN_KEY));
    if (
      target(saved?.target) &&
      Number.isFinite(saved.createdAt) &&
      now() >= saved.createdAt &&
      now() - saved.createdAt < TTL
    ) {
      pending = saved;
    } else {
      storage.removeItem(BOOKING_RETURN_KEY);
    }
  } catch {
    /* Optional session storage. */
  }
  const incoming = target(
    new URLSearchParams(location.search).get('kodaBooking'),
  );
  if (incoming && location.pathname === '/contents-reservation') {
    pending = {target: incoming, createdAt: now()};
    try {
      storage.setItem(BOOKING_RETURN_KEY, JSON.stringify(pending));
    } catch {
      /* Same-page fallback. */
    }
  }
  if (!pending) {
    return () => {};
  }
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
      storage.removeItem(BOOKING_RETURN_KEY);
    } catch {
      /* Optional. */
    }
    stop();
  };
  const check = () => {
    if (stopped) {
      return;
    }
    if (now() - pending.createdAt >= TTL) {
      clear();
      return;
    }
    if (
      ['/contents-payment/success', '/my/reservations/contents'].includes(
        location.pathname,
      )
    ) {
      clear();
      location.replace(pending.target);
    } else if (!bookingPaths.has(location.pathname)) {
      clear();
    }
  };
  timer = schedule(check, 250);
  events.addEventListener('popstate', check);
  events.addEventListener('pageshow', check);
  check();
  return stop;
}
