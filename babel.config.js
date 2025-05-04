module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@constants': './src/constants',
          // '@hooks': './src/hooks',
          '@navigations': './src/navigations',
          '@screens': './src/screens',
          '@stores': './src/stores',
          '@utils': './src/utils',
          '@data': './src/data',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
