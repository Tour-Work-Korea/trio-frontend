const fs = require('fs');
const path = require('path');

const screensDir = path.resolve(__dirname, '../src/screens');
const indexFile = path.join(screensDir, 'index.js');

// ✅ 재귀적으로 index.js가 있는 폴더만 탐색
function getAllExportableFolders(dir, basePath = '.') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let folders = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const hasIndex = fs.existsSync(path.join(fullPath, 'index.js'));
      if (hasIndex) {
        folders.push(relativePath);
      }

      // 📦 하위 폴더도 계속 탐색
      folders = folders.concat(getAllExportableFolders(fullPath, relativePath));
    }
  }

  return folders;
}

const exportableFolders = getAllExportableFolders(screensDir);

const exportLines = exportableFolders.map(folder => {
  const name = path.basename(folder); // 폴더 이름을 export 이름으로 사용
  return `export { default as ${name} } from './${folder.replace(/\\/g, '/')}';`;
});

fs.writeFileSync(indexFile, exportLines.join('\n'), 'utf8');
console.log('✅ screens/index.js 생성 완료');
