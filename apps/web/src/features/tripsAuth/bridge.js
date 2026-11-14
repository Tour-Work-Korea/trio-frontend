import {startAuthBridge} from '../../../../trips/src/authModel.js';
let storage;
try {
  storage = window.sessionStorage;
} catch {
  /* Adapter stays inactive. */
}
const stop = startAuthBridge({
  location: window.location,
  storage,
  events: window,
  schedule: window.setInterval.bind(window),
  unschedule: window.clearInterval.bind(window),
});
if (import.meta.hot) import.meta.hot.dispose(stop);
