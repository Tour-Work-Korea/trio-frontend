import {Linking, Platform} from 'react-native';
import remoteConfig from '@react-native-firebase/remote-config';
import DeviceInfo from 'react-native-device-info';
import {compareVersions} from 'compare-versions';

const REMOTE_CONFIG_MIN_VERSION_KEY = 'min_version';

const STORE_CONFIG_BY_BUNDLE_ID = {
  'com.triofrontendapp': {
    iosAppId: '6746732522',
    androidPackageName: 'com.triofrontendapp',
  },
  'com.haneul.workaway': {
    iosAppId: '6746732522',
    androidPackageName: 'com.triofrontendapp',
  },
};

const getStoreConfig = () => {
  const bundleId = DeviceInfo.getBundleId();

  return (
    STORE_CONFIG_BY_BUNDLE_ID[bundleId] ?? {
      iosAppId: '6746732522',
      androidPackageName: bundleId,
    }
  );
};

export async function fetchMinimumVersion() {
  await remoteConfig().setConfigSettings({
    minimumFetchIntervalMillis: __DEV__ ? 0 : 5 * 60 * 1000,
    fetchTimeMillis: 10 * 1000,
  });

  await remoteConfig().setDefaults({
    [REMOTE_CONFIG_MIN_VERSION_KEY]: '0.0.0',
  });

  await remoteConfig().fetchAndActivate();

  return remoteConfig()
    .getValue(REMOTE_CONFIG_MIN_VERSION_KEY)
    .asString()
    .trim();
}

export async function checkForceUpdate() {
  try {
    const currentVersion = DeviceInfo.getVersion();
    const minVersion = await fetchMinimumVersion();

    if (!minVersion) {
      return {
        currentVersion,
        minVersion: '',
        shouldUpdate: false,
      };
    }

    return {
      currentVersion,
      minVersion,
      shouldUpdate: compareVersions(currentVersion, minVersion) < 0,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('force update check failed:', error?.message);
    }

    return {
      currentVersion: DeviceInfo.getVersion(),
      minVersion: '',
      shouldUpdate: false,
    };
  }
}

export async function openAppStoreForUpdate() {
  const {iosAppId, androidPackageName} = getStoreConfig();

  const primaryUrl =
    Platform.OS === 'ios'
      ? `https://apps.apple.com/app/id${iosAppId}`
      : `market://details?id=${androidPackageName}`;

  const fallbackUrl =
    Platform.OS === 'ios'
      ? primaryUrl
      : `https://play.google.com/store/apps/details?id=${androidPackageName}`;

  const targetUrl = (await Linking.canOpenURL(primaryUrl))
    ? primaryUrl
    : fallbackUrl;

  await Linking.openURL(targetUrl);
}
