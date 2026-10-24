import React, {useEffect, useRef, useState} from 'react';
import useLocaleStore from '@stores/localeStore';
import {copy} from '../data/copy';
import {eventHref} from '../services/eventModel';
import EventHeader from '../components/EventHeader';
import {EventSection, MeetupGallery} from '../components/EventSections';
import {
  useEventClock,
  useEventMetadata,
  useInitialFragmentNavigation,
} from '../hooks';
import MeetupReviews from '../components/MeetupReviews';
import ProgramDescription from '../components/ProgramDescription';
import {useClubAuth} from '../auth/ClubAuth';
import {eventRepository} from '../services/liveEventRepository';
import {bookingLabel, bookingState} from '../services/liveEventModel';
import {reservationHref} from '../auth/bookingReturn';
import '../styles/koda.css';
import '../styles/koda-detail.css';

export default function KodaEventPage({
  event,
  relatedEvents = [],
  reviews = [],
  reviewsFromOtherMeetups = false,
}) {
  const language = useLocaleStore(state => state.language);
  const labels = copy[language];
  const [notice, setNotice] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const bookingLock = useRef(false);
  const {ready, authenticated, openLogin} = useClubAuth();
  const now = useEventClock();
  const ended = now >= Date.parse(event.endsAt);
  const availability = bookingState(event, now);
  const canApply = event.bookingEnabled && availability === 'open';
  const title = event.title[language];
  useInitialFragmentNavigation();

  useEventMetadata({
    title,
    description: event.intro[language],
    path: event.path,
    language,
    image: event.poster,
  });

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const share = async () => {
    const url = new URL(event.path, window.location.origin);
    url.searchParams.set('lang', language);
    try {
      if (navigator.share) {
        await navigator.share({title: document.title, url: url.href});
      } else {
        await navigator.clipboard.writeText(url.href);
        setNotice(labels.copied);
      }
    } catch (error) {
      if (error.name !== 'AbortError') setNotice(labels.shareError);
    }
  };

  const apply = async () => {
    if (!ready || !canApply || bookingLock.current) return;
    if (!authenticated) {
      openLogin();
      return;
    }
    bookingLock.current = true;
    setBookingBusy(true);
    setBookingError('');
    try {
      // Recheck this exact meetup before the shared form fetches its quote.
      const target = await eventRepository.getBookingTarget(event.id);
      if (!target || bookingState(target) !== 'open') {
        setBookingError(
          language === 'ko'
            ? '이 모임은 현재 신청할 수 없어요. 모임 목록에서 일정을 다시 확인해 주세요.'
            : 'This meetup is no longer available for registration. Please check the meetup list.',
        );
        return;
      }
      window.location.assign(
        reservationHref(
          target,
          language,
          Date.now(),
          eventHref(event.id, language),
        ),
      );
    } catch {
      setBookingError(
        language === 'ko'
          ? '신청 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
          : 'Couldn’t load registration details. Please try again.',
      );
    } finally {
      bookingLock.current = false;
      setBookingBusy(false);
    }
  };

  return (
    <div className="le-page le-page--detail">
      <a className="le-skip" href="#event-content">
        {labels.skip}
      </a>
      <EventHeader detail />

      <main id="event-content">
        {event.cover && (
          <div className="le-poster-wrap">
            <img
              className="le-poster"
              src={event.poster}
              alt={event.cover.alt[language] || title}
              width={event.cover.width}
              height={event.cover.height}
              fetchPriority="high"
            />
          </div>
        )}
        <div className="le-content">
          <div className="le-intro">
            <div className="le-badges">
              <span>{ended ? labels.ended : labels.upcoming}</span>
            </div>
            {event.edition && <p className="le-eyebrow">{event.edition}</p>}
            <h1>{title}</h1>
            {event.intro[language] && (
              <p className="le-lede">{event.intro[language]}</p>
            )}
            {reviews.length > 0 && (
              <a className="le-review-jump" href="#reviews">
                ★{' '}
                {language === 'ko'
                  ? `${reviewsFromOtherMeetups ? '지난 모임 ' : ''}후기 ${
                      reviews.length
                    }개`
                  : `${reviews.length} ${
                      reviewsFromOtherMeetups ? 'past meetup ' : ''
                    }reviews`}{' '}
                ↓
              </a>
            )}
            <dl className="le-facts">
              <div>
                <dt>{labels.date}</dt>
                <dd>
                  <time dateTime={event.startsAt}>{event.date[language]}</time>
                  <small>{event.time[language]}</small>
                </dd>
              </div>
              <div>
                <dt>{labels.venue}</dt>
                <dd>
                  {event.venue[language]}
                  {event.address[language] && (
                    <small>{event.address[language]}</small>
                  )}
                  {event.mapUrl && (
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer">
                      {labels.map} ↗
                    </a>
                  )}
                </dd>
              </div>
              <div>
                <dt>{labels.price}</dt>
                <dd>
                  <strong>{event.price[language]}</strong>
                  {event.priceNote[language] && (
                    <small>{event.priceNote[language]}</small>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {(event.program.length > 0 ||
            event.programDescription[language] ||
            event.programImage ||
            event.detailImages.length > 0) && (
            <EventSection id="program" title={labels.program}>
              {event.programDescription[language] && (
                <ProgramDescription text={event.programDescription[language]} />
              )}
              {event.program.length > 0 && (
                <ol className="le-program">
                  {event.program.map((step, index) => (
                    <li key={index}>
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p>{step[language]}</p>
                    </li>
                  ))}
                </ol>
              )}
              {event.programImage && (
                <img
                  className="le-program-poster"
                  src={event.programImage.url}
                  alt={event.programImage.alt[language] || labels.program}
                  width={event.programImage.width}
                  height={event.programImage.height}
                  loading="lazy"
                />
              )}
              {event.detailImages.length > 0 && (
                <div className="le-detail-images" id="event-images">
                  {event.detailImages.map((image, index) => (
                    <a
                      key={image.src}
                      href={image.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${labels.detailImages} ${index + 1} · ${
                        labels.photo
                      }`}>
                      <img
                        src={image.src}
                        alt={`${labels.detailImages} ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  ))}
                </div>
              )}
            </EventSection>
          )}
          {(event.introduction.length > 0 || event.about.length > 0) && (
            <EventSection id="about" title={labels.about}>
              {event.introduction.map((item, index) => (
                <div className="le-introduction-block" key={index}>
                  {item.images.length > 0 && (
                    <div className="le-detail-images">
                      {item.images.map((image, imageIndex) => (
                        <a
                          key={image.src}
                          href={image.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${
                            item.title[language] || labels.about
                          } · ${labels.photo} ${imageIndex + 1}`}>
                          <img
                            src={image.src}
                            alt={`${item.title[language] || labels.about} ${
                              imageIndex + 1
                            }`}
                            loading="lazy"
                            decoding="async"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  {item.title[language] && <h3>{item.title[language]}</h3>}
                  {item.description[language] && (
                    <ProgramDescription text={item.description[language]} />
                  )}
                </div>
              ))}
              {event.about.map((paragraph, index) => (
                <p key={index}>{paragraph[language]}</p>
              ))}
            </EventSection>
          )}
          <MeetupReviews
            reviews={reviews}
            language={language}
            otherMeetups={reviewsFromOtherMeetups}
          />
          {event.faqs.length > 0 && (
            <EventSection id="faq" title={labels.faq}>
              {event.faqs.map((faq, index) => (
                <details className="le-faq" key={index}>
                  <summary>{faq.question[language]}</summary>
                  <p>{faq.answer[language]}</p>
                </details>
              ))}
            </EventSection>
          )}
          {event.gallery.length > 0 && (
            <EventSection id="memories" title={labels.memories}>
              <MeetupGallery
                items={event.gallery}
                language={language}
                labels={labels}
              />
            </EventSection>
          )}
          {relatedEvents.length > 0 && (
            <EventSection id="related" title={labels.related}>
              {relatedEvents.map(otherEvent => (
                <a
                  key={otherEvent.id}
                  className="le-related"
                  href={eventHref(otherEvent.id, language)}>
                  {otherEvent.poster && (
                    <img
                      src={otherEvent.poster}
                      alt=""
                      width="64"
                      height="80"
                      loading="lazy"
                    />
                  )}
                  <span>
                    <strong>
                      {otherEvent.title[language].replace('\n', ' ')}
                    </strong>
                    <small>{otherEvent.date[language]}</small>
                    <em>{labels.detail} →</em>
                  </span>
                </a>
              ))}
            </EventSection>
          )}
          <footer className="le-footer">
            <button className="le-share" type="button" onClick={share}>
              {labels.share} ↗
            </button>
            {event.organizer[language] && (
              <p>Hosted by {event.organizer[language]}</p>
            )}
          </footer>
        </div>
      </main>
      <aside className="le-booking" aria-label={labels.admission}>
        <p>
          {canApply
            ? language === 'ko'
              ? '참가 정보와 요금을 확인하고 신청해 주세요.'
              : 'Review your details and price to register.'
            : availability === 'closed'
            ? language === 'ko'
              ? '현재 신청이 마감되었어요.'
              : 'Registration is currently closed.'
            : ended
            ? labels.closedNote
            : labels.preparingNote}
        </p>
        {bookingError && <p role="alert">{bookingError}</p>}
        <button
          className="le-registration-button"
          type="button"
          aria-busy={bookingBusy}
          disabled={!ready || bookingBusy || !canApply}
          onClick={apply}>
          {bookingBusy
            ? language === 'ko'
              ? '확인 중…'
              : 'Checking…'
            : canApply
            ? language === 'ko'
              ? '신청하기'
              : 'Register'
            : bookingLabel(event, language, now)}
        </button>
      </aside>
      <div className="le-toast" role="status" aria-live="polite">
        {notice}
      </div>
    </div>
  );
}
