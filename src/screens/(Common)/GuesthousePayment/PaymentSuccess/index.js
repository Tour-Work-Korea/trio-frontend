import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts'; // 프로젝트에 맞게 조정
import { COLORS } from '@constants/colors'; // scarlet 등 사용 가능

const PaymentSuccess = () => {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: '홈' });
  };

  const handleViewReservations = () => {
    navigation.navigate('MyReservations'); // 예약 내역으로 이동 (스크린명 맞춰 수정)
  };

  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_h1_bold, styles.title]}>🎉 결제가 완료되었어요!</Text>
      <Text style={[FONTS.fs_body, styles.subtitle]}>
        예약이 정상적으로 완료되었습니다.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>홈으로 가기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleViewReservations}>
        <Text style={[styles.buttonText, styles.secondaryText]}>예약 내역 보기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.gray700,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.scarlet,
  },
  secondaryText: {
    color: COLORS.scarlet,
  },
});
