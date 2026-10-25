import {API_BASE_URL} from '@env';
import userMeetApi from '@utils/api/userMeetApi';
import {eventCatalog} from '../data/events.js';
import {createBookingEventRepository} from './bookingEventRepository.js';
import {automaticBookingConfig} from './liveEventModel.js';

const config = automaticBookingConfig(
  import.meta.env.MODE,
  API_BASE_URL,
  import.meta.env.KODA_BOOKING_ENABLED,
);

export const eventRepository = createBookingEventRepository(
  eventCatalog,
  config,
  userMeetApi,
);
