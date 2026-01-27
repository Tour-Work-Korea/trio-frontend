import React, {useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import Logo from '@assets/images/guesthouse_reservation_success.svg';

const GuesthousePaymentSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId, receiptContext } = route.params || {};

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
  }, [navigation]);

  // const handleGoHome = () => {
  //   navigation.navigate('MainTabs', { screen: '홈' });
  // };

  return (
    <View style={styles.container}>
      <Logo />
      <View>
        <Text style={[FONTS.fs_20_semibold, styles.text]}>
          결제 완료되었어요!
          {'\n'} 이제 떠날 일만 남았어요 
        </Text>
        {/* <Text style={[FONTS.fs_16_medium, styles.subText]}>
          예약 확인이 완료되면 문자로 입금 안내를 드릴게요. {'\n'}
          입금이 완료되면 예약이 확정됩니다. 🌿
        </Text> */}
      </View>

      {/* <View style={styles.button}>
        <ButtonScarlet title={'홈으로'} onPress={handleGoHome}/>
      </View> */}
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
