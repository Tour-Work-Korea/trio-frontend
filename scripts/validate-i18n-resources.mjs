import fs from 'node:fs';
import path from 'node:path';

const localeDir = path.resolve('packages/app/src/locales');
const ko = JSON.parse(fs.readFileSync(path.join(localeDir, 'ko.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(localeDir, 'en.json'), 'utf8'));
const koKeys = Object.keys(ko).sort();
const enKeys = Object.keys(en).sort();
const errors = [];

const missingInEnglish = koKeys.filter(key => !(key in en));
const missingInKorean = enKeys.filter(key => !(key in ko));
if (missingInEnglish.length) errors.push(`Missing in en.json: ${missingInEnglish.join(', ')}`);
if (missingInKorean.length) errors.push(`Missing in ko.json: ${missingInKorean.join(', ')}`);

for (const key of [...new Set([...koKeys, ...enKeys])]) {
  if (typeof ko[key] !== 'string' || !ko[key].trim()) errors.push(`Empty Korean value: ${key}`);
  if (typeof en[key] !== 'string' || !en[key].trim()) errors.push(`Empty English value: ${key}`);
  if (/[가-힣]/.test(en[key] ?? '')) errors.push(`Korean remains in English value: ${key}`);

  const placeholders = value => (value?.match(/\{\{[^}]+\}\}/g) ?? []).sort().join('|');
  if (placeholders(ko[key]) !== placeholders(en[key])) {
    errors.push(`Placeholder mismatch: ${key}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${koKeys.length} matching Korean/English translation keys.`);
}
