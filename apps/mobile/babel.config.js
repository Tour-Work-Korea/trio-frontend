module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['../../packages/app/src'],
        alias: {
          '@trio/app': '../../packages/app',
          '@assets': '../../packages/app/src/assets',
          '@components': '../../packages/app/src/components',
          '@constants': '../../packages/app/src/constants',
          '@hooks': '../../packages/app/src/hooks',
          '@navigations': '../../packages/app/src/navigations',
          '@screens': '../../packages/app/src/screens',
          '@stores': '../../packages/app/src/stores',
          '@utils': '../../packages/app/src/utils',
          '@data': '../../packages/app/src/data',
          '@web': '../../packages/app/src/web',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '../../.env',
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
