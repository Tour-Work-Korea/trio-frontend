import fs from 'node:fs/promises';
import path from 'node:path';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

const traverse = traverseModule.default;
const generate = generateModule.default;
const root = process.cwd();
const sourceMap = JSON.parse(
  await fs.readFile(path.join(root, 'packages/app/src/locales/source-map.json'), 'utf8'),
);
const shouldWrite = process.argv.includes('--write');

const byFile = new Map();
for (const [key, entry] of Object.entries(sourceMap)) {
  for (const reference of entry.references) {
    if (!byFile.has(reference.file)) byFile.set(reference.file, []);
    byFile.get(reference.file).push({key, source: entry.source, ...reference});
  }
}

const clean = value => value.replace(/\s+/g, ' ').trim();
const callName = node => {
  if (!node) return '';
  if (t.isIdentifier(node)) return node.name;
  if (t.isMemberExpression(node) && !node.computed) {
    return `${callName(node.object)}.${callName(node.property)}`;
  }
  return '';
};

function templateValue(node) {
  let value = '';
  node.quasis.forEach((quasi, index) => {
    value += quasi.value.cooked ?? quasi.value.raw;
    if (index < node.expressions.length) {
      const expression = node.expressions[index];
      const name = t.isIdentifier(expression)
        ? expression.name
        : t.isMemberExpression(expression) && !expression.computed
          ? callName(expression).replaceAll('.', '_')
          : `value${index + 1}`;
      value += `{{${name}}}`;
    }
  });
  return clean(value);
}

function componentName(functionPath) {
  if (functionPath.isFunctionDeclaration()) return functionPath.node.id?.name;
  const parent = functionPath.parentPath;
  if (parent?.isVariableDeclarator() && t.isIdentifier(parent.node.id)) {
    return parent.node.id.name;
  }
  return null;
}

function owningComponent(nodePath) {
  let current = nodePath;
  let owner = null;
  while (current) {
    if (current.isFunction()) {
      const name = componentName(current);
      if (name && /^[A-Z]/.test(name)) owner = current;
    }
    current = current.parentPath;
  }
  return owner;
}

function interpolationObject(node) {
  const properties = node.expressions.map((expression, index) => {
    const name = t.isIdentifier(expression)
      ? expression.name
      : t.isMemberExpression(expression) && !expression.computed
        ? callName(expression).replaceAll('.', '_')
        : `value${index + 1}`;
    return t.objectProperty(t.identifier(name), expression);
  });
  return t.objectExpression(properties);
}

let changedFiles = 0;
let replacements = 0;
for (const [file, references] of byFile) {
  const absolutePath = path.join(root, file);
  const input = await fs.readFile(absolutePath, 'utf8');
  let ast;
  try {
    ast = parse(input, {sourceType: 'unambiguous', plugins: ['jsx', 'typescript']});
  } catch {
    continue;
  }

  const consumed = new Set();
  const hookOwners = new Set();
  let needsI18nImport = false;
  let fileReplacements = 0;

  const findReference = (source, line, kind) => {
    const candidates = references
      .map((reference, index) => ({reference, index}))
      .filter(({reference, index}) =>
        !consumed.has(index)
        && reference.kind === kind
        && reference.source === source,
      )
      .sort((a, b) =>
        Math.abs(a.reference.line - line) - Math.abs(b.reference.line - line),
      );
    const selected = candidates[0];
    if (!selected || Math.abs(selected.reference.line - line) > 40) return null;
    consumed.add(selected.index);
    return selected.reference;
  };

  const translationCall = (nodePath, key, interpolation) => {
    const owner = owningComponent(nodePath);
    const callee = owner
      ? t.identifier('t')
      : t.memberExpression(t.identifier('i18n'), t.identifier('t'));
    if (owner) hookOwners.add(owner);
    else needsI18nImport = true;
    const args = [t.stringLiteral(key)];
    if (interpolation?.properties?.length) args.push(interpolation);
    return t.callExpression(callee, args);
  };

  traverse(ast, {
    JSXText(nodePath) {
      const source = clean(nodePath.node.value);
      if (!source) return;
      const reference = findReference(source, nodePath.node.loc?.start.line ?? 0, 'jsx');
      if (!reference) return;
      nodePath.replaceWith(
        t.jsxExpressionContainer(translationCall(nodePath, reference.key)),
      );
      fileReplacements += 1;
    },
    TemplateLiteral(nodePath) {
      if (nodePath.parentPath.isTaggedTemplateExpression()) return;
      const source = templateValue(nodePath.node);
      const reference = findReference(source, nodePath.node.loc?.start.line ?? 0, 'template');
      if (!reference) return;
      nodePath.replaceWith(
        translationCall(nodePath, reference.key, interpolationObject(nodePath.node)),
      );
      fileReplacements += 1;
    },
    StringLiteral(nodePath) {
      if (
        nodePath.parentPath.isImportDeclaration()
        || nodePath.parentPath.isExportNamedDeclaration()
        || (nodePath.parentPath.isObjectProperty() && nodePath.key === 'key')
      ) return;
      const source = clean(nodePath.node.value);
      const reference = findReference(source, nodePath.node.loc?.start.line ?? 0, 'string');
      if (!reference) return;
      const call = translationCall(nodePath, reference.key);
      nodePath.replaceWith(
        nodePath.parentPath.isJSXAttribute()
          ? t.jsxExpressionContainer(call)
          : call,
      );
      fileReplacements += 1;
    },
  });

  if (!fileReplacements) continue;

  for (const owner of hookOwners) {
    if (!owner.get('body').isBlockStatement()) continue;
    const body = owner.get('body');
    const alreadyUsesHook = body.node.body.some(statement =>
      t.isVariableDeclaration(statement)
      && statement.declarations.some(declaration =>
        t.isCallExpression(declaration.init)
        && t.isIdentifier(declaration.init.callee, {name: 'useTranslation'}),
      ),
    );
    if (!alreadyUsesHook) {
      body.unshiftContainer(
        'body',
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.objectPattern([t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)]),
            t.callExpression(t.identifier('useTranslation'), []),
          ),
        ]),
      );
    }
  }

  const imports = ast.program.body.filter(statement => t.isImportDeclaration(statement));
  const reactI18nImport = imports.find(statement => statement.source.value === 'react-i18next');
  if (hookOwners.size && !reactI18nImport) {
    ast.program.body.unshift(
      t.importDeclaration(
        [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
        t.stringLiteral('react-i18next'),
      ),
    );
  } else if (hookOwners.size && reactI18nImport) {
    const hasSpecifier = reactI18nImport.specifiers.some(specifier =>
      t.isImportSpecifier(specifier) && specifier.imported.name === 'useTranslation',
    );
    if (!hasSpecifier) {
      reactI18nImport.specifiers.push(
        t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation')),
      );
    }
  }

  if (needsI18nImport && !imports.some(statement => statement.source.value === '@trio/app/src/i18n')) {
    ast.program.body.unshift(
      t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier('i18n'))],
        t.stringLiteral('@trio/app/src/i18n'),
      ),
    );
  }

  const output = `${generate(ast, {retainLines: true, jsescOption: {minimal: true}}, input).code}\n`;
  if (shouldWrite) await fs.writeFile(absolutePath, output);
  changedFiles += 1;
  replacements += fileReplacements;
}

console.log(`${shouldWrite ? 'Updated' : 'Would update'} ${changedFiles} files with ${replacements} translations.`);
