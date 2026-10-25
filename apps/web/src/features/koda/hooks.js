import {useEffect, useState} from 'react';
import {COLORS} from '@constants/colors';

// Native fragment navigation runs before asynchronous page content exists.
// Call from the ready page, then align once its fonts have settled.
export function useInitialFragmentNavigation() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    let cancelled = false;
    let frame;
    const cancel = () => {
      cancelled = true;
    };
    // Do not pull the visitor back after they start interacting with the page.
    const inputs = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
    inputs.forEach(type =>
      window.addEventListener(type, cancel, {passive: true}),
    );
    const removeListeners = () => {
      inputs.forEach(type => window.removeEventListener(type, cancel));
    };
    const align = () => {
      frame = window.requestAnimationFrame(() => {
        if (!cancelled && window.location.hash === hash) {
          document
            .getElementById(id)
            ?.scrollIntoView({behavior: 'instant', block: 'start'});
        }
        removeListeners();
      });
    };
    Promise.resolve(document.fonts?.ready).then(align, align);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      removeListeners();
    };
  }, []);
}

export function useEventClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function useEventMetadata({title, description, path, language, image}) {
  useEffect(() => {
    document.documentElement.style.backgroundColor = COLORS.grayscale_100;
    document.documentElement.lang = language;
    document.title = `${title.replace('\n', ' ')} | KODA CLUB`;
    const canonical = new URL(path, window.location.origin);
    canonical.searchParams.delete('lang');
    if (language === 'en') canonical.searchParams.set('lang', 'en');
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', canonical.href);
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
    ]) {
      document
        .querySelector(selector)
        ?.setAttribute('content', description.replace('\n', ' '));
    }
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', document.title);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', canonical.href);
    const imageMeta = document.querySelector('meta[property="og:image"]');
    if (image) {
      const meta = imageMeta || document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.setAttribute('content', new URL(image, window.location.origin).href);
      if (!imageMeta) document.head.append(meta);
    } else {
      imageMeta?.remove();
    }
  }, [title, description, path, language, image]);
}
