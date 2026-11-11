import {bookingLabel, bookingState} from './liveEventModel.js';
import {registrationForms} from '../data/registrationForms.js';

export function internationalRegistrationUrl(
  event,
  formLink = registrationForms[event?.id],
  now = Date.now(),
) {
  if (!event || bookingState(event, now) !== 'open' || !formLink) return null;
  try {
    const url = new URL(formLink);
    if (url.protocol !== 'https:' || url.username || url.password || url.port)
      return null;
    const valid =
      (url.hostname === 'forms.gle' && /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) ||
      (url.hostname === 'docs.google.com' && /^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform$/.test(url.pathname));
    return valid ? url.href : null;
  } catch {
    return null;
  }
}

// All KODA meetups share the organizer's checkout link. Clear it when
// international card checkout ships to hide the temporary button.
export const paypalCheckoutLink = 'https://paypal.me/yangskorean/';

export function paypalCheckoutUrl(
  event,
  checkoutLink = paypalCheckoutLink,
  now = Date.now(),
) {
  if (!event || bookingState(event, now) !== 'open') return null;
  if (!checkoutLink) return null;
  try {
    const url = new URL(checkoutLink);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !['paypal.com', 'www.paypal.com', 'paypal.me', 'www.paypal.me'].includes(
        url.hostname,
      ) ||
      url.pathname === '/'
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

// Manual PayPal checkout does not create a platform reservation and therefore
// is independent of the domestic checkout rollout flag.
export function registrationLabel(event, language, now = Date.now()) {
  return bookingLabel(
    paypalCheckoutUrl(event, undefined, now)
      ? {...event, bookingEnabled: true}
      : event,
    language,
    now,
  );
}
