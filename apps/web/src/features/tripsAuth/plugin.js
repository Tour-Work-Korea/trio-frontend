import path from 'node:path';
// Opt-in travel adapters; original source files and ordinary account flows are preserved.
export function tripsAuthReturnPlugin(webRoot) {
  const appSrc = path.resolve(webRoot, '../../packages/app/src');
  const profile = path.join(
    appSrc,
    'screens/(User)/UserRegister/UserRegisterProfile/index.js',
  );
  const callers = new Set([
    profile,
    path.join(appSrc, 'screens/(Common)/Register/PhoneCertificate/index.js'),
    path.join(appSrc, 'screens/(Common)/Login/SocialLogin/index.js'),
  ]);
  return {
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        callers.has(importer?.split('?')[0]) &&
        (source === '@utils/api/authApi' ||
          source === path.join(appSrc, 'utils/api/authApi'))
      )
        return path.join(webRoot, 'src/features/tripsAuth/authApiAdapter.js');
    },
    transform(code, id) {
      if (
        id.split('?')[0] ===
        path.join(appSrc, 'screens/(Common)/Login/SocialLogin/index.js')
      ) {
        const stateCheck =
          'savedState && params.state && savedState !== params.state';
        if (code.split(stateCheck).length !== 2)
          throw new Error('OAuth state check changed; review travel adapter.');
        const cancelAnchor = 'const resetToLoginIntro = () => {';
        if (code.split(cancelAnchor).length !== 2)
          throw new Error(
            'OAuth cancel handler changed; review travel adapter.',
          );
        code = code.replace(
          cancelAnchor,
          `${cancelAnchor}\n    if (cancelTripsAuth()) return;`,
        );
        return (
          `import {activeTripsSignup, cancelTripsAuth} from ${JSON.stringify(
            path.join(webRoot, 'src/features/tripsAuth/signupSession.js'),
          )};\n` +
          code.replace(
            stateCheck,
            `(activeTripsSignup() ? (!savedState || !params.state || savedState !== params.state) : (${stateCheck}))`,
          )
        );
      }
      if (id.split('?')[0] !== profile) return;
      const anchor = 'const {accessToken, refreshToken} = res.data || {};';
      if (code.split(anchor).length !== 2)
        throw new Error('Signup source changed; review travel adapter.');
      return (
        `import {finishTripsSignup} from ${JSON.stringify(
          path.join(webRoot, 'src/features/tripsAuth/finishSignup.js'),
        )};\n` +
        code.replace(
          anchor,
          `
        if (await finishTripsSignup(res, formData.provider)) {
          navigation.dispatch(CommonActions.reset({index: 0, routes: [{name: 'MainTabs', params: {screen: '홈'}}]}));
          return;
        }
        ${anchor}`,
        )
      );
    },
    name: 'trips-auth-return',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        if (context.filename !== path.join(webRoot, 'index.html')) return html;
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {type: 'module', src: '/src/features/tripsAuth/bridge.js'},
              injectTo: 'head',
            },
          ],
        };
      },
    },
  };
}
