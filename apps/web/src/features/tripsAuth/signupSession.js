import {readJourney} from '../../../../trips/src/authModel.js';
export function activeTripsSignup() {
  try {
    return readJourney(window.sessionStorage)?.phase === 'active';
  } catch {
    return false;
  }
}
export function cancelTripsAuth() {
  try {
    const journey = readJourney(window.sessionStorage);
    if (journey?.phase !== 'active') return false;
    window.sessionStorage.removeItem('nangman-auth-journey');
    window.location.replace(journey.back);
    return true;
  } catch {
    return false;
  }
}
