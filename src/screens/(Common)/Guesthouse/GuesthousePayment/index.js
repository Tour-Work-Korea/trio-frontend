import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import useUserStore from '@stores/userStore';

const GuesthousePayment = ({route}) => {
  const navigation = useNavigation();
  const {reservationId, amount, receiptContext} = route.params || {};
  const reservationType = 'GUESTHOUSE';

  const accessToken = useUserStore(state => state.accessToken);

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

  return (
    <WebView
      source={{
        // 결제 페이지 진입
        // uri: `https://dev.workaway.kr/payments/toss/request/reservation?reservationId=${reservationId}&reservationType=${reservationType}`,
        uri: `https://workaway.kr/payments/toss/request/reservation?reservationId=${reservationId}&reservationType=${reservationType}`,
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
      onHttpError={e => console.log('WebView onHttpError', e.nativeEvent)}
      onLoadStart={e => console.log('WebView onLoadStart', e.nativeEvent.url)}
      onLoadEnd={e => console.log('WebView onLoadEnd', e.nativeEvent.url)}
    />
  );
};

export default GuesthousePayment;
