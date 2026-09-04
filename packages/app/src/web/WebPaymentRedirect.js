import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {WEB_BASE_URL} from '@env';

import ButtonScarlet from '@components/ButtonScarlet';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

const POLLING_INTERVAL_MS = 1500;

const isCompletedPayment = (reservationType, data) => {
  if (reservationType === 'PARTY') {
    return Boolean(
      data?.approvedAt ||
      (data?.paymentType && data.paymentType !== 'UNKNOWN'),
    );
  }

  const paymentStatus = String(data?.paymentStatus || '').toUpperCase();
  return Boolean(
    data?.paymentAt ||
      ['DONE', 'PAID', 'COMPLETED', 'SUCCESS'].includes(paymentStatus),
  );
};

export default function WebPaymentRedirect({route, reservationType}) {
  const navigation = useNavigation();
  const {
    reservationId,
    userCouponId,
    pointUsed,
    paymentWindowName,
  } = route.params || {};
  const successParams = useMemo(() => {
    const {
      userCouponId: ignoredCouponId,
      pointUsed: ignoredPointUsed,
      paymentWindowName: ignoredPaymentWindowName,
      ...params
    } = route.params || {};

    return params;
  }, [route.params]);
  const paymentWindowRef = useRef(null);
  const hasOpenedPaymentWindowRef = useRef(false);
  const [isPaymentWindowOpen, setIsPaymentWindowOpen] = useState(false);

  const webBaseUrl = (WEB_BASE_URL || '').replace(/\/$/, '');
  const paymentQuery = new URLSearchParams({
    reservationId: String(reservationId || ''),
    reservationType,
  });

  if (userCouponId) {
    paymentQuery.append('userCouponId', String(userCouponId));
  }

  if (pointUsed) {
    paymentQuery.append('pointUsed', String(pointUsed));
  }

  const paymentUrl = `${webBaseUrl}/payments/toss/request/reservation?${paymentQuery.toString()}`;

  const openPaymentWindow = useCallback(() => {
    if (!webBaseUrl || typeof window === 'undefined') {
      return;
    }

    const popup = window.open(paymentUrl, paymentWindowName || '_blank');
    paymentWindowRef.current = popup;
    hasOpenedPaymentWindowRef.current = true;
    setIsPaymentWindowOpen(Boolean(popup));
  }, [paymentUrl, paymentWindowName, webBaseUrl]);

  useEffect(() => {
    if (!reservationId || !webBaseUrl || typeof window === 'undefined') {
      Alert.alert('결제 오류', '결제를 진행할 수 없습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
      return;
    }

  }, [navigation, reservationId, webBaseUrl]);

  useEffect(() => {
    if (!reservationId) {
      return undefined;
    }

    let isActive = true;
    let timerId;

    const checkPayment = async () => {
      let paymentCompleted = false;

      try {
        const response =
          reservationType === 'PARTY'
            ? await reservationPaymentApi.getPartyReservationDetail(reservationId)
            : await reservationPaymentApi.getRoomReservationDetail(reservationId);

        if (!isActive || !isCompletedPayment(reservationType, response?.data)) {
          return;
        }

        paymentCompleted = true;
        paymentWindowRef.current?.close();
        navigation.replace(
          reservationType === 'PARTY'
            ? 'MeetPaymentSuccess'
            : 'GuesthousePaymentSuccess',
          {reservationId, ...successParams},
        );
      } catch {
        // 결제 승인 전에는 상세 조회가 실패할 수 있어 다음 주기에 다시 확인합니다.
      } finally {
        if (
          isActive &&
          !paymentCompleted &&
          !hasOpenedPaymentWindowRef.current
        ) {
          openPaymentWindow();
        }

        if (isActive && !paymentCompleted) {
          if (paymentWindowRef.current?.closed) {
            setIsPaymentWindowOpen(false);
          }
          timerId = setTimeout(checkPayment, POLLING_INTERVAL_MS);
        }
      }
    };

    checkPayment();

    return () => {
      isActive = false;
      clearTimeout(timerId);
    };
  }, [
    navigation,
    openPaymentWindow,
    reservationId,
    reservationType,
    successParams,
  ]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary_orange} />
      <Text style={styles.message}>
        결제 완료를 확인하고 있어요.{'\n'}결제창을 닫지 말아주세요.
      </Text>
      {!isPaymentWindowOpen ? (
        <View style={styles.button}>
          <ButtonScarlet title={'결제창 다시 열기'} onPress={openPaymentWindow} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: COLORS.grayscale_100,
  },
  message: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 280,
  },
});
