import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import useUserStore from '@stores/userStore';
import Config from 'react-native-config';

const GuesthousePayment = ({route}) => {
  const navigation = useNavigation();
  const {reservationId, amount, receiptContext, userCouponId, pointUsed} =
    route.params || {};
  const reservationType = 'GUESTHOUSE';

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
        navigation.replace('GuesthousePaymentSuccess', {
          reservationId,
          amount,
          receiptContext,
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

  const logSuccessParams = url => {
    if (!url?.includes('/payments/toss/success')) return;

    try {
      const parsedUrl = new URL(url);
      console.log('Toss success params', {
        paymentKey: parsedUrl.searchParams.get('paymentKey'),
        orderId: parsedUrl.searchParams.get('orderId'),
        amount: parsedUrl.searchParams.get('amount'),
        paymentType: parsedUrl.searchParams.get('paymentType'),
      });
    } catch (error) {
      console.log('Toss success params parse error', error);
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

  return (
    <WebView
      source={{
        // 결제 페이지 진입
        uri: `${WEB_BASE_URL}/payments/toss/request/reservation?${paymentQuery.toString()}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handleMessage}
      startInLoadingState
      javaScriptCanOpenWindowsAutomatically
      setSupportMultipleWindows
      sharedCookiesEnabled
      thirdPartyCookiesEnabled

      onError={e => console.log('WebView onError', e.nativeEvent)}
      onHttpError={e => {
        console.log('WebView onHttpError', e.nativeEvent);
        logSuccessParams(e.nativeEvent?.url);
      }}
      onLoadStart={e => {
        console.log('WebView onLoadStart', e.nativeEvent.url);
        logSuccessParams(e.nativeEvent?.url);
      }}
      onLoadEnd={e => console.log('WebView onLoadEnd', e.nativeEvent.url)}
    />
  );
};

export default GuesthousePayment;
