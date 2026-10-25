const pages = {
  '': 'home',
  about: 'about',
  gatherings: 'gatherings',
  event: 'event',
  my: 'my',
  join: 'join',
  'chicken-chat': 'regular',
  halloween: 'halloween',
};

// Only known KODA pages intercept the shared SPA fallback. Other app URLs keep
// the untouched Ddakji entry, including login, OAuth, reservations and payments.
export function hostedKodaRoute(pathname) {
  for (const prefix of ['/koda', '/language-exchange']) {
    for (const [slug, page] of Object.entries(pages)) {
      const base = slug ? `${prefix}/${slug}` : prefix;
      if (![base, `${base}/`, `${base}.html`, `${base}/index.html`].includes(pathname)) continue;
      return {
        page,
        redirect: prefix === '/language-exchange'
          ? `/koda/${slug ? `${slug}/` : ''}`
          : null,
      };
    }
  }
  return null;
}
