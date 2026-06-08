module.exports = {
  preset: 'react-native',
  rootDir: '../..',
  testMatch: ['<rootDir>/apps/mobile/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node', 'svg'],
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-calendars|react-native-reanimated-carousel|react-native-swipe-gestures)/)',
  ],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/apps/mobile/__mocks__/svgMock.js',
    '^react-native-reanimated$': '<rootDir>/apps/mobile/__mocks__/react-native-reanimated.js',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
    '^react-native-encrypted-storage$':
      '<rootDir>/packages/app/src/web/stubs/encryptedStorage.js',
    '^@react-native-seoul/kakao-login$':
      '<rootDir>/packages/app/src/web/stubs/kakaoLogin.js',
    '^@react-native-firebase/messaging$':
      '<rootDir>/packages/app/src/web/stubs/firebaseMessaging.js',
    '^@react-native-firebase/crashlytics$':
      '<rootDir>/packages/app/src/web/stubs/crashlytics.js',
    '^@react-native-firebase/remote-config$':
      '<rootDir>/packages/app/src/web/stubs/firebaseRemoteConfig.js',
    '^react-native-device-info$':
      '<rootDir>/packages/app/src/web/stubs/deviceInfo.js',
    '^@mj-studio/react-native-naver-map$':
      '<rootDir>/packages/app/src/web/stubs/naverMap.js',
    '^@react-native-clipboard/clipboard$':
      '<rootDir>/packages/app/src/web/stubs/clipboard.js',
    '^@react-native-community/geolocation$':
      '<rootDir>/packages/app/src/web/stubs/geolocation.js',
    '^@ptomasroos/react-native-multi-slider$':
      '<rootDir>/packages/app/src/web/stubs/multiSlider.js',
    '^lottie-react-native$': '<rootDir>/packages/app/src/web/stubs/lottie.js',
    '^react-native-config$':
      '<rootDir>/packages/app/src/web/stubs/reactNativeConfig.js',
    '^react-native-google-mobile-ads$':
      '<rootDir>/packages/app/src/web/stubs/mobileAds.js',
    '^react-native-image-picker$':
      '<rootDir>/packages/app/src/web/stubs/imagePicker.js',
    '^react-native-image-resizer$':
      '<rootDir>/packages/app/src/web/stubs/imageResizer.js',
    '^react-native-linear-gradient$':
      '<rootDir>/packages/app/src/web/stubs/linearGradient.js',
    '^react-native-toast-message$':
      '<rootDir>/packages/app/src/web/stubs/toast.js',
    '^react-native-webview$': '<rootDir>/packages/app/src/web/stubs/webview.js',
    '^@utils/fcmService$': '<rootDir>/packages/app/src/web/stubs/fcmService.js',
    '^@trio/app/(.*)$': '<rootDir>/packages/app/$1',
    '^@assets/(.*)$': '<rootDir>/packages/app/src/assets/$1',
    '^@components/(.*)$': '<rootDir>/packages/app/src/components/$1',
    '^@constants/(.*)$': '<rootDir>/packages/app/src/constants/$1',
    '^@hooks/(.*)$': '<rootDir>/packages/app/src/hooks/$1',
    '^@navigations/(.*)$': '<rootDir>/packages/app/src/navigations/$1',
    '^@screens/(.*)$': '<rootDir>/packages/app/src/screens/$1',
    '^@stores/(.*)$': '<rootDir>/packages/app/src/stores/$1',
    '^@utils/(.*)$': '<rootDir>/packages/app/src/utils/$1',
    '^@data/(.*)$': '<rootDir>/packages/app/src/data/$1',
    '^@web/(.*)$': '<rootDir>/packages/app/src/web/$1',
  },
};
