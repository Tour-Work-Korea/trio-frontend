import assert from 'node:assert/strict';
import test from 'node:test';
import {createSignupFlow} from '../signupFlow.js';
function fixture(active = true) {
  let loginCalls = 0,
    clock = 1000;
  const inputs = [];
  const signupResult = {
    data: {accessToken: 'native-access', refreshToken: 'native-refresh'},
  };
  const api = {
    async loginKakao(c) {
      inputs.push(c);
      return {
        data:
          ++loginCalls === 1
            ? {status: 'NEW_USER_SIGNUP_REQUIRED', socialSignupToken: 'signup'}
            : {status: 'LINKED', session: {userId: 7, role: 'USER'}},
      };
    },
    async completeSocialSignUp() {
      return signupResult;
    },
  };
  const flow = createSignupFlow({
    api,
    isActive: () => active,
    now: () => clock,
  });
  return {flow, inputs, signupResult, expire: () => (clock += 30 * 60 * 1000)};
}
test('new travel signup establishes web cookie session with original provider credential', async () => {
  const f = fixture();
  await f.flow.loginKakao('provider-credential');
  const r = await f.flow.completeSocialSignUp({
    provider: 'KAKAO',
    socialSignupToken: 'signup',
  });
  assert.deepEqual(r.data.session, {userId: 7, role: 'USER'});
  assert.deepEqual(f.inputs, ['provider-credential', 'provider-credential']);
  await assert.rejects(
    f.flow.completeSocialSignUp({
      provider: 'KAKAO',
      socialSignupToken: 'signup',
    }),
  );
  assert.equal(f.inputs.length, 2);
});
test('ordinary web/KODA signup returns unchanged result without a second login', async () => {
  const f = fixture(false);
  await f.flow.loginKakao('provider-credential');
  assert.equal(
    await f.flow.completeSocialSignUp({
      provider: 'KAKAO',
      socialSignupToken: 'signup',
    }),
    f.signupResult,
  );
  assert.equal(f.inputs.length, 1);
});
test('expired or mismatched signup cannot reuse another credential', async () => {
  for (const mode of ['expired', 'mismatch']) {
    const f = fixture();
    await f.flow.loginKakao('provider-credential');
    if (mode === 'expired') f.expire();
    await assert.rejects(
      f.flow.completeSocialSignUp({
        provider: 'KAKAO',
        socialSignupToken: mode === 'mismatch' ? 'wrong' : 'signup',
      }),
    );
    assert.equal(f.inputs.length, 1);
  }
});
