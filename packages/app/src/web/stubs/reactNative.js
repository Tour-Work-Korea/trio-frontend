import * as ReactNativeWeb from 'react-native-web';

export * from 'react-native-web';

export const Image = Object.assign(ReactNativeWeb.Image, {
  resolveAssetSource(source) {
    if (typeof source === 'string') {
      return {uri: source};
    }

    if (source?.uri) {
      return source;
    }

    return undefined;
  },
});

export const NativeModules = {};

export const PermissionsAndroid = {
  PERMISSIONS: {},
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  request: async () => 'denied',
  check: async () => false,
};

export default {
  ...ReactNativeWeb,
  Image,
  NativeModules,
  PermissionsAndroid,
};
