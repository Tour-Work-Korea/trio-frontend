/**
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import '@utils/configureAndroidTextInput';
import App from '@trio/app/App.native';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background FCM message:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
