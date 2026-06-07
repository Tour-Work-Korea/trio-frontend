const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');
const appPackageRoot = path.resolve(workspaceRoot, 'packages/app');

const defaultConfig = getDefaultConfig(projectRoot);

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
  blockList: exclusionList([
    new RegExp(`${path.resolve(projectRoot, 'ios/Pods').replace(/[/\\]/g, '[/\\\\]')}[/\\\\].*`),
    new RegExp(`${path.resolve(projectRoot, 'ios/build').replace(/[/\\]/g, '[/\\\\]')}[/\\\\].*`),
    new RegExp(`${path.resolve(projectRoot, 'android/build').replace(/[/\\]/g, '[/\\\\]')}[/\\\\].*`),
    new RegExp(`${path.resolve(workspaceRoot, 'apps/web/dist').replace(/[/\\]/g, '[/\\\\]')}[/\\\\].*`),
  ]),
  sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  nodeModulesPaths: [
    path.resolve(workspaceRoot, 'node_modules'),
    path.resolve(projectRoot, 'node_modules'),
  ],
  extraNodeModules: {
    '@trio/app': appPackageRoot,
    '@assets': path.resolve(appPackageRoot, 'src/assets'),
    '@components': path.resolve(appPackageRoot, 'src/components'),
    '@constants': path.resolve(appPackageRoot, 'src/constants'),
    '@hooks': path.resolve(appPackageRoot, 'src/hooks'),
    '@navigations': path.resolve(appPackageRoot, 'src/navigations'),
    '@screens': path.resolve(appPackageRoot, 'src/screens'),
    '@stores': path.resolve(appPackageRoot, 'src/stores'),
    '@utils': path.resolve(appPackageRoot, 'src/utils'),
    '@data': path.resolve(appPackageRoot, 'src/data'),
    '@web': path.resolve(appPackageRoot, 'src/web'),
  },
};

const config = {
  projectRoot,
  watchFolders: [workspaceRoot, appPackageRoot],
};

module.exports = mergeConfig(defaultConfig, config);
