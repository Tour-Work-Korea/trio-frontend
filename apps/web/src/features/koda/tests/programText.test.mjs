import test from 'node:test';
import assert from 'node:assert/strict';
import {programBlocks, programInline} from '../services/programText.js';
import {adaptLiveEvent} from '../services/liveEventModel.js';
import {toEventViewModel} from '../services/eventModel.js';

const description =
  '## 🎃 KODA CLUB Halloween Edition | 상세 프로그램\n\n**01. 코스튬 & 입장**\n평상복도 좋아요!\n\n**02. 언어교환**\n함께 대화해요.\n\n- **초콜릿 뽑기**\n- 음료 교환권\n\n1. 체크인\n2. 시작';

test('admin program keeps headings, bold, paragraphs, line breaks and list boundaries', () => {
  const blocks = programBlocks(description);
  assert.deepEqual(
    blocks.map(block => block.type),
    ['heading', 'paragraph', 'paragraph', 'unordered', 'ordered'],
  );
  assert.equal(
    blocks[0].text,
    '🎃 KODA CLUB Halloween Edition | 상세 프로그램',
  );
  assert.equal(blocks[1].text, '**01. 코스튬 & 입장**\n평상복도 좋아요!');
  assert.deepEqual(programInline(blocks[1].text), [
    {text: '01. 코스튬 & 입장', bold: true},
    {text: '\n평상복도 좋아요!', bold: false},
  ]);
  assert.deepEqual(blocks[3].items, ['**초콜릿 뽑기**', '음료 교환권']);
  assert.equal(blocks[4].start, 1);
  assert.deepEqual(programBlocks(description.replaceAll('\n', '\r\n')), blocks);
});

test('plain text and untrusted HTML remain text rather than executable markup', () => {
  assert.deepEqual(programBlocks('첫 줄\n둘째 줄'), [
    {type: 'paragraph', text: '첫 줄\n둘째 줄'},
  ]);
  const html = '<img src=x onerror=alert(1)> [link](javascript:alert(1))';
  assert.deepEqual(programInline(html), [{text: html, bold: false}]);
  assert.deepEqual(programBlocks(''), []);
});

test('API descriptions do not become an artificial single step; editorial steps stay separate', () => {
  const detail = {
    partyId: 1,
    organizerType: 'PLATFORM',
    reviewSummary: {templateId: 2},
    partyTitle: '언어교환',
    partyStartDateTime: '2026-10-31T19:00:00',
    partyEndTime: '21:00:00',
    amount: 30000,
    partySchedule: description,
  };
  const record = adaptLiveEvent(
    detail,
    {partyId: 1, isVisible: true},
    {partyId: 1, templateId: 2},
  );
  const event = toEventViewModel(record);
  assert.deepEqual(event.program, []);
  assert.equal(event.programDescription.ko, description);
  assert.equal(event.programDescription.en, description);
  const legacy = toEventViewModel({
    ...record,
    program: {steps: ['체크인', '자유 대화']},
  });
  assert.equal(legacy.program.length, 2);
  assert.equal(legacy.programDescription.ko, '');
});

test('place links work for multiple venues, query strings and parentheses without changing surrounding text', () => {
  const parts = programInline(
    '장소: [HEX 위치 보기](https://map.naver.com/p/search/HEX?c=15,0,0,0,dh)\n[다른 장소](https://example.com/place_(Seoul))',
  );
  assert.equal(parts[0].text, '장소: ');
  assert.equal(parts[1].text, 'HEX 위치 보기');
  assert.equal(
    parts[1].href,
    'https://map.naver.com/p/search/HEX?c=15,0,0,0,dh',
  );
  assert.equal(parts[2].text, '\n');
  assert.equal(parts[3].href, 'https://example.com/place_(Seoul)');
  assert.equal(
    programInline('[지도](http://example.com)')[0].href,
    'http://example.com/',
  );
  assert.equal(
    programInline('[지도](https://maps.google.com/?q=HEX&zoom=15)')[0].href,
    'https://maps.google.com/?q=HEX&zoom=15',
  );
});

test('unsafe or incomplete links and image markup remain ordinary text', () => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,test',
    '//example.com',
    '/local',
    'https://',
    'https://user:password@example.com',
    'https://example.com/\\evil',
    'https://example.com/\u0001',
  ]) {
    const source = `[장소](${url})`;
    assert.deepEqual(programInline(source), [{text: source, bold: false}]);
  }
  for (const source of [
    '[장소](https://example.com',
    '![사진](https://example.com/a.png)',
    'https://example.com',
  ])
    assert.deepEqual(programInline(source), [{text: source, bold: false}]);
});
