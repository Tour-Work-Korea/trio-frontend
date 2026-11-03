import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {parseSync, traverse} from '@babel/core';

// A successful Vite build can still contain CommonJS calls that crash browsers.
// Inspect scope so bundled, locally defined require helpers are not rejected.
async function verify(target) {
  const entries = await readdir(target, {withFileTypes: true});
  let chunks = 0;
  const failures = [];
  for (const entry of entries) {
    const filename = path.join(target, entry.name);
    if (entry.isDirectory()) {
      const nested = await verify(filename);
      chunks += nested.chunks;
      failures.push(...nested.failures);
    } else if (entry.name.endsWith('.js')) {
      chunks += 1;
      const ast = parseSync(await readFile(filename, 'utf8'), {
        sourceType: 'module',
        configFile: false,
        babelrc: false,
      });
      traverse(ast, {
        CallExpression(call) {
          if (
            call.get('callee').isIdentifier({name: 'require'}) &&
            !call.scope.hasBinding('require')
          ) {
            failures.push(`${filename}:${call.node.loc.start.line}: unresolved require()`);
          }
        },
      });
    }
  }
  return {chunks, failures};
}

const target = process.argv[2];
if (!target) throw new Error('Usage: node scripts/verify-web-bundle.mjs <build-directory>');
const {chunks, failures} = await verify(path.resolve(target));
if (!chunks) throw new Error(`No JavaScript chunks found in ${target}`);
if (failures.length) throw new Error(`Browser-incompatible bundle:\n${failures.join('\n')}`);
console.log(`Verified ${chunks} browser chunks: no unresolved require() calls.`);
