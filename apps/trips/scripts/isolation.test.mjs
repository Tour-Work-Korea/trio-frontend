import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {ownsPath} from './verify-output.mjs';
import {planCloudFront, tripsOriginId, tripsPatterns} from './plan-cloudfront.mjs';

test('output ownership excludes the live app and KODA assets', () => {
  for (const name of ['trips/index.html', 'trips/programs/index.html', 'trips-assets/build/main.js']) assert.equal(ownsPath(name), true);
  for (const name of ['index.html', 'assets/main.js', 'koda/index.html', 'trips/../index.html', 'trips2/index.html']) assert.equal(ownsPath(name), false);
});

test('CloudFront travel router never changes existing app paths', () => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('./cloudfront-router.js', import.meta.url), 'utf8'), context);
  for (const uri of ['/', '/login', '/contents/3861', '/my/reservations/contents', '/koda/', '/about', '/assets/main.js', '/trips-assets/a.jpg']) {
    assert.equal(context.handler({request: {uri}}).uri, uri);
  }
  for (const [uri, target] of [
    ['/trips', '/trips/index.html'],
    ['/trips/', '/trips/index.html'],
    ['/trips/programs/', '/trips/programs/index.html'],
    ['/trips/reground-jeju', '/trips/reground-jeju/index.html'],
    ['/trips/unknown/', '/trips/index.html'],
  ]) assert.equal(context.handler({request: {uri}}).uri, target);
});

test('deployment writes exclusively to a separate S3 prefix', () => {
  const workflow = readFileSync(new URL('../../../.github/workflows/deploy-trips.yml', import.meta.url), 'utf8');
  assert.match(workflow, /S3_TARGET: s3:\/\/ddakji-react-apps\/app-trips/);
  const writes = workflow.split('\n').filter(line => /aws s3 (sync|cp)/.test(line));
  assert.equal(writes.length, 3);
  for (const line of writes) assert.match(line, /"\$S3_TARGET\/trips(?:-assets)?\//);
  assert.doesNotMatch(workflow, /--delete|ssm get-parameter|vite\.koda|['"]\/\*['"]/);
});

test('CloudFront plan adds only travel rules and preserves the originals', () => {
  const original = {
    Origins: {Quantity: 1, Items: [{Id: 'app', DomainName: 'ddakji-react-apps.s3.ap-northeast-2.amazonaws.com', OriginPath: '/app', OriginAccessControlId: 'existing'}]},
    DefaultCacheBehavior: {TargetOriginId: 'app', FunctionAssociations: {Quantity: 1, Items: [{FunctionARN: 'existing-router'}]}},
    CacheBehaviors: {Quantity: 1, Items: [{PathPattern: '/about*', TargetOriginId: 'about'}]},
    CustomErrorResponses: {Quantity: 1, Items: [{ErrorCode: 404, ResponsePagePath: '/index.html'}]},
    Aliases: {Quantity: 1, Items: ['ddakji.kr']},
  };
  const copy = structuredClone(original);
  const next = planCloudFront(original);
  assert.deepEqual(original, copy);
  assert.deepEqual(next.DefaultCacheBehavior, original.DefaultCacheBehavior);
  assert.deepEqual(next.CustomErrorResponses, original.CustomErrorResponses);
  assert.deepEqual(next.Aliases, original.Aliases);
  assert.deepEqual(next.Origins.Items.slice(0, -1), original.Origins.Items);
  assert.deepEqual(next.CacheBehaviors.Items.slice(0, -3), original.CacheBehaviors.Items);
  assert.equal(next.Origins.Items.at(-1).OriginPath, '/app-trips');
  assert.deepEqual(next.CacheBehaviors.Items.slice(-3).map(item => item.PathPattern), tripsPatterns);
  assert.ok(next.CacheBehaviors.Items.slice(-3).every(item => item.TargetOriginId === tripsOriginId));
  assert.throws(() => planCloudFront(next));
});
