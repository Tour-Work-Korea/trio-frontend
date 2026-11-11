import {hostedKodaRoute} from './hostedRouting';
import '../styles/koda-hosted.css';

const route = hostedKodaRoute(window.location.pathname);
if (route?.redirect) {
  window.location.replace(
    route.redirect + window.location.search + window.location.hash,
  );
} else if (route) {
  document.documentElement.dataset.event = route.page;
  document.documentElement.dataset.kodaHosted = 'true';
  document.querySelector('meta[name="viewport"]')?.setAttribute(
    'content', 'width=device-width, initial-scale=1, viewport-fit=cover',
  );
  document.querySelector('link[rel="icon"]')?.setAttribute('href', '/koda-assets/koda-mark.svg');
  if (!document.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href;
    document.head.append(canonical);
  }
  if (import.meta.env.DEV) {
    import('../main.jsx');
  } else {
    const runtime = document.createElement('script');
    runtime.type = 'module';
    runtime.src = '/koda/entry.js';
    document.head.append(runtime);
  }
} else {
  import('../../../main.jsx');
}
