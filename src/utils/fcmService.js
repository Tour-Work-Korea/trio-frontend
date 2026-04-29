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

import { Alert } from 'react-native';

export const requestUserPermission = async () => {
  try {
    const androidGranted = await requestAndroidNotificationPermission();
    if (!androidGranted) {
      return false;
    }

    if (Platform.OS === 'ios') {
      try {
        await messaging().registerDeviceForRemoteMessages();
      } catch (err) {
        Alert.alert('FCM 에러', 'APNs 등록 중 무한 대기 또는 에러 발생!');
        return false;
      }
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
    Alert.alert('FCM 에러', `권한 요청 중 에러: ${error?.message}`);
    log.error('FCM permission rejection:', error);
    return false;
  }
};

export const syncFcmToken = async () => {
  try {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      Alert.alert('FCM 중단 (1/3)', '푸시 권한이 거절되었거나, APNs 등록에 실패했습니다.');
      return;
    }

    // FCM 토큰 가져오기
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      Alert.alert('FCM 중단 (2/3)', 'Firebase가 토큰을 주지 않습니다. (설정 파일 깨짐 의심)');
      log.warn('FCM token not available');
      return;
    }

    const deviceId = await getDeviceId();

    log.info('📤 syncFcmToken:', { deviceId, fcmToken });

    try {
      await notificationApi.registerToken(deviceId, fcmToken);
      Alert.alert('FCM 성공!', '백엔드로 완벽하게 토큰을 쐈습니다!');
    } catch (apiErr) {
      Alert.alert('FCM 에러 (3/3)', `백엔드 전송 실패: ${apiErr?.message}`);
    }

  } catch (error) {
    Alert.alert('FCM 에러 (알 수 없음)', error?.message);
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
