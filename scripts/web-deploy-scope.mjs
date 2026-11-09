import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

// These modules are also compiled into the shared login/reservation shell.
const sharedKoda = [
  'auth/',
  'hosting/',
  'services/liveEventModel.js',
  'components/KodaReservationHeader.jsx',
  'components/KodaSocialLogin.jsx',
  'components/KodaGoogleLogin.jsx',
  'components/ForeignRegisterProfileWeb.jsx',
  'components/SocialOriginSelectWeb.jsx',
  'data/countryOptions.js',
  'components/KodaLogo.jsx',
  'styles/koda-auth.css',
  'styles/koda-brand.css',
  'styles/koda-hosted.css',
];
export function isKodaOnlyPath(filename) {
  const prefix = 'apps/web/src/features/koda/';
  if (filename.startsWith(prefix)) {
    const relative = filename.slice(prefix.length);
    return !sharedKoda.some(
      item =>
        relative === item ||
        relative.startsWith(item.endsWith('/') ? item : `${item}/`),
    );
  }
  return (
    filename.startsWith('apps/web/koda/') ||
    filename === 'apps/web/koda.html' ||
    filename.startsWith('apps/web/public/koda-assets/')
  );
}
export function deploymentScope(files) {
  return files.length && files.every(isKodaOnlyPath) ? 'koda' : 'full';
}
export function deployedScope(
  state,
  head,
  eventName,
  git = args => execFileSync('git', args, {encoding: 'utf8'}),
) {
  if (
    eventName !== 'push' ||
    state?.schema !== 1 ||
    !/^[a-f0-9]{40}$/.test(state.commit || '')
  )
    return 'full';
  try {
    // Compare with the last successful deployment, not just the last push:
    // cancelled/failed runs and multi-commit pushes must not lose shared edits.
    git(['merge-base', '--is-ancestor', state.commit, head]);
    return deploymentScope(
      git(['diff', '--no-renames', '--name-only', '-z', state.commit, head])
        .split('\0')
        .filter(Boolean),
    );
  } catch {
    return 'full';
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let state;
  try {
    state = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  } catch {
    /* First deployment uses full build. */
  }
  console.log(
    deployedScope(state, process.env.GITHUB_SHA, process.env.GITHUB_EVENT_NAME),
  );
}
