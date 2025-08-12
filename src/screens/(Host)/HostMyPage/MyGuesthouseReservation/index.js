import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';

const MyGuesthouseReservation = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Header title="에약관리" />
      
      <Text>게스트하우스 예약현황</Text>
    </View>
  );
};

export default MyGuesthouseReservation;
