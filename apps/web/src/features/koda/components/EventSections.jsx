import React from 'react';

export function EventSection({id, title, children}) {
  return (
    <section className="le-section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

export function MeetupGallery({items = [], language, labels}) {
  return (
    <>
      <p className="le-gallery-hint">{labels.galleryHint}</p>
      <div
        className="le-gallery"
        tabIndex={0}
        role="region"
        aria-label={labels.memories}>
        {items.map(item => (
          <figure key={item.src}>
            {item.type === 'video' ? (
              <video
                controls
                playsInline
                preload="none"
                poster={item.poster}
                aria-label={item.caption[language]}>
                <source src={item.src} type="video/mp4" />
                <a href={item.src}>{labels.video}</a>
              </video>
            ) : (
              <a
                href={item.src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.caption[language]} · ${labels.photo}`}>
                <img
                  src={item.src}
                  alt={item.caption[language]}
                  loading="lazy"
                  decoding="async"
                  width="320"
                  height="360"
                />
              </a>
            )}
            <figcaption>{item.caption[language]}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
