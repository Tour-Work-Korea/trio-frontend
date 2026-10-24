import React from 'react';

// Keep each app introduction focused on its description and website.
export default function ClubPartner({partner, language}) {
  return (
    <article
      className="le-partner-introduction"
      id={partner.id}
      aria-labelledby={`${partner.id}-title`}>
      <h3 id={`${partner.id}-title`}>
        {partner.name[language]}
        {partner.nameNote?.[language] && (
          <>
            {' '}
            <span className="le-partner-name-note">
              {partner.nameNote[language]}
            </span>
          </>
        )}
      </h3>
      <p>{partner.description[language]}</p>
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${partner.name[language]} · ${
          language === 'ko'
            ? '웹사이트, 새 탭에서 열림'
            : 'Website, opens in a new tab'
        }`}>
        <span>
          {language === 'ko' ? '웹사이트 둘러보기' : 'Visit website'}
          <small>{partner.domain}</small>
        </span>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}
