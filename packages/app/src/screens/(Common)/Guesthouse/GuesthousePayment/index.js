import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import SkeletonLayout, {Line} from '@screens/_components/SkeletonLayout';
import {useTranslation} from 'react-i18next';
import React, {useRef} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import useUserStore from '@stores/userStore';
import {WEB_BASE_URL} from '@env';

const GuesthousePayment = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const completingRef = useRef(false);
  const {reservationId, amount, receiptContext, userCouponId, pointUsed, paymentChannel = 'DOMESTIC'} =
    route.params || {};
  const reservationType = 'GUESTHOUSE';

  const accessToken = useUserStore(state => state.accessToken);

  const webBaseUrl = (WEB_BASE_URL || '').replace(/\/$/, '');

  if (!reservationId) {
    Alert.alert(t('common.paymentError'), t('common.paymentCannotBeProcessed'));
    navigation.goBack();
    return null;
  }

  if (!webBaseUrl) {
    console.warn('WEB_BASE_URL is missing');
    Alert.alert(
      t('common.paymentError'),
      t('common.paymentPageAddressNotFound'),
    );
    navigation.goBack();
    return null;
  }

  const handleMessage = async event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'PAYMENT_SUCCESS') {
        if (completingRef.current ||
            (data.reservationId != null && String(data.reservationId) !== String(reservationId)) ||
            (data.reservationType && data.reservationType !== reservationType)) return;
        completingRef.current = true;
        try {
          const response = await reservationPaymentApi.getRoomReservationDetail(reservationId);
          const latest = response?.data;
          if (!latest || ['CANCELLED', 'CANCELED'].includes(latest.reservationStatus)) {
            completingRef.current = false;
            return;
          }

          navigation.replace('GuesthousePaymentSuccess', {
            reservationId,
            reservationStatus: latest.reservationStatus,
            approvalStatus: latest.approvalStatus ?? data.approvalStatus,
            amount,
            receiptContext,
          });
        } catch {
          completingRef.current = false;
          Alert.alert(t('common.paymentError'), t('payment.confirmingPaymentCompletion'), [
            {text: t('common.confirm'), onPress: () => handleMessage(event)},
          ]);
        }
        return;
      }

      if (data.type === 'PAYMENT_FAIL') {
        Alert.alert(
          t('common.paymentFailed'),
          t('common.yourPaymentHasBeenCanceledOrFailed'),
        );
        navigation.goBack();
      }
    } catch (e) {
      console.log('WebView message parse error', e);
    }
  };

  const paymentQuery = new URLSearchParams({
    reservationId: String(reservationId),
    reservationType,
    paymentChannel,
  });

  if (userCouponId) {
    paymentQuery.append('userCouponId', String(userCouponId));
  }

  if (pointUsed) {
    paymentQuery.append('pointUsed', String(pointUsed));
  }

  const onShouldStartLoadWithRequest = request => {
    const {url} = request;

    const showExternalPaymentAppError = error => {
      console.warn('Failed to open external payment app');
      Alert.alert(
        t('common.notification'),
        t('common.theAppIsNotInstalled'),

        [{text: t('common.confirm'), onPress: () => navigation.goBack()}],
      );
    };

    if (Platform.OS === 'android' && url.startsWith('intent:')) {
      const schemeMatch = url.match(/scheme=([^;]+)/);
      const packageMatch = url.match(/package=([^;]+)/);

      if (schemeMatch && schemeMatch[1]) {
        const scheme = schemeMatch[1];
        const appUrl = url
          .replace('intent://', `${scheme}://`)
          .split('#Intent')[0];

        Linking.openURL(appUrl).catch(error => {
          if (packageMatch && packageMatch[1]) {
            Linking.openURL(`market://details?id=${packageMatch[1]}`).catch(
              showExternalPaymentAppError,
            );
            return;
          }
          showExternalPaymentAppError(error);
        });
      } else {
        Linking.openURL(url).catch(error => {
          if (packageMatch && packageMatch[1]) {
            Linking.openURL(`market://details?id=${packageMatch[1]}`).catch(
              showExternalPaymentAppError,
            );
            return;
          }
          showExternalPaymentAppError(error);
        });
      }
      return false;
    }

    if (
      Platform.OS === 'ios' &&
      !url.startsWith('http') &&
      !url.startsWith('about:blank')
    ) {
      Linking.openURL(url).catch(showExternalPaymentAppError);
      return false;
    }

    return true;
  };

  return (
    <WebView
      originWhitelist={['*']}
      source={{
        // 결제 페이지 진입
        uri: `${webBaseUrl}/payments/toss/request/reservation?${paymentQuery.toString()}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handleMessage}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      startInLoadingState
      renderLoading={() => (
        <SkeletonLayout style={{padding: 20, gap: 20}}>
          <Line width="65%" height={24} />
          <Line width="100%" height={140} />
          <Line width="100%" height={56} />
          <Line width="100%" height={56} />
        </SkeletonLayout>
      )}
      javaScriptCanOpenWindowsAutomatically
      setSupportMultipleWindows
      sharedCookiesEnabled
      thirdPartyCookiesEnabled

    />
  );
};

export default GuesthousePayment;
