import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {tripsAuthReturnPlugin} from '../plugin.js';
const root = path.resolve('apps/web');
const plugin = tripsAuthReturnPlugin(root);
test('auth adapters are restricted to three auth callers and shared HTML', () => {
  const caller = path.resolve(
    'packages/app/src/screens/(Common)/Login/SocialLogin/index.js',
  );
  assert.match(
    plugin.resolveId('@utils/api/authApi', caller),
    /tripsAuth\/authApiAdapter.js$/,
  );
  assert.equal(
    plugin.resolveId(
      '@utils/api/authApi',
      path.resolve(
        'packages/app/src/screens/(Common)/Login/LoginByEmail/index.js',
      ),
    ),
    undefined,
  );
  assert.equal(
    plugin.resolveId(
      '@utils/api/authApi',
      path.join(root, 'src/features/koda/auth/ClubAuth.jsx'),
    ),
    undefined,
  );
  assert.equal(
    plugin.transformIndexHtml.handler('<html/>', {
      filename: path.join(root, 'koda/index.html'),
    }),
    '<html/>',
  );
});
test('profile adapter preserves original fallback and fails closed on upstream changes', () => {
  const file = path.resolve(
    'packages/app/src/screens/(User)/UserRegister/UserRegisterProfile/index.js',
  );
  const code = readFileSync(file, 'utf8');
  const output = plugin.transform(code, file);
  assert.match(output, /finishTripsSignup\(res, formData.provider\)/);
  assert.ok(
    output.includes('const {accessToken, refreshToken} = res.data || {};'),
  );
  assert.throws(() => plugin.transform('changed upstream', file));
  assert.equal(plugin.transform(code, 'other.js'), undefined);
});
test('travel OAuth requires a matching state and cancels to the travel source', () => {
  const file = path.resolve(
    'packages/app/src/screens/(Common)/Login/SocialLogin/index.js',
  );
  const output = plugin.transform(readFileSync(file, 'utf8'), file);
  assert.match(
    output,
    /!savedState \|\| !params.state \|\| savedState !== params.state/,
  );
  assert.match(output, /if \(cancelTripsAuth\(\)\) return/);
  assert.throws(() => plugin.transform('changed OAuth source', file));
});
