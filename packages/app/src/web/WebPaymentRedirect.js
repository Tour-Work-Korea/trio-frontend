import React, {useEffect} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {WEB_BASE_URL} from '@env';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function WebPaymentRedirect({route, reservationType}) {
  const navigation = useNavigation();
  const {reservationId, userCouponId, pointUsed} = route.params || {};

  useEffect(() => {
    const webBaseUrl = (WEB_BASE_URL || '').replace(/\/$/, '');

    if (!reservationId || !webBaseUrl || typeof window === 'undefined') {
      Alert.alert('결제 오류', '결제를 진행할 수 없습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
      return;
    }

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

    window.location.replace(
      `${webBaseUrl}/payments/toss/request/reservation?${paymentQuery.toString()}`,
    );
  }, [navigation, pointUsed, reservationId, reservationType, userCouponId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary_orange} />
      <Text style={styles.message}>결제 화면으로 이동하고 있어요.</Text>
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
  },
});
