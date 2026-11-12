// Local preview only. Fixed upstream, GET-only, no cookies/tokens forwarded.
export function tripsPublicApiMiddleware(fetchImpl = fetch) {
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/trips-public-api/')) return next();
    const match = url.pathname.match(
      /^\/trips-public-api\/user\/parties\/(search|[1-9]\d*)$/,
    );
    if (!match) {
      res.statusCode = 404;
      res.end();
      return;
    }
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end();
      return;
    }
    const upstream = new URL(
      `https://api.ddakji.kr/api/v1/user/parties/${match[1]}`,
    );
    if (match[1] === 'search') {
      const page = url.searchParams.get('page') ?? '0';
      const size = url.searchParams.get('size') ?? '50';
      if (
        !/^\d{1,3}$/.test(page) ||
        !/^\d{1,2}$/.test(size) ||
        Number(size) < 1 ||
        Number(size) > 50
      ) {
        res.statusCode = 400;
        res.end();
        return;
      }
      upstream.search = new URLSearchParams({
        page,
        size,
        sortBy: 'RECOMMEND',
      }).toString();
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    try {
      const response = await fetchImpl(upstream.href, {
        method: 'GET',
        credentials: 'omit',
        redirect: 'error',
        headers: {'Accept-Language': 'ko'},
        signal: AbortSignal.timeout(10000),
      });
      res.statusCode = response.status;
      res.end(await response.text());
    } catch {
      res.statusCode = 502;
      res.end(JSON.stringify({message: '프로그램을 불러오지 못했습니다.'}));
    }
  };
}

export function tripsPublicApiPlugin() {
  return {
    name: 'trips-public-read-only-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(tripsPublicApiMiddleware());
    },
  };
}
