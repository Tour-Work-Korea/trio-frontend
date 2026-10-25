import React, {useEffect, useRef} from 'react';
import '../styles/koda-motion.css';

// Progressive enhancement: content stays visible without motion or observer support.
export default function PageMotion({children}) {
  const root = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = root.current.querySelectorAll(
      '.le-hero-meta, .le-hero-display, .le-hero-description, ' +
        '.le-hub-section-heading, .le-club-closing, .le-list-heading, ' +
        '.le-about-page-heading, .le-about-story, .le-partner-introduction, ' +
        '.le-poster-wrap, .le-intro, .le-section',
    );
    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(({target, isIntersecting}) => {
          if (!isIntersecting) return;
          seen.add(target);
          observer.unobserve(target);
          if (!preference.matches && !target.contains(document.activeElement)) {
            target.classList.add('le-entered');
          }
        });
      },
      {threshold: 0.08},
    );
    const syncPreference = () => {
      observer.disconnect();
      targets.forEach(target => {
        if (preference.matches) target.classList.remove('le-entered');
        else if (!seen.has(target)) observer.observe(target);
      });
    };
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', syncPreference);
      targets.forEach(target => target.classList.remove('le-entered'));
    };
  }, []);

  return (
    <div className="le-motion-root" ref={root}>
      {children}
    </div>
  );
}
