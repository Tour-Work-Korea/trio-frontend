import {cp, readdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function allowedKodaArtifact(filename) {
  return (
    ['koda/', 'koda-assets/', 'language-exchange/'].some(prefix =>
      filename.startsWith(prefix),
    ) || ['koda.html', 'language-exchange.html'].includes(filename)
  );
}
export async function verifyKodaArtifacts(root) {
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isSymbolicLink())
        throw new Error(`Unexpected symlink: ${relative}`);
      if (entry.isDirectory())
        await walk(path.join(directory, entry.name), `${relative}/`);
      else if (!allowedKodaArtifact(relative))
        throw new Error(`KODA build contains shared output: ${relative}`);
    }
  }
  await walk(root);
  const loader = await readFile(path.join(root, 'koda/entry.js'), 'utf8');
  const urls = [...loader.matchAll(/"(\/[^"\n]+)"/g)].map(match => match[1]);
  if (
    !urls.some(url => url.endsWith('.js')) ||
    !urls.some(url => url.endsWith('.css'))
  )
    throw new Error('KODA runtime must load JavaScript and CSS.');
  for (const url of urls) {
    if (!url.startsWith('/koda-assets/build/') || url.includes('..'))
      throw new Error(`KODA runtime depends on shared assets: ${url}`);
    if (!(await stat(path.join(root, url.slice(1)))).isFile())
      throw new Error(`Missing runtime asset: ${url}`);
  }
  for (const file of [
    'koda/index.html',
    'koda/event/index.html',
    'koda/join/index.html',
    'koda/my/index.html',
  ]) {
    const html = await readFile(path.join(root, file), 'utf8');
    if (/(?:src|href)="\/assets\//.test(html))
      throw new Error(`Shared assets referenced by ${file}`);
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (!process.argv[2])
    throw new Error(
      'Usage: node scripts/prepare-koda-web.mjs <KODA build directory>',
    );
  const root = path.resolve(process.argv[2]);
  await cp(
    new URL('../apps/web/public/koda-assets/', import.meta.url),
    path.join(root, 'koda-assets'),
    {recursive: true},
  );
  await verifyKodaArtifacts(root);
  console.log(
    'KODA output verified: only owned paths, with isolated runtime JS and CSS.',
  );
}
