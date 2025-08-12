import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import styles from './MyGuesthouseReservationList.styles';

const MyGuesthouseReservationList = () => {
  return (
    <View style={styles.container}>
      <Header title="예약 관리" />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          예약 내역이 없습니다.
        </Text>
      </View>
    </View>
  );
};

export default MyGuesthouseReservationList;
