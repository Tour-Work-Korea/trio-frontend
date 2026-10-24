import {eventCatalog} from '../data/events.js';
import {normalizeGallery, toEventViewModel} from './eventModel.js';
import {normalizeReviews, reviewsForEvent} from './reviewModel.js';

// Only this data source needs replacing when a read API is agreed.
// Reject failed requests; do not silently replace server failures with fixtures.
export function createEventRepository(readCatalog) {
  const readEvents = async () => {
    const catalog = await readCatalog();
    if (!Array.isArray(catalog?.events))
      throw new Error('Invalid event catalog.');
    const events = catalog.events.map(toEventViewModel);
    if (new Set(events.map(event => event.id)).size !== events.length)
      throw new Error('Duplicate event IDs.');
    return {
      events,
      gallery: normalizeGallery(catalog.gallery),
      reviews: normalizeReviews(catalog.reviews).filter(
        review => review.published !== false,
      ),
    };
  };
  return {
    listEvents: readEvents,
    async getEventDetails(id) {
      const {events, reviews} = await readEvents();
      const event = events.find(item => item.id === id);
      if (!event) return null;
      return {
        event,
        ...reviewsForEvent(reviews, event),
        relatedEvents: event.relatedIds
          .map(relatedId => events.find(item => item.id === relatedId))
          .filter(Boolean),
      };
    },
  };
}

export const eventRepository = createEventRepository(async () => eventCatalog);
