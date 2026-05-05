import React from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import useUserStore from '@stores/userStore';
import Config from 'react-native-config';

const MeetPayment = ({route}) => {
  const navigation = useNavigation();
  const {
    reservationId,
    amount,
    partyTitle,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
    thumbnailUrl,
    userCouponId,
    pointUsed,
  } = route.params || {};
  const reservationType = 'PARTY';

  const accessToken = useUserStore(state => state.accessToken);

  const WEB_BASE_URL = Config.WEB_BASE_URL;

  if (!reservationId) {
    Alert.alert('결제 오류', '결제를 진행할 수 없습니다.');
    navigation.goBack();
    return null;
  }

  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'PAYMENT_SUCCESS') {
        navigation.replace('MeetPaymentSuccess', {
          reservationId,
          amount,
          partyTitle,
          partyStartDateTime,
          partyStartTime,
          partyEndTime,
          thumbnailUrl,
        });
        return;
      }

      if (data.type === 'PAYMENT_FAIL') {
        Alert.alert('결제 실패', '결제가 취소되었거나 실패했습니다.');
        navigation.goBack();
      }
    } catch (e) {
      console.log('WebView message parse error', e);
    }
  };

  const paymentQuery = new URLSearchParams({
    reservationId: String(reservationId),
    reservationType,
  });

  if (userCouponId) {
    paymentQuery.append('userCouponId', String(userCouponId));
  }

  if (pointUsed) {
    paymentQuery.append('pointUsed', String(pointUsed));
  }

  const onShouldStartLoadWithRequest = request => {
    const {url} = request;

    if (Platform.OS === 'android' && url.startsWith('intent:')) {
      const schemeMatch = url.match(/scheme=([^;]+)/);
      const packageMatch = url.match(/package=([^;]+)/);
      
      if (schemeMatch && schemeMatch[1]) {
        const scheme = schemeMatch[1];
        const appUrl = url.replace('intent://', `${scheme}://`).split('#Intent')[0];
        
        Linking.openURL(appUrl).catch(() => {
          if (packageMatch && packageMatch[1]) {
            Linking.openURL(`market://details?id=${packageMatch[1]}`);
          }
        });
      } else {
        Linking.openURL(url).catch(() => {
          if (packageMatch && packageMatch[1]) {
            Linking.openURL(`market://details?id=${packageMatch[1]}`);
          }
        });
      }
      return false;
    }
    
    if (Platform.OS === 'ios' && !url.startsWith('http') && !url.startsWith('about:blank')) {
      Linking.openURL(url).catch(() => {
        Alert.alert('알림', '해당 앱이 설치되어 있지 않습니다.');
      });
      return false;
    }
    
    return true;
  };

  return (
    <WebView
      originWhitelist={['*']}
      source={{
        uri: `${WEB_BASE_URL}/payments/toss/request/reservation?${paymentQuery.toString()}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handleMessage}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      startInLoadingState
      javaScriptCanOpenWindowsAutomatically
      setSupportMultipleWindows
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      onError={e => console.log('WebView onError', e.nativeEvent)}
      onHttpError={e => console.log('WebView onHttpError', e.nativeEvent)}
      onLoadStart={e => console.log('WebView onLoadStart', e.nativeEvent.url)}
      onLoadEnd={e => console.log('WebView onLoadEnd', e.nativeEvent.url)}
    />
  );
};

export default MeetPayment;
