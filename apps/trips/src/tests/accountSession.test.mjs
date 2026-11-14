import assert from 'node:assert/strict';
import test from 'node:test';
import {createAccountSession, clearLoggedOutState} from '../accountSession.js';
const response = status => ({status, ok: status >= 200 && status < 300});
test('logs out cookie session, not a local display-only state', async () => {
  const calls = [];
  const client = createAccountSession(async (url, options) => {
    calls.push(url);
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'include');
    return response(204);
  });
  await client.logout();
  assert.ok(calls[0].endsWith('/logout'));
});
test('expired access session refreshes once and retries logout', async () => {
  const statuses = [401, 200, 204],
    calls = [];
  const c = createAccountSession(async url => {
    calls.push(url.split('/').at(-1));
    return response(statuses.shift());
  });
  await c.logout();
  assert.deepEqual(calls, ['logout', 'refresh', 'logout']);
});
test('no remaining refresh session is already logged out, failures remain failures', async () => {
  const statuses = [401, 401];
  await createAccountSession(async () => response(statuses.shift())).logout();
  for (const statuses of [[500], [403], [401, 500], [401, 200, 401]])
    await assert.rejects(
      createAccountSession(async () => response(statuses.shift())).logout(),
    );
  await assert.rejects(
    createAccountSession(async () => {
      throw Error('network');
    }).logout(),
  );
});
test('refresh completes before logout and repeated clicks share one request', async () => {
  let release;
  const calls = [];
  const c = createAccountSession(async url => {
    const action = url.split('/').at(-1);
    calls.push(action);
    if (action === 'refresh') await new Promise(r => (release = r));
    return response(200);
  });
  const check = c.check();
  const first = c.logout();
  assert.equal(c.logout(), first);
  const laterCheck = c.check();
  assert.deepEqual(calls, ['refresh']);
  release();
  await Promise.all([check, first]);
  assert.equal(await laterCheck, false);
  assert.deepEqual(calls, ['refresh', 'logout']);
});
test('cleanup removes account and pending journey state, keeping preferences', () => {
  const map = new Map([
    ['user-store', 'private'],
    ['locale-store', 'ko'],
    ['nangman-auth-journey', 'pending'],
    ['koda-auth-return', 'pending'],
  ]);
  const store = {removeItem: k => map.delete(k)};
  clearLoggedOutState(store, store);
  assert.deepEqual([...map], [['locale-store', 'ko']]);
  assert.doesNotThrow(() =>
    clearLoggedOutState(
      {
        removeItem() {
          throw Error('blocked');
        },
      },
      null,
    ),
  );
});
