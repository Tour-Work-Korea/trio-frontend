import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {deploymentScope, deployedScope} from './web-deploy-scope.mjs';
import {verifyKodaArtifacts} from './prepare-koda-web.mjs';

test('KODA pages, event data, translations and media deploy independently', () => {
  assert.equal(
    deploymentScope([
      'apps/web/src/features/koda/pages/KodaEventPage.jsx',
      'apps/web/src/features/koda/data/archive/halloween.js',
      'apps/web/koda/event/index.html',
      'apps/web/public/koda-assets/poster.png',
    ]),
    'koda',
  );
});
test('shared auth, fallback, reservation dependencies, configs and mixed changes require full release', () => {
  for (const file of [
    'packages/app/src/utils/auth/login.js',
    'package-lock.json',
    'apps/web/vite.koda.config.js',
    '.github/workflows/deploy-web.yml',
    'apps/web/src/features/koda/auth/reservationBack.js',
    'apps/web/src/features/koda/services/liveEventModel.js',
    'apps/web/src/features/koda/components/KodaReservationHeader.jsx',
    'apps/web/src/features/koda/hosting/hostedEntry.jsx',
    'apps/web/src/features/koda/styles/koda-hosted.css',
  ])
    assert.equal(
      deploymentScope(['apps/web/koda/index.html', file]),
      'full',
      file,
    );
  assert.equal(deploymentScope([]), 'full');
});
test('manual, initial, invalid or divergent deployments use full release', () => {
  const state = {schema: 1, commit: 'a'.repeat(40)};
  assert.equal(deployedScope(state, 'head', 'workflow_dispatch'), 'full');
  assert.equal(deployedScope(null, 'head', 'push'), 'full');
  assert.equal(deployedScope({...state, schema: 0}, 'head', 'push'), 'full');
  assert.equal(
    deployedScope(state, 'head', 'push', () => {
      throw Error('not ancestor');
    }),
    'full',
  );
});
test('compares against the last deployed commit, including skipped shared changes and renames', () => {
  const state = {schema: 1, commit: 'a'.repeat(40)};
  const calls = [];
  const git = args => {
    calls.push(args);
    return args[0] === 'diff'
      ? 'apps/web/koda/index.html\0package-lock.json\0'
      : '';
  };
  assert.equal(deployedScope(state, 'head', 'push', git), 'full');
  assert.deepEqual(calls[1], [
    'diff',
    '--no-renames',
    '--name-only',
    '-z',
    state.commit,
    'head',
  ]);
  assert.equal(
    deployedScope(state, 'head', 'push', args =>
      args[0] === 'diff' ? 'apps/web/koda/index.html\0' : '',
    ),
    'koda',
  );
});
test('partial deployment rejects shared output and shared runtime dependencies', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'koda-artifacts-'));
  try {
    await mkdir(path.join(root, 'koda-assets/build'), {recursive: true});
    for (const name of ['index', 'event/index', 'join/index', 'my/index']) {
      const file = path.join(root, `koda/${name}.html`);
      await mkdir(path.dirname(file), {recursive: true});
      await writeFile(
        file,
        '<script src="/koda-assets/build/main.js"></script>',
      );
    }
    for (const ext of ['js', 'css'])
      await writeFile(path.join(root, `koda-assets/build/main.${ext}`), '');
    await writeFile(
      path.join(root, 'koda/entry.js'),
      'const css="/koda-assets/build/main.css"; import("/koda-assets/build/main.js");',
    );
    await verifyKodaArtifacts(root);
    await writeFile(path.join(root, 'index.html'), 'shared');
    await assert.rejects(verifyKodaArtifacts(root), /shared output/);
    await rm(path.join(root, 'index.html'));
    await writeFile(
      path.join(root, 'koda/entry.js'),
      'const css="/koda-assets/build/main.css"; import("/assets/main.js");',
    );
    await assert.rejects(verifyKodaArtifacts(root), /shared assets/);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
