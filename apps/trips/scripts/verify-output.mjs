import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const ownsPath = filename =>
  /^(trips|trips-assets)\//.test(filename) &&
  !filename.split('/').some(segment => segment === '..' || segment === '.');

export async function verifyOutput(root) {
  const files = [];
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${relative}`);
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), `${relative}/`);
      else {
        if (!ownsPath(relative)) throw new Error(`Unowned output: ${relative}`);
        files.push(relative);
      }
    }
  }
  await walk(root);
  for (const html of ['trips/index.html', 'trips/programs/index.html', 'trips/reground-jeju/index.html']) {
    const text = await readFile(path.join(root, html), 'utf8');
    const scripts = [...text.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
    if (!scripts.length || scripts.some(src => !src.startsWith('/trips-assets/build/') || !files.includes(src.slice(1)))) {
      throw new Error(`Missing or shared script reference: ${html}`);
    }
    if (/(?:src|href)="\/assets\//.test(text)) throw new Error(`Shared asset reference: ${html}`);
  }
  return files;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = await verifyOutput(path.resolve(process.argv[2]));
  console.log(`Verified ${files.length} files: only trips/ and trips-assets/ outputs.`);
}
