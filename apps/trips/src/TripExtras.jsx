import React from 'react';
import './trip-extras.css';

export default function TripExtras({trip}) {
  return (
    <section
      className="te-extras"
      id="trip-calendar"
      aria-labelledby="trip-extras-title">
      <span className="te-kicker">더 하고 싶다면</span>
      <h2 id="trip-extras-title">클래스와 연말파티</h2>
      <p>
        워케이션에 참여하면서
        <br />
        클래스와 연말파티도 별도로 신청할 수 있어요.
      </p>
      <div className="te-extras-list">
        {trip.classes.map(item => (
          <a href={item.url} key={item.partyId}>
            <span>
              <strong>{item.subtitle}</strong>
              <small>{item.date} · 별도 신청</small>
            </span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
        <a href={trip.optionalParty.url}>
          <span>
            <strong>{trip.optionalParty.title}</strong>
            <small>{trip.optionalParty.date} · 별도 신청</small>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
