import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';

import styles from './MyCouponRegister.styles';

const MyCouponRegister = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [couponCode, setCouponCode] = useState('');
  const [issuing, setIssuing] = useState(false);

  const handleIssueCoupon = async () => {
    const trimmedCode = couponCode.trim();

    if (!trimmedCode) {
      Alert.alert(
        t('coupon.enterCouponCode'),
        t('coupon.pleaseWriteDownTheCouponCode'),
      );
      return;
    }

    try {
      setIssuing(true);
      await userMyApi.issueCouponByCode(trimmedCode);
      Toast.show({
        type: 'success',
        text1: t('coupon.couponHasBeenRegistered'),
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.goBack();
    } catch (error) {
      console.warn('쿠폰 등록 실패:', error);
      Alert.alert(
        t('coupon.registrationFailed'),

        error?.response?.data?.message ??
          t('coupon.thereWasAProblemRegisteringTheCoupon'),
      );
    } finally {
      setIssuing(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Header title={t('coupon.couponRegistration_0d4d3b')} />

        <View style={styles.content}>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder={t('coupon.pleaseWriteTheCouponCode')}
            placeholderTextColor={COLORS.grayscale_400}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[FONTS.fs_16_medium, styles.input]}
          />

          <ButtonScarlet
            title={issuing ? t('coupon.registering') : t('common.register')}
            onPress={handleIssueCoupon}
            disabled={!couponCode.trim() || issuing}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default MyCouponRegister;
