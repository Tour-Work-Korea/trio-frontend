import path from 'path';
import {readFileSync} from 'fs';
import {defineConfig, loadEnv, transformWithEsbuild} from 'vite';
import react from '@vitejs/plugin-react';

const workspaceRoot = path.resolve(__dirname, '../..');
const appRoot = path.resolve(workspaceRoot, 'packages/app');
const appSrc = path.resolve(appRoot, 'src');
const webStubs = path.resolve(appSrc, 'web/stubs');

const exposedEnvKeys = [
  'API_BASE_URL',
  'KAKAO_CLIENT_ID',
  'KAKAO_JS_KEY',
  'KAKAO_NATIVEAPP_KEY',
  'KAKAO_REDIRECT_URI',
  'KAKAO_RESTAPI_KEY',
  'NAVER_CLIENT_ID',
  'WEB_BASE_URL',
];

export default defineConfig(({mode}) => {
  const rootEnv = loadEnv(mode, workspaceRoot, '');
  const clientEnv = Object.fromEntries(
    exposedEnvKeys.map(key => [key, rootEnv[key] ?? '']),
  );

  return {
  plugins: [
    {
      name: 'trio-svg-component-loader',
      enforce: 'pre',
      load(id) {
        const [filePath] = id.split('?');

        if (!filePath.endsWith('.svg')) {
          return null;
        }

        const svg = readFileSync(filePath, 'utf8');
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

        return `
          import React from 'react';
          import {Image} from 'react-native';

          const uri = ${JSON.stringify(dataUrl)};

          export default function SvgComponent({width, height, style, ...props}) {
            const sizeStyle = {
              ...(width == null ? null : {width}),
              ...(height == null ? null : {height}),
            };

            return React.createElement(Image, {
              ...props,
              source: {uri},
              style: [style, sizeStyle],
              resizeMode: props.resizeMode || 'contain',
            });
          }

          export const ReactComponent = SvgComponent;
          export const src = uri;
        `;
      },
    },
    {
      name: 'trio-rn-jsx-loader',
      enforce: 'pre',
      async transform(code, id) {
        const shouldTransform =
          id.includes('/packages/app/') ||
          id.includes('/node_modules/react-native-reanimated/') ||
          id.includes('/node_modules/react-native-calendars/') ||
          id.includes('/node_modules/react-native-swipe-gestures/') ||
          id.includes('/node_modules/@ptomasroos/react-native-multi-slider/');

        if (!shouldTransform || !id.endsWith('.js')) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
  ],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    global: 'globalThis',
    'globalThis.__TRIO_ENV__': JSON.stringify(clientEnv),
  },
  resolve: {
    extensions: [
      '.web.js',
      '.web.jsx',
      '.js',
      '.jsx',
      '.svg',
      '.png',
      '.jpg',
      '.jpeg',
      '.json',
    ],
    alias: [
      {find: /^react-native$/, replacement: path.resolve(webStubs, 'reactNative.js')},
      {find: '@trio/app', replacement: appRoot},
      {find: '@assets', replacement: path.resolve(appSrc, 'assets')},
      {find: '@components', replacement: path.resolve(appSrc, 'components')},
      {find: '@constants', replacement: path.resolve(appSrc, 'constants')},
      {find: '@hooks', replacement: path.resolve(appSrc, 'hooks')},
      {find: '@navigations', replacement: path.resolve(appSrc, 'navigations')},
      {find: '@screens', replacement: path.resolve(appSrc, 'screens')},
      {find: '@stores', replacement: path.resolve(appSrc, 'stores')},
      {find: '@utils/fcmService', replacement: path.resolve(webStubs, 'fcmService.js')},
      {find: '@utils', replacement: path.resolve(appSrc, 'utils')},
      {find: '@data', replacement: path.resolve(appSrc, 'data')},
      {find: '@web', replacement: path.resolve(appSrc, 'web')},
      {find: '@env', replacement: path.resolve(webStubs, 'env.js')},
      {find: '@react-navigation/native', replacement: path.resolve(webStubs, 'navigationNative.js')},
      {find: '@react-navigation/native-stack', replacement: path.resolve(webStubs, 'navigationNativeStack.js')},
      {find: '@react-navigation/bottom-tabs', replacement: path.resolve(webStubs, 'navigationBottomTabs.js')},
      {find: 'react-native-safe-area-context', replacement: path.resolve(webStubs, 'safeAreaContext.js')},
      {find: '@react-native-async-storage/async-storage', replacement: path.resolve(webStubs, 'asyncStorage.js')},
      {find: '@react-native-picker/picker', replacement: path.resolve(webStubs, 'picker.js')},
      {find: 'react-native-calendars', replacement: path.resolve(webStubs, 'calendars.js')},
      {find: '@mj-studio/react-native-naver-map', replacement: path.resolve(webStubs, 'naverMap.js')},
      {find: '@react-native-clipboard/clipboard', replacement: path.resolve(webStubs, 'clipboard.js')},
      {find: '@react-native-community/geolocation', replacement: path.resolve(webStubs, 'geolocation.js')},
      {find: '@react-native-firebase/messaging', replacement: path.resolve(webStubs, 'firebaseMessaging.js')},
      {find: '@react-native-firebase/crashlytics', replacement: path.resolve(webStubs, 'crashlytics.js')},
      {find: '@react-native-firebase/remote-config', replacement: path.resolve(webStubs, 'firebaseRemoteConfig.js')},
      {find: '@react-native-seoul/kakao-login', replacement: path.resolve(webStubs, 'kakaoLogin.js')},
      {find: '@ptomasroos/react-native-multi-slider', replacement: path.resolve(webStubs, 'multiSlider.js')},
      {find: 'color', replacement: path.resolve(webStubs, 'color.js')},
      {find: 'escape-string-regexp', replacement: path.resolve(webStubs, 'escapeStringRegexp.js')},
      {find: 'fast-deep-equal', replacement: path.resolve(webStubs, 'fastDeepEqual.js')},
      {find: 'query-string', replacement: path.resolve(webStubs, 'queryString.js')},
      {find: 'react-is', replacement: path.resolve(webStubs, 'reactIs.js')},
      {find: 'use-sync-external-store/with-selector', replacement: path.resolve(webStubs, 'useSyncExternalStoreWithSelector.js')},
      {find: /^use-latest-callback(\/.*)?$/, replacement: path.resolve(webStubs, 'useLatestCallback.js')},
      {find: 'warn-once', replacement: path.resolve(webStubs, 'warnOnce.js')},
      {find: 'lottie-react-native', replacement: path.resolve(webStubs, 'lottie.js')},
      {find: /^react-freeze(\/.*)?$/, replacement: path.resolve(webStubs, 'reactFreeze.js')},
      {find: 'react-native-reanimated-carousel', replacement: path.resolve(webStubs, 'reanimatedCarousel.js')},
      {find: 'react-native-reanimated', replacement: path.resolve(webStubs, 'reanimated.js')},
      {find: 'react-native-config', replacement: path.resolve(webStubs, 'reactNativeConfig.js')},
      {find: 'react-native-device-info', replacement: path.resolve(webStubs, 'deviceInfo.js')},
      {find: 'react-native-encrypted-storage', replacement: path.resolve(webStubs, 'encryptedStorage.js')},
      {find: 'react-native-google-mobile-ads', replacement: path.resolve(webStubs, 'mobileAds.js')},
      {find: 'react-native-image-picker', replacement: path.resolve(webStubs, 'imagePicker.js')},
      {find: 'react-native-image-resizer', replacement: path.resolve(webStubs, 'imageResizer.js')},
      {find: 'react-native-linear-gradient', replacement: path.resolve(webStubs, 'linearGradient.js')},
      {find: 'react-native-toast-message', replacement: path.resolve(webStubs, 'toast.js')},
      {find: 'react-native-webview', replacement: path.resolve(webStubs, 'webview.js')},
    ],
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: [
      'react-native',
      'react-native-reanimated',
      'react-native-gesture-handler',
      'react-native-screens',
      'react-native-safe-area-context',
      '@react-navigation/native',
      '@react-navigation/native-stack',
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  };
});
