import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [locale, screen, device = 'booted'] = process.argv.slice(2);

if (!['ko', 'en'].includes(locale) || !screen) {
  const usage =
    'Usage: node scripts/capture-i18n-screenshot.mjs <ko|en> <screen-name> [device-id]';
  console.error(usage);
  process.exit(1);
}

const safeScreenName = screen.replace(/[^a-zA-Z0-9_-]/g, '-');
const outputDirectory = path.resolve('.i18n-screenshots', 'ios', locale);
const outputPath = path.join(outputDirectory, `${safeScreenName}.png`);

fs.mkdirSync(outputDirectory, {recursive: true});
execFileSync('xcrun', ['simctl', 'io', device, 'screenshot', outputPath], {
  stdio: 'inherit',
});

console.log(outputPath);
