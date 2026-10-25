import React, {useEffect, useRef, useState} from 'react';
import {reviewSeries} from '../data/reviews';
import {eventHref} from '../services/eventModel';
import '../styles/koda-reviews.css';

function ReviewCard({review, language, linkToEvent, home}) {
  const [expanded, setExpanded] = useState(false);
  const series = reviewSeries[review.seriesId];
  const ko = language === 'ko';
  const long = review.text.length > 90;
  return (
    <article className="le-review-card">
      <div className="le-review-card-top">
        {!home && <span>{series?.label[language] || 'Language Exchange'}</span>}
        <span
          className="le-review-stars"
          aria-label={
            ko
              ? `5점 만점에 ${review.rating}점`
              : `${review.rating} out of 5 stars`
          }>
          <span aria-hidden="true">
            {'★'.repeat(review.rating)}
            <i>{'★'.repeat(5 - review.rating)}</i>
          </span>
        </span>
      </div>
      <span className="le-review-quote" aria-hidden="true">
        “
      </span>
      <blockquote
        className={
          !expanded && long
            ? 'le-review-text le-review-text--short'
            : 'le-review-text'
        }
        id={`review-${review.id}`}>
        {review.text}
      </blockquote>
      {long && (
        <button
          className="le-review-expand"
          type="button"
          aria-expanded={expanded}
          aria-controls={`review-${review.id}`}
          onClick={() => setExpanded(!expanded)}>
          {ko
            ? expanded
              ? '접기 −'
              : '전체 읽기 +'
            : expanded
            ? 'Read less −'
            : 'Read more +'}
        </button>
      )}
      <footer>
        <div>
          <strong>{review.nickname}</strong>
          <time dateTime={review.eventDate.slice(0, 7)}>
            {review.eventDate.slice(0, 7).replace('-', '.')}
          </time>
        </div>
        {linkToEvent && series && (
          <a href={`${eventHref(series.eventId, language)}#reviews`}>
            {ko ? '모임 보기' : 'Meetup'} ↗
          </a>
        )}
      </footer>
    </article>
  );
}

export default function MeetupReviews({
  reviews = [],
  language,
  home = false,
  otherMeetups = false,
}) {
  const [edges, setEdges] = useState({start: true, end: false});
  const track = useRef(null);
  const ko = language === 'ko';
  const title = home
    ? ko
      ? '참여자 후기'
      : 'Participant reviews'
    : otherMeetups
    ? ko
      ? '지난 언어교환 후기'
      : 'From our past meetups'
    : ko
    ? '참여자 후기'
    : 'Participant reviews';
  const updateEdges = () => {
    const node = track.current;
    if (node)
      setEdges({
        start: node.scrollLeft <= 1,
        end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2,
      });
  };
  useEffect(() => {
    track.current?.scrollTo({left: 0, behavior: 'instant'});
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, [reviews]);
  const move = direction => {
    const node = track.current;
    const card = node?.firstElementChild;
    node?.scrollBy({
      left:
        direction *
        ((card?.getBoundingClientRect().width || node.clientWidth) + 12),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  if (!reviews.length) return null;
  return (
    <section
      className={`le-reviews${home ? ' le-reviews--home' : ''}`}
      id="reviews"
      aria-labelledby="reviews-title">
      <header className="le-review-heading">
        <p className="le-review-eyebrow">REVIEWS</p>
        <h2 id="reviews-title">{title}</h2>
        {otherMeetups && (
          <p>
            {ko
              ? '이태원·치킨 언어교환 참여자들의 후기예요.'
              : 'Reviews from our Itaewon and Chicken & Chat gatherings.'}
          </p>
        )}
      </header>
      <div
        className="le-review-track"
        ref={track}
        onScroll={updateEdges}
        tabIndex={0}
        role="region"
        aria-label={ko ? '참가자 후기 목록' : 'Participant reviews'}>
        {reviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            language={language}
            home={home}
            linkToEvent={otherMeetups}
          />
        ))}
      </div>
      <div className="le-review-controls">
        <span>
          {ko ? '옆으로 넘겨 더 읽어보세요' : 'More stories, one swipe away'}
        </span>
        <div>
          <button
            type="button"
            disabled={edges.start}
            aria-label={ko ? '이전 후기' : 'Previous reviews'}
            onClick={() => move(-1)}>
            ←
          </button>
          <button
            type="button"
            disabled={edges.end}
            aria-label={ko ? '다음 후기' : 'Next reviews'}
            onClick={() => move(1)}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}
