import {safeKodaReturn} from './authReturn.js';

// The shared form uses an internal guide step before participant details.
// Preserve that step, but exit immediately if there is no guide to go back to.
export function reservationBackTarget(params, isDetailsStep) {
  const target = safeKodaReturn(params?.kodaBack);
  if (!target) return null;
  const hasGuide =
    Array.isArray(params.partyAnnouncements) &&
    params.partyAnnouncements.some(item =>
      typeof item === 'string' ? Boolean(item) : Boolean(item?.announcement),
    );
  return hasGuide && isDetailsStep ? null : target;
}
