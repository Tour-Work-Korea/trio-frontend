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
  const navigation = useNavigation();
  const [couponCode, setCouponCode] = useState('');
  const [issuing, setIssuing] = useState(false);

  const handleIssueCoupon = async () => {
    const trimmedCode = couponCode.trim();

    if (!trimmedCode) {
      Alert.alert('쿠폰 코드 입력', '쿠폰코드를 적어주세요.');
      return;
    }

    try {
      setIssuing(true);
      await userMyApi.issueCouponByCode(trimmedCode);
      Toast.show({
        type: 'success',
        text1: '쿠폰이 등록되었어요!',
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.goBack();
    } catch (error) {
      console.warn('쿠폰 등록 실패:', error);
      Alert.alert(
        '등록 실패',
        error?.response?.data?.message ?? '쿠폰 등록 중 문제가 발생했어요.',
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
        <Header title="쿠폰등록" />

        <View style={styles.content}>
          <TextInput
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="쿠폰코드를 적어주세요"
            placeholderTextColor={COLORS.grayscale_400}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[FONTS.fs_16_medium, styles.input]}
          />

          <ButtonScarlet
            title={issuing ? '등록 중...' : '등록'}
            onPress={handleIssueCoupon}
            disabled={!couponCode.trim() || issuing}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default MyCouponRegister;
