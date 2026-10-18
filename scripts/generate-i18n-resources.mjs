import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parse} from '@babel/parser';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'packages/app/src/locales');
const CACHE_FILE = path.join(OUTPUT_DIR, '.translation-cache.json');

const COMMON_KEYS = new Map([
  ['저장', 'common.save'],
  ['취소', 'common.cancel'],
  ['확인', 'common.confirm'],
  ['닫기', 'common.close'],
  ['삭제', 'common.delete'],
  ['수정', 'common.edit'],
  ['변경', 'common.change'],
  ['완료', 'common.done'],
  ['다음', 'common.next'],
  ['이전', 'common.previous'],
  ['등록', 'common.register'],
  ['신청', 'common.apply'],
  ['검색', 'common.search'],
  ['선택', 'common.select'],
  ['전체', 'common.all'],
  ['재시도', 'common.retry'],
  ['로그인', 'auth.login'],
  ['로그아웃', 'auth.logout'],
  ['회원가입', 'auth.signUp'],
  ['이메일', 'common.email'],
  ['이름', 'common.name'],
  ['휴대폰 번호', 'common.phoneNumber'],
  ['비밀번호', 'auth.password'],
  ['설정', 'settings.title'],
  ['한국어', 'language.korean'],
  ['영어', 'language.english'],
  ['무료', 'common.free'],
  ['원', 'common.won'],
  ['명', 'common.peopleUnit'],
]);

const BASE_RESOURCES = [
  ['common.save', '저장', 'Save'],
  ['common.cancel', '취소', 'Cancel'],
  ['common.confirm', '확인', 'Confirm'],
  ['common.close', '닫기', 'Close'],
  ['common.retry', '다시 시도', 'Try again'],
  ['errors.generic', '문제가 발생했어요. 잠시 후 다시 시도해 주세요.', 'Something went wrong. Please try again later.'],
  ['errors.languageSaveFailed', '언어 설정을 저장하지 못했어요. 다시 시도해 주세요.', 'We couldn’t save your language preference. Please try again.'],
  ['language.title', '언어', 'Language'],
  ['language.korean', '한국어', 'Korean'],
  ['language.english', 'English', 'English'],
  ['auth.registrationStepsVaryDependingOnYourSelection', '선택에 따라 가입 절차가 달라져요.', 'Registration steps vary depending on your selection.'],
  ['auth.nationalityLanguage', '국적 / 언어', 'NATIONALITY / LANGUAGE'],
  ['auth.aboard', '환영합니다!', 'Aboard!'],
  ['auth.weReThrilledToHaveYouJoinOurCommunity', '게딱지와 함께하게 되어 기뻐요.', 'We’re thrilled to have you join our community.'],
  ['auth.pleaseFillInYourDetailsToCompleteRegistration', '가입을 완료하려면 정보를 입력해 주세요.', 'Please fill in your details to complete registration.'],
  ['employ.workAndStay', '워크 앤 스테이', 'Work + Stay'],
  ['units.night_one', '{{count}}박', '{{count}} night'],
  ['units.night_other', '{{count}}박', '{{count}} nights'],
  ['units.guest_one', '{{count}}명', '{{count}} guest'],
  ['units.guest_other', '{{count}}명', '{{count}} guests'],
  ['units.room_one', '객실 {{count}}개', '{{count}} room'],
  ['units.room_other', '객실 {{count}}개', '{{count}} rooms'],
  ['units.bed_one', '베드 {{count}}개', '{{count}} bed'],
  ['units.bed_other', '베드 {{count}}개', '{{count}} beds'],
  ['web.eventDetails', '이벤트 상세', 'Event details'],
  ['web.eventLoadFailed', '이벤트 화면을 불러오지 못했어요.', 'Couldn’t load the event page.'],
  ['web.openingApp', '게딱지 앱으로 이동 중', 'Opening the Ddakji app'],
  ['web.openStoreFallback', '앱이 열리지 않으면 스토어로 이동합니다.', 'If the app doesn’t open, you’ll be redirected to the app store.'],
  ['web.downloadApp', '앱 다운로드하기', 'Download the app'],
];

const ENGLISH_OVERRIDES = new Map([
  ['설정', 'Settings'],
  ['환불이 예상됩니다.', 'Estimated refund'],
  ['콘텐츠 취소 / 환불 규정', 'Activity cancellation and refund policy'],
  ['이력서를 불러오는 중 오류가 발생했어요', 'Couldn’t load your resume.'],
  ['삭제한 이력서는 복구할 수 없어요 삭제를 진행하시겠어요?', 'Deleted resumes can’t be restored. Do you want to continue?'],
  ['객실 가격 ({{value1}} X {{nights}}박)', 'Room price ({{value1}} × {{nights}} nights)'],
  ['(베드 {{value1}}개 X {{value2}})', '({{value1}} beds × {{value2}})'],
  ['제주', 'Jeju'],
  ['원', ' KRW'],
  ['개', ' items'],
  ['건', ' posts'],
  ['장', ' coupons'],
  ['총', 'Total '],
  ['시', 'hr'],
  ['분', 'min'],
  ['일', 'Sun'],
  ['월', 'Mon'],
  ['화', 'Tue'],
  ['수', 'Wed'],
  ['목', 'Thu'],
  ['금', 'Fri'],
  ['토', 'Sat'],
  ['찜', 'Saved'],
  ['신청', 'Apply'],
  ['수정', 'Edit'],
  ['선택', 'Select'],
  ['명', ' guests'],
  ['세', ' years old'],
  ['세 (', ' years old ('],
  ['여', 'Female'],
  ['년생)', 'born)'],
  ['인)', ' guests)'],
  ['상호명 : 워커웨이', 'Company name: Workaway'],
  ['리뷰에 따른 책임은 작성자에게 있고, 워커웨이는 이에 대한 법적 책임을 지지 않습니다.', 'The author is responsible for their review, and Workaway assumes no legal liability for its content.'],
]);

const NON_UI_CALLS = new Set([
  'console.log', 'console.info', 'console.warn', 'console.error', 'console.debug',
  'log.info', 'log.warn', 'log.error', 'log.debug', 'log.time', 'log.timeEnd',
  'crashlytics.log', 'recordStartupError',
  'StyleSheet.create', 'navigation.navigate', 'navigation.replace',
]);

const NON_UI_VALUES = new Set([
  'absolute', 'relative', 'stretch', 'wrap', 'always', 'automatic',
  'interactive', 'number-pad', 'button', 'ForeignRegisterProfile',
  'ForeignSignupComplete', 'RegisterAgree', 'AgreeDetail', 'MainTabs',
]);

const englishUiFiles = [
  '/Register/ForeignRegisterProfile/',
  '/Register/ForeignSignupComplete/',
  '/Register/SocialOriginSelect/',
];

const sourceFiles = execFileSync('rg', ['--files', 'packages/app/src', 'apps/web/src'], {
  cwd: ROOT,
  encoding: 'utf8',
}).trim().split('\n').filter(file => /\.(js|jsx)$/.test(file));

const clean = value => value.replace(/\s+/g, ' ').trim();
const hasKorean = value => /[가-힣]/.test(value);
const hasEnglishWords = value => /[A-Za-z]{2,}/.test(value);

function callName(node) {
  if (!node) return '';
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && !node.computed) {
    return `${callName(node.object)}.${callName(node.property)}`;
  }
  return '';
}

function isNonUi(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i -= 1) {
    const node = ancestors[i];
    if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration') return true;
    if (node.type === 'CallExpression' && NON_UI_CALLS.has(callName(node.callee))) return true;
    if (
      node.type === 'JSXAttribute'
      && node.name?.name === 'name'
      && ancestors.some(parent => parent.type === 'JSXOpeningElement')
    ) return true;
  }
  return false;
}

function templateValue(node) {
  let value = '';
  node.quasis.forEach((quasi, index) => {
    value += quasi.value.cooked ?? quasi.value.raw;
    if (index < node.expressions.length) {
      const expression = node.expressions[index];
      const name = expression.type === 'Identifier'
        ? expression.name
        : expression.type === 'MemberExpression' && !expression.computed
          ? callName(expression).replaceAll('.', '_')
          : `value${index + 1}`;
      value += `{{${name}}}`;
    }
  });
  return clean(value);
}

function domainFor(file) {
  const normalized = file.replaceAll('\\', '/');
  const rules = [
    ['Guesthouse', 'guesthouse'], ['Meet', 'meet'], ['Employ', 'employ'],
    ['Community', 'community'], ['Coupon', 'coupon'], ['Login', 'auth'],
    ['Register', 'auth'], ['Setting', 'settings'], ['Notification', 'notification'],
    ['UserMyPage', 'myPage'], ['Payment', 'payment'], ['Reservation', 'reservation'],
  ];
  return rules.find(([segment]) => normalized.includes(segment))?.[1]
    ?? (normalized.includes('/components/') ? 'components' : 'common');
}

function slug(value) {
  const words = value
    .replace(/\{\{[^}]+\}\}/g, ' value ')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim().split(/\s+/).filter(Boolean).slice(0, 10);
  if (!words.length) return 'message';
  return words.map((word, index) => {
    const lower = word.toLowerCase();
    return index === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
  }).join('');
}

function hash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 6);
}

const occurrences = [];
for (const file of sourceFiles) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  let ast;
  try {
    ast = parse(source, {sourceType: 'unambiguous', plugins: ['jsx', 'typescript']});
  } catch {
    continue;
  }

  const includeEnglish = englishUiFiles.some(part => file.includes(part));
  function add(value, node, kind, ancestors) {
    value = clean(value);
    if (!value || isNonUi(ancestors)) return;
    if (NON_UI_VALUES.has(value)) return;
    if (value.length > 500 || /<!doctype|document\.querySelector|<div\s+style=/i.test(value)) return;
    if (!hasKorean(value) && !(includeEnglish && hasEnglishWords(value) && kind !== 'template')) return;
    if (/^(https?:|[A-Z0-9_./-]+$)/.test(value)) return;
    occurrences.push({file, line: node.loc?.start.line ?? 0, kind, source: value});
  }

  function walk(node, ancestors = []) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'StringLiteral') add(node.value, node, 'string', ancestors);
    if (node.type === 'JSXText') add(node.value, node, 'jsx', ancestors);
    if (node.type === 'TemplateLiteral') add(templateValue(node), node, 'template', ancestors);
    const next = [...ancestors, node];
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end', 'extra'].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(child => walk(child, next));
      else if (value?.type) walk(value, next);
    }
  }
  walk(ast);
}

const grouped = new Map();
for (const occurrence of occurrences) {
  const key = occurrence.source;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(occurrence);
}

await fs.mkdir(OUTPUT_DIR, {recursive: true});
let cache = {};
try { cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8')); } catch {}

async function translate(text, from, to) {
  const cacheKey = `${from}:${to}:${text}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const tokens = [];
  const protectedText = text.replace(/\{\{([^}]+)\}\}/g, (_, name) => {
    const token = `__VAR_${tokens.length}__`;
    tokens.push({token, value: `{{${name}}}`});
    return token;
  });
  const url = new URL('https://clients5.google.com/translate_a/t');
  url.searchParams.set('client', 'dict-chrome-ex');
  url.searchParams.set('sl', from);
  url.searchParams.set('tl', to);
  url.searchParams.set('q', protectedText);
  let translated = text;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      translated = Array.isArray(data) && typeof data[0] === 'string'
        ? data.join('')
        : data[0].map(part => part[0]).join('');
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  for (const {token, value} of tokens) {
    translated = translated.replaceAll(token, value).replaceAll(token.toLowerCase(), value);
  }
  cache[cacheKey] = translated;
  return translated;
}

const groupedEntries = [...grouped.entries()];
const BATCH_SEPARATOR = '__TRIO_TRANSLATION_BREAK_7D3A__';
async function translateMany(values, from, to) {
  const result = new Map();
  const missing = values.filter(value => {
    const cached = cache[`${from}:${to}:${value}`];
    if (cached) result.set(value, cached);
    return !cached;
  });
  const batches = [];
  let batch = [];
  let length = 0;
  for (const value of missing) {
    if (batch.length >= 35 || length + value.length > 3500) {
      batches.push(batch);
      batch = [];
      length = 0;
    }
    batch.push(value);
    length += value.length;
  }
  if (batch.length) batches.push(batch);

  for (let index = 0; index < batches.length; index += 1) {
    const current = batches[index];
    const joined = current.join(`\n${BATCH_SEPARATOR}\n`);
    const translated = await translate(joined, from, to);
    let parts = translated.split(new RegExp(`\\s*${BATCH_SEPARATOR}\\s*`, 'i'));
    if (parts.length !== current.length) {
      parts = [];
      for (const value of current) parts.push(await translate(value, from, to));
    }
    current.forEach((value, valueIndex) => {
      const output = clean(parts[valueIndex]);
      result.set(value, output);
      cache[`${from}:${to}:${value}`] = output;
    });
    process.stdout.write(`translated batch ${index + 1}/${batches.length} (${from}-${to})\n`);
    await fs.writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
    await new Promise(resolve => setTimeout(resolve, 650));
  }
  return result;
}

const koreanSources = groupedEntries.map(([source]) => source).filter(hasKorean);
const englishSources = groupedEntries.map(([source]) => source).filter(source => !hasKorean(source));
const englishTranslations = await translateMany(koreanSources, 'ko', 'en');
const koreanTranslations = await translateMany(englishSources, 'en', 'ko');
const items = groupedEntries.map(([source, refs]) => hasKorean(source)
  ? {source, ko: source, en: englishTranslations.get(source), refs}
  : {source, ko: koreanTranslations.get(source), en: source, refs});

const placeholders = value => (value.match(/\{\{[^}]+\}\}/g) ?? []).sort().join('|');
for (const item of items) {
  if (
    !item.en
    || hasKorean(item.en)
    || placeholders(item.ko) !== placeholders(item.en)
  ) {
    delete cache[`ko:en:${item.source}`];
    item.en = await translate(item.source, 'ko', 'en');
  }
  if (!item.ko) {
    delete cache[`en:ko:${item.source}`];
    item.ko = await translate(item.source, 'en', 'ko');
  }
  if (ENGLISH_OVERRIDES.has(item.ko)) item.en = ENGLISH_OVERRIDES.get(item.ko);
  if (item.ko.includes('게딱지')) {
    item.en = item.en
      .replace(/crab shells?/gi, 'Ddakji')
      .replace(/crabs?/gi, 'Ddakji');
  }
  if (item.ko.includes('게하')) {
    item.en = item.en
      .replace(/\bgeha\b/gi, 'guesthouse')
      .replace(/popular game/gi, 'popular guesthouse');
  }
  if (item.ko.includes('콘텐츠')) {
    item.en = item.en
      .replace(/\bcontents\b/gi, 'activities')
      .replace(/\bcontent\b/gi, 'activity');
  }
  if (item.ko.includes('박')) {
    item.en = item.en
      .replace(/\bPark\b/g, 'nights')
      .replace(/\}\}nights/g, '}} nights')
      .replace(/consecutive nights discount/gi, 'multi-night discount');
  }
}

const usedKeys = new Set();
for (const item of items) {
  let key = COMMON_KEYS.get(item.ko);
  if (!key) {
    const repeatedAcrossFiles = new Set(item.refs.map(ref => ref.file)).size > 1;
    const domain = repeatedAcrossFiles ? 'common' : domainFor(item.refs[0].file);
    key = `${domain}.${slug(item.en)}`;
  }
  if (usedKeys.has(key)) key = `${key}_${hash(item.ko)}`;
  usedKeys.add(key);
  item.key = key;
}

items.sort((a, b) => a.key.localeCompare(b.key));
const koResource = Object.fromEntries(items.map(item => [item.key, item.ko]));
const enResource = Object.fromEntries(items.map(item => [item.key, item.en]));
for (const [key, ko, en] of BASE_RESOURCES) {
  koResource[key] = ko;
  enResource[key] = en;
}
const sourceMap = Object.fromEntries(items.map(item => [item.key, {
  source: item.source,
  references: item.refs.map(({file, line, kind}) => ({file, line, kind})),
}]));

await fs.writeFile(path.join(OUTPUT_DIR, 'ko.json'), `${JSON.stringify(koResource, null, 2)}\n`);
await fs.writeFile(path.join(OUTPUT_DIR, 'en.json'), `${JSON.stringify(enResource, null, 2)}\n`);
await fs.writeFile(path.join(OUTPUT_DIR, 'source-map.json'), `${JSON.stringify(sourceMap, null, 2)}\n`);
await fs.writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);

console.log(`Generated ${items.length} keys from ${occurrences.length} UI occurrences.`);
