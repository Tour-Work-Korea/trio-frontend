import {startAuthReturnBridge} from './authReturn';
import {startBookingReturnBridge} from './bookingReturn';

let storage;
try {
  storage = window.sessionStorage;
} catch {
  storage = null;
}
const stop = startAuthReturnBridge({
  location: window.location,
  storage,
  events: window,
  schedule: window.setInterval.bind(window),
  unschedule: window.clearInterval.bind(window),
});
if (import.meta.hot) import.meta.hot.dispose(stop);
const stopBooking = startBookingReturnBridge({
  location: window.location,
  storage,
  events: window,
  schedule: window.setInterval.bind(window),
  unschedule: window.clearInterval.bind(window),
});
if (import.meta.hot) import.meta.hot.dispose(stopBooking);
