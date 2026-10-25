import React from 'react';

// Use the same real meetup photos and translated captions as the main gallery.
export default function PhotoBooth({items = [], language}) {
  const photos = items.filter(item => item.type !== 'video').slice(0, 4);
  if (!photos.length) return null;

  return (
    <div className="le-photo-booth">
      <div className="le-photo-slot" aria-hidden="true" />
      <div className="le-print-window">
        <figure className="le-photo-print">
          <div className="le-print-photos">
            {photos.map(photo => (
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.caption[language]}
                width="160"
                height="160"
              />
            ))}
          </div>
          <figcaption>
            <div>
              <strong>
                KODA
                <br />
                CLUB
              </strong>
              <span>
                SEOUL
                <br />
                LET’S TALK
              </span>
            </div>
            <p>Good people. Real moments.</p>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
