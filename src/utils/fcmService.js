import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { log } from '@utils/logger';
import notificationApi from '@utils/api/notificationApi';

const DEVICE_ID_KEY = 'device_id_key';

export const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device-${uuidv4()}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    log.error('Error getting/generating device ID', error);
    return `device-${uuidv4()}`; // fallback
  }
};

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    log.error('Failed to request Android notification permission', error);
    return false;
  }
};

export const requestUserPermission = async () => {
  try {
    const androidGranted = await requestAndroidNotificationPermission();
    if (!androidGranted) {
      return false;
    }

    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      log.info('FCM Authorization status:', authStatus);
    }
    return enabled;
  } catch (error) {
    log.error('FCM permission rejection:', error);
    return false;
  }
};

export const syncFcmToken = async () => {
  try {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) return;

    // FCM 토큰 가져오기
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      log.warn('FCM token not available');
      return;
    }

    const deviceId = await getDeviceId();

    log.info('📤 syncFcmToken:', { deviceId, fcmToken });

    await notificationApi.registerToken(deviceId, fcmToken);

  } catch (error) {
    log.error('FCM sync error:', error);
  }
};

export const setupTokenRefreshListener = () => {
  return messaging().onTokenRefresh(async (newToken) => {
    try {
      const deviceId = await getDeviceId();
      log.info('🔄 FCM token refreshed:', newToken);
      await notificationApi.registerToken(deviceId, newToken);
    } catch (error) {
      log.error('FCM token refresh sync error:', error);
    }
  });
};
