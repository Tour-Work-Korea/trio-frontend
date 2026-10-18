import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

const traverse = traverseModule.default;
const generate = generateModule.default;
const root = process.cwd();
const files = execFileSync('rg', ['--files', 'packages/app/src', 'packages/app', 'apps/web/src'], {
  cwd: root,
  encoding: 'utf8',
}).trim().split('\n').filter(file => /\.(js|jsx)$/.test(file));

let changedFiles = 0;
let changedHooks = 0;
for (const file of files) {
  const absolutePath = path.join(root, file);
  const input = await fs.readFile(absolutePath, 'utf8');
  let ast;
  try {
    ast = parse(input, {sourceType: 'unambiguous', plugins: ['jsx', 'typescript']});
  } catch {
    continue;
  }
  let changed = false;
  traverse(ast, {
    CallExpression(callPath) {
      if (
        !t.isIdentifier(callPath.node.callee)
        || !['useEffect', 'useMemo', 'useCallback'].includes(callPath.node.callee.name)
      ) return;
      const callbackPath = callPath.get('arguments.0');
      const dependencies = callPath.node.arguments[1];
      if (!callbackPath?.node || !t.isArrayExpression(dependencies)) return;
      let referencesTranslation = false;
      callbackPath.traverse({
        Identifier(identifierPath) {
          if (identifierPath.isReferencedIdentifier({name: 't'})) {
            referencesTranslation = true;
            identifierPath.stop();
          }
        },
      });
      if (
        referencesTranslation
        && !dependencies.elements.some(element => t.isIdentifier(element, {name: 't'}))
      ) {
        dependencies.elements.push(t.identifier('t'));
        changed = true;
        changedHooks += 1;
      }
    },
  });
  if (changed) {
    await fs.writeFile(
      absolutePath,
      `${generate(ast, {retainLines: true, jsescOption: {minimal: true}}, input).code}\n`,
    );
    changedFiles += 1;
  }
}

console.log(`Updated ${changedHooks} hook dependency lists in ${changedFiles} files.`);
