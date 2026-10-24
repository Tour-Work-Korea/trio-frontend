import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig, mergeConfig} from 'vite';
import webConfig from './vite.config.js';
import {hostedBookingEnabled} from './src/features/koda/hosting/hostedBuild.js';

const webRoot = path.dirname(fileURLToPath(import.meta.url));

// Opt-in multipage build: reuse every existing alias, plugin and web entry.
// The original web config and source entry stay unchanged on disk.
export default defineConfig(environment => {
  const baseConfig = webConfig(environment);
  const clientEnv = JSON.parse(baseConfig.define['globalThis.__TRIO_ENV__']);
  // Keep the shared .env and normal web configuration unchanged. Both KODA
  // and its reused login routes must use the same backend in this dev server.
  if (environment.mode === 'development') {
    clientEnv.API_BASE_URL = 'https://dev.ddakji.kr/api/v1';
    // The shared web payment screen opens a backend-rendered Toss page.
    clientEnv.WEB_BASE_URL = 'https://dev.ddakji.kr';
  }
  const bookingEnabled = environment.command === 'build'
    ? hostedBookingEnabled(process.env.KODA_DEPLOY_TARGET, clientEnv.API_BASE_URL)
    : undefined;
  return mergeConfig(baseConfig, {
    root: webRoot,
    define: {
      'globalThis.__TRIO_ENV__': JSON.stringify(clientEnv),
      ...(bookingEnabled === undefined ? {} : {
        'import.meta.env.KODA_BOOKING_ENABLED': JSON.stringify(bookingEnabled),
      }),
    },
    plugins: [
      {
        name: 'koda-legacy-addresses',
        enforce: 'post',
        generateBundle(_, bundle) {
          for (const name of Object.keys(bundle)) {
            if (!(name === 'koda.html' || name.startsWith('koda/')) || !name.endsWith('.html')) continue;
            const target = `/${name.replace(/(?:\/index)?\.html$/, '/')}`;
            this.emitFile({
              type: 'asset',
              fileName: name.replace(/^koda/, 'language-exchange'),
              source: `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex"><title>KODA CLUB</title><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script><a href="${target}">KODA CLUB</a></html>`,
            });
          }
        },
      },
      {
        name: 'koda-reservation-back-header',
        enforce: 'pre',
        resolveId(source, importer) {
          const appSrc = path.resolve(webRoot, '../../packages/app/src');
          if (
            importer?.split('?')[0] ===
              path.join(
                appSrc,
                'screens/(Common)/Meet/MeetReservation/index.js',
              ) &&
            (source === '@components/Header' ||
              source === path.join(appSrc, 'components/Header'))
          ) {
            return path.join(
              webRoot,
              'src/features/koda/components/KodaReservationHeader.jsx',
            );
          }
        },
      },
      {
        name: 'koda-auth-return-bridge',
        transformIndexHtml: {
          order: 'pre',
          handler(html, context) {
            if (context.filename !== path.join(webRoot, 'index.html'))
              return html;
            const sourceEntry = 'src="/src/main.jsx"';
            if (!html.includes(sourceEntry)) throw new Error('The shared web HTML entry changed; review the KODA build adapter.');
            return {
              html: html.replace(sourceEntry, 'src="/src/features/koda/hosting/hostedEntry.jsx"'),
              tags: [{
                tag: 'script',
                attrs: {
                  type: 'module',
                  src: '/src/features/koda/auth/authBridge.js',
                },
                injectTo: 'head',
              }],
            };
          },
        },
      },
    ],
    build: {
      outDir: 'dist-koda',
      rollupOptions: {
        input: {
          app: path.join(webRoot, 'index.html'),
          clubJoin: path.join(webRoot, 'koda/join/index.html'),
          clubJoinRedirect: path.join(webRoot, 'koda/join.html'),
          clubMy: path.join(webRoot, 'koda/my/index.html'),
          clubMyRedirect: path.join(webRoot, 'koda/my.html'),
          about: path.join(webRoot, 'koda/about/index.html'),
          aboutRedirect: path.join(webRoot, 'koda/about.html'),
          gatherings: path.join(
            webRoot,
            'koda/gatherings/index.html',
          ),
          gatheringsRedirect: path.join(
            webRoot,
            'koda/gatherings.html',
          ),
          event: path.join(webRoot, 'koda/event/index.html'),
          eventRedirect: path.join(webRoot, 'koda/event.html'),
          kodaRedirect: path.join(
            webRoot,
            'koda.html',
          ),
          halloweenRedirect: path.join(
            webRoot,
            'koda/halloween.html',
          ),
          koda: path.join(webRoot, 'koda/index.html'),
          chickenChatRedirect: path.join(
            webRoot,
            'koda/chicken-chat.html',
          ),
          chickenChat: path.join(
            webRoot,
            'koda/chicken-chat/index.html',
          ),
          halloween: path.join(
            webRoot,
            'koda/halloween/index.html',
          ),
        },
      },
    },
  });
});
