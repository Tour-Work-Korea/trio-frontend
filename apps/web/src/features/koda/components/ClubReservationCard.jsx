import React, {useState} from 'react';
import {
  reservationStatusLabel,
  reservationSummary,
  formatReservationSchedule,
} from '../services/clubAccountModel';
import {eventHref} from '../services/eventModel';

export default function ClubReservationCard({item, language}) {
  const ko = language === 'ko';
  const summary = reservationSummary(item);
  const [failedImage, setFailedImage] = useState(null);
  const date = formatReservationSchedule(summary.startDateTime, language);
  return (
    <article className="le-my-reservation">
      {summary.image && failedImage !== summary.image && (
        <img
          className="le-my-reservation-image"
          src={summary.image}
          alt=""
          loading="lazy"
          width="88"
          height="112"
          onError={() => setFailedImage(summary.image)}
        />
      )}
      <div className="le-my-reservation-info">
        <p className="le-my-reservation-status">
          {reservationStatusLabel(item, language)}
        </p>
        <h3>{summary.title || (ko ? '신청한 모임' : 'Your meetup')}</h3>
        {date ? (
          <time dateTime={date.dateTime}>
            {date.date} · {date.time} KST
          </time>
        ) : (
          <p className="le-my-reservation-location">
            {ko ? '일정 정보가 없어요.' : 'Schedule unavailable.'}
          </p>
        )}
        {summary.location && (
          <p className="le-my-reservation-location">{summary.location}</p>
        )}
        {item.event.detailAvailable !== false && (
          <a href={eventHref(item.event.id, language)}>
            {ko ? '모임 안내 보기' : 'View meetup'} ↗
          </a>
        )}
      </div>
    </article>
  );
}
