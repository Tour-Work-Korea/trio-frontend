import test from 'node:test';
import assert from 'node:assert/strict';
import {kodaAuthReturnPlugin} from '../hosting/authReturnPlugin.js';

test('normal and KODA web shells inject the return bridge without rewriting the app entry', () => {
  const plugin = kodaAuthReturnPlugin('/repo/apps/web');
  const html = '<script type="module" src="/src/main.jsx"></script>';
  const result = plugin.transformIndexHtml.handler(html, {
    filename: '/repo/apps/web/index.html',
  });
  assert.equal(result.html, html);
  assert.equal(result.tags.length, 1);
  assert.equal(
    result.tags[0].attrs.src,
    '/src/features/koda/auth/authBridge.js',
  );
  assert.equal(
    plugin.transformIndexHtml.handler(html, {
      filename: '/repo/apps/web/koda/index.html',
    }),
    html,
  );
});

test('only the shared SocialLogin export is wrapped; original screen remains resolvable', () => {
  const plugin = kodaAuthReturnPlugin('/repo/apps/web');
  assert.equal(
    plugin.resolveId(
      './(Common)/Login/SocialLogin',
      '/repo/packages/app/src/screens/index.js',
    ),
    '/repo/apps/web/src/features/koda/components/KodaSocialLogin.jsx',
  );
  assert.equal(
    plugin.resolveId(
      '@trio/app/src/screens/(Common)/Login/SocialLogin',
      '/repo/apps/web/src/features/koda/components/KodaSocialLogin.jsx',
    ),
    undefined,
  );
  assert.equal(
    plugin.resolveId(
      './(Common)/Login/EmailLogin',
      '/repo/packages/app/src/screens/index.js',
    ),
    undefined,
  );
});
