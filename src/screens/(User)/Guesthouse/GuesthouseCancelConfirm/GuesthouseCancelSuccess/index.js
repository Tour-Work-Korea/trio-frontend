import React, {useEffect} from 'react';
import {View, Text, SafeAreaView, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import CancelIcon from '@assets/images/cancel_reservation.svg';

const GuesthouseCancelSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const reservationId = route?.params?.reservationId ?? null;
  const reservationItem = route?.params?.reservationItem ?? null;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('GuesthouseCancelledReceipt', {
        reservationId,
        reservationItem,
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, reservationId, reservationItem]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <CancelIcon/>

        <Text style={[FONTS.fs_20_semibold, styles.title]}>
          취소가 완료되었어요
        </Text>
        <Text style={[FONTS.fs_16_medium, styles.desc]}>
          새로운 여행을 떠나고 싶을 때 다시 찾아주세요
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default GuesthouseCancelSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  title: {
    marginTop: 18,
    color: COLORS.grayscale_900,
  },

  desc: {
    marginTop: 6,
    color: COLORS.grayscale_500,
    textAlign: 'center',
    lineHeight: 18,
  },
});
