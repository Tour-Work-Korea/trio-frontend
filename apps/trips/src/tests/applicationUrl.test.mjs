import assert from 'node:assert/strict';
import test from 'node:test';
import {applicationUrl} from '../applicationUrl.js';

test('applications go to the production content and use no local auth route', () => {
  for (const id of [3861, 4133, 4134]) assert.equal(applicationUrl(id), `https://ddakji.kr/contents/${id}`);
  for (const id of [null, 0, -1, 'https://other.test', '4133?apply=1', '1/../../login']) {
    assert.throws(() => applicationUrl(id));
  }
});
