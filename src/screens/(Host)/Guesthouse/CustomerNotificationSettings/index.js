
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './CustomerNotificationSettings.styles';
import { FONTS } from '@constants/fonts';

import RightArrow from '@assets/images/chevron_right_black.svg';

const CustomerNotificationSettings = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Header title="고객 알림 설정"/>
      
      <View style={styles.body}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CheckInGuide')}
          style={styles.selectRow}
        >
          <Text style={[FONTS.fs_16_medium, styles.profileTitleText]}>체크인 안내문</Text>
          <RightArrow width={24} height={24}/>
        </TouchableOpacity>

        {/* 추후에 추가될거 생각 */}
        
      </View>
    </View>
  );
};

export default CustomerNotificationSettings;
