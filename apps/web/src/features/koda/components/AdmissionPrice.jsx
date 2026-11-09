import React from 'react';
import {useEventClock} from '../hooks';

export function earlyBirdActive(offer, now) {
  return Boolean(offer && now >= Date.parse(offer.startsAt) && now < Date.parse(offer.endsAt));
}

export default function AdmissionPrice({event, language}) {
  const now = useEventClock();
  return (
    <span className="le-admission-price">
      {earlyBirdActive(event.earlyBird, now) && (
        <>
          <span className="le-early-bird-badge">
            {language === 'ko' ? '얼리버드' : 'EARLY BIRD'}
          </span>
          <del>{event.earlyBird.regularPrice[language]}</del>
        </>
      )}
      <strong>{event.price[language]}</strong>
    </span>
  );
}
