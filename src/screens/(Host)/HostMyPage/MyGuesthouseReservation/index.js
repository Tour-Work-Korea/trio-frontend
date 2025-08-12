import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';

import RightArrow from '@assets/images/chevron_right_black.svg';

const MyGuesthouseReservation = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Header title="게스트하우스 에약관리"/>
      
      <View style={styles.body}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MyGuesthouseReservationStatus')}
          style={styles.selectRow}
        >
          <Text style={[FONTS.fs_16_medium, styles.profileTitleText]}>게스트하우스 예약현황</Text>
          <RightArrow width={24} height={24}/>
        </TouchableOpacity>

        {/* 추후에 추가될거 생각 */}
        
      </View>
    </View>
  );
};

export default MyGuesthouseReservation;
