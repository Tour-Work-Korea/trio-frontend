import React, {useEffect} from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import Logo from '@assets/images/guesthouse_reservation_success.svg';

const GuesthousePaymentSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId, receiptContext } = route.params || {};
  const isRequestConfirmationReservation =
    receiptContext?.reservationPolicy?.mode === 'REQUEST_CONFIRMATION';
  const successMessage = isRequestConfirmationReservation
    ? '예약 요청 완료!\n호스트 승인 후 예약이 최종 확정됩니다'
    : '결제 완료되었어요!\n이제 떠날 일만 남았어요';

  // 2초뒤 예약 획정 화면
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('GuesthousePaymentReceipt', {
        reservationId,
        receiptContext,
        isFromPaymentFlow: true,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, receiptContext, reservationId]);

  return (
    <View style={styles.container}>
      <Logo />
      <View>
        <Text style={[FONTS.fs_20_semibold, styles.text]}>
          {successMessage}
        </Text>
      </View>
    </View>
  );
};

export default GuesthousePaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.grayscale_100,
  },
  text: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.grayscale_700,
  },
  subText: {
    marginTop: -10,
    textAlign: 'center',
    color: COLORS.grayscale_700,
  },
  button: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    ...Platform.select({
      ios: {
        paddingBottom: 40,
      },
    }),
  },
});
