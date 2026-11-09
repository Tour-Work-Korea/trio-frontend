import path from 'node:path';

// Normal Vite and the KODA build share the same OAuth callback page.
// The return bridge only acts on validated KODA login journeys.
export function kodaAuthReturnPlugin(webRoot) {
  const appSrc = path.resolve(webRoot, '../../packages/app/src');
  return {
    name: 'koda-auth-return',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        importer?.split('?')[0] === path.join(appSrc, 'screens/index.js') &&
        source === './(Common)/Register/ForeignRegisterProfile'
      ) {
        return path.join(webRoot, 'src/features/koda/components/ForeignRegisterProfileWeb.jsx');
      }
      if (
        importer?.split('?')[0] === path.join(appSrc, 'screens/index.js') &&
        source === './(Common)/Login/SocialLogin'
      ) {
        return path.join(
          webRoot,
          'src/features/koda/components/KodaSocialLogin.jsx',
        );
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        if (context.filename !== path.join(webRoot, 'index.html')) return html;
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                type: 'module',
                src: '/src/features/koda/auth/authBridge.js',
              },
              injectTo: 'head',
            },
          ],
        };
      },
    },
  };
}
