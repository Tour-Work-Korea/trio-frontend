// const fs = require('fs');
// const path = require('path');

// const screensDir = path.resolve(__dirname, '../src/screens');
// const indexFile = path.join(screensDir, 'index.js');

// // ✅ 재귀적으로 index.js가 있는 폴더만 탐색
// function getAllExportableFolders(dir, basePath = '.') {
//   const entries = fs.readdirSync(dir, { withFileTypes: true });
//   let folders = [];

//   for (const entry of entries) {
//     const fullPath = path.join(dir, entry.name);
//     const relativePath = path.join(basePath, entry.name);

//     if (entry.isDirectory()) {
//       const hasIndex = fs.existsSync(path.join(fullPath, 'index.js'));
//       if (hasIndex) {
//         folders.push(relativePath);
//       }

//       // 📦 하위 폴더도 계속 탐색
//       folders = folders.concat(getAllExportableFolders(fullPath, relativePath));
//     }
//   }

//   return folders;
// }

// const exportableFolders = getAllExportableFolders(screensDir);

// const exportLines = exportableFolders.map(folder => {
//   const name = path.basename(folder); // 폴더 이름을 export 이름으로 사용
//   return `export { default as ${name} } from './${folder.replace(/\\/g, '/')}';`;
// });

// fs.writeFileSync(indexFile, exportLines.join('\n'), 'utf8');
// console.log('✅ screens/index.js 생성 완료');


// 📂 scripts/generateNavigation.js
// 👉 node scripts/generateNavigation.js 로 실행

const fs = require('fs');
const path = require('path');

// 👉 실제 프로젝트 경로에 맞게 수정해줘!
const screensDir = path.resolve(__dirname, '../src/screens');
const navigationsDir = path.resolve(__dirname, '../src/navigations');

// 경로 안에 있는 모든 exportable 폴더 찾기
function getExportableFolders(dir, basePath = '.') {
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
      folders = folders.concat(getExportableFolders(fullPath, relativePath));
    }
  }

  return folders;
}

// screens/index.js 자동 생성
function generateScreensIndex(exportableFolders) {
  const exportLines = exportableFolders.map(folder => {
    const name = path.basename(folder);
    const importPath = folder.replace(/\\/g, '/');
    return `export { default as ${name} } from './${importPath}';`;
  });

  const output = exportLines.join('\n') + '\n';
  fs.writeFileSync(path.join(screensDir, 'index.js'), output, 'utf8');
  console.log('✅ screens/index.js 생성 완료');
}

// (Common)/BottomTabs 스택 분리
function groupByStack(exportableFolders) {
  const groupMap = {};

  for (const folder of exportableFolders) {
    const parts = folder.split(path.sep);
    if (parts[0] === '(Common)' && parts[1] === 'BottomTabs') {
      const groupName = parts[2];
      if (!groupMap[groupName]) groupMap[groupName] = [];
      const screenName = path.basename(folder);
      groupMap[groupName].push({ name: screenName, path: folder.replace(/\\/g, '/') });
    }
  }
  return groupMap;
}

// 각 그룹의 스택 파일 생성
function generateStackFiles(groupMap) {
  if (!fs.existsSync(navigationsDir)) {
    fs.mkdirSync(navigationsDir);
  }

  for (const group in groupMap) {
    const importLines = groupMap[group].map(item => {
      return `import { ${item.name} } from '@screens';`;
    });

    const screenLines = groupMap[group].map(item => {
      return `<Stack.Screen name="${item.name}" component={${item.name}} />`;
    });

    const stackCode = `
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${importLines.join('\n')}

const Stack = createNativeStackNavigator();

const ${group}Stack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    ${screenLines.join('\n    ')}
  </Stack.Navigator>
);

export default ${group}Stack;
`.trim();

    const stackFilePath = path.join(navigationsDir, `${group}Stack.js`);
    fs.writeFileSync(stackFilePath, stackCode, 'utf8');
    console.log(`✅ ${group}Stack.js 생성 완료`);
  }
}

// RootNavigation 생성
function generateRootNavigation(groupMap) {
  const importLines = Object.keys(groupMap).map(group => {
    return `import ${group}Stack from './${group}Stack';`;
  });

  const stackLines = Object.keys(groupMap).map(group => {
    return `<Stack.Screen name="${group}" component={${group}Stack} />`;
  });

  const rootCode = `
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
${importLines.join('\n')}

const Stack = createNativeStackNavigator();

const RootNavigation = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      ${stackLines.join('\n      ')}
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigation;
`.trim();

  const rootFilePath = path.join(navigationsDir, 'RootNavigation.js');
  fs.writeFileSync(rootFilePath, rootCode, 'utf8');
  console.log('✅ RootNavigation.js 생성 완료');
}

// 전체 파이프라인
function main() {
  console.log('🚀 Navigation 자동 생성 시작...');
  const exportableFolders = getExportableFolders(screensDir);
  generateScreensIndex(exportableFolders);

  const groupMap = groupByStack(exportableFolders);
  generateStackFiles(groupMap);
  generateRootNavigation(groupMap);
  console.log('🎉 모든 작업 완료');
}

main();