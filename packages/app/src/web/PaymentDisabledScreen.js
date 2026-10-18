import {useTranslation} from 'react-i18next';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function PaymentDisabledScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('payment.paymentIsNotSupportedOnTheWeb')}
      </Text>
      <Text style={styles.message}>
        {t('payment.reservationAndInquiryScreensCanAlsoBeUsedOnThe')}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>
          {t('payment.returnToPreviousScreen')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.grayscale_100,
  },
  title: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  message: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary_orange,
  },
  buttonText: {
    ...FONTS.fs_15_semibold,
    color: COLORS.grayscale_0,
  },
});
