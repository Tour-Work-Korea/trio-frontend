import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import Logo from '@assets/images/meet_reservation_success.svg';

const MeetPaymentSuccess = () => {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: '홈' });
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Text style={[FONTS.fs_20_semibold, styles.text]}>
        예약 완료되었어요! {'\n'}
        이제 모임을 즐기러 가볼까요?
      </Text>

      <View style={styles.button}>
        <ButtonScarlet title={'홈으로'} onPress={handleGoHome}/>
      </View>
    </View>
  );
};

export default MeetPaymentSuccess;

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
  button: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
