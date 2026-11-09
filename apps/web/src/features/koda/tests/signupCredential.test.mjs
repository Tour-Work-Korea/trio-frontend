import test from 'node:test';
import assert from 'node:assert/strict';
import {createSignupCredentialBridge} from '../auth/signupCredential.js';

test('signup credential is memory-only, bound to its signup session and consumed once', () => {
  const bridge=createSignupCredentialBridge(()=>1000);
  bridge.remember('signup-a','credential');
  assert.equal(bridge.take('signup-b'),null);
  assert.equal(bridge.take('signup-a'),null);
  bridge.remember('signup-a','credential');
  assert.equal(bridge.take('signup-a'),'credential');
  assert.equal(bridge.take('signup-a'),null);
  bridge.remember('signup-a','credential');
  bridge.clear();
  assert.equal(bridge.take('signup-a'),null);
});
test('expired, future and missing signup credentials require explicit login', () => {
  let now=1000;
  const bridge=createSignupCredentialBridge(()=>now);
  bridge.remember('signup-a','credential');
  now+=30*60*1000;
  assert.equal(bridge.take('signup-a'),null);
  bridge.remember('signup-a','credential');
  now--;
  assert.equal(bridge.take('signup-a'),null);
  bridge.remember('','credential');
  assert.equal(bridge.take(''),null);
});
