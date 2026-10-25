import {createEventRepository} from './eventRepository.js';
import {toEventViewModel} from './eventModel.js';
import {reviewsForEvent} from './reviewModel.js';
import {
  bookingState,
  isClubContent,
  mapContent,
  partyIdFromEventId,
  readPlatformEvent,
  readPlatformListings,
} from './liveEventModel.js';

export function createBookingEventRepository(
  catalog,
  config,
  api,
  now = Date.now,
) {
  // Existing editorial links/photos/reviews remain available, without a booking
  // binding to a different server event. The two pre-admin meetups are local archives.
  const editorial = createEventRepository(async () => ({
    ...catalog,
    events: catalog.events.map(event => ({...event, bookingEnabled: false})),
  }));
  const bookingEnabled = config?.enabled === true;
  const view = record => toEventViewModel({...record, bookingEnabled});
  const readSelected = async eventId => {
    const partyId = partyIdFromEventId(eventId);
    if (!partyId) return null;
    const listings = await readPlatformListings(api);
    const listing = listings.find(item => item.partyId === partyId);
    if (!listing) return null;
    const record = await readPlatformEvent(api, listing);
    return record ? view(record) : null;
  };

  return {
    bookingEnabled,
    async listEvents() {
      const listings = await readPlatformListings(api);
      const records = await mapContent(listings, listing =>
        readPlatformEvent(api, listing),
      );
      const {events, gallery, reviews} = await editorial.listEvents();
      // These completed meetups predate admin registration. Keep their original
      // content/reviews in the public archive, never as bookable server events.
      const archives = events.filter(event =>
        ['itaewon', 'regular'].includes(event.id),
      );
      return {
        events: [...records.filter(Boolean).map(view), ...archives],
        gallery,
        reviews,
      };
    },
    async getEventDetails(id) {
      if (!partyIdFromEventId(id)) return editorial.getEventDetails(id);
      const event = await readSelected(id);
      if (!event) return null;
      const {reviews} = await editorial.listEvents();
      return {event, ...reviewsForEvent(reviews, event), relatedEvents: []};
    },
    async getBookingTarget(eventId) {
      if (!bookingEnabled) return null;
      // Always recheck the selected ID. Deletion/closure must never switch the
      // user to another event, even if only one other event remains available.
      const event = await readSelected(eventId);
      return event && bookingState(event, now()) === 'open' ? event : null;
    },
    async resolveReservationEvents(response) {
      if (!bookingEnabled) return {events: [], unavailablePartyIds: []};
      const reservations = Array.isArray(response)
        ? response
        : response?.content;
      if (!Array.isArray(reservations))
        throw new Error('Invalid reservation collection.');
      const ids = [...new Set(reservations.map(item => item.partyId))];
      if (ids.some(id => !Number.isSafeInteger(id) || id <= 0))
        throw new Error('Invalid party identity.');
      if (!ids.length) return {events: [], unavailablePartyIds: []};
      const listings = await readPlatformListings(api);
      const publishedIds = new Set(listings.map(item => item.partyId));
      const matches = await mapContent(ids, async partyId => {
        let data;
        try {
          ({data} = await api.getPartyDetail(partyId));
        } catch (error) {
          if ([404, 410].includes(error?.response?.status))
            return {unavailablePartyId: partyId};
          throw error;
        }
        if (data?.partyId !== partyId)
          throw new Error('Unexpected party identity.');
        // Hidden/closed bookings still belong in history. Only their public
        // detail link depends on whether the meetup is currently listed.
        return isClubContent(data)
          ? {
              id: `party-${partyId}`,
              bookingPartyId: partyId,
              detailAvailable:
                publishedIds.has(partyId) && data.isVisible !== false,
            }
          : null;
      });
      return {
        events: matches.filter(match => match?.bookingPartyId),
        unavailablePartyIds: matches
          .filter(match => match?.unavailablePartyId)
          .map(match => match.unavailablePartyId),
      };
    },
  };
}
