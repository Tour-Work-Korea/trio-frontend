import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';

import styles from './MyCouponList.styles';
import MyCouponOwnList from './MyCouponOwnList';
import MyCouponReceive from './MyCouponReceive';

const TABS = [
  {key: 'owned', label: '보유'},
  {key: 'receive', label: '쿠폰 받기'},
];

const MyCouponList = () => {
  const [activeTab, setActiveTab] = useState('owned');

  return (
    <View style={styles.container}>
      <Header title="쿠폰" />

      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab.key)}>
            <Text
              style={[
                styles.tabText,
                FONTS.fs_14_regular,
                activeTab === tab.key && styles.activeTabText,
                activeTab === tab.key && FONTS.fs_14_semibold,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContentContainer}>
        {activeTab === 'owned' ? <MyCouponOwnList /> : <MyCouponReceive />}
      </View>
    </View>
  );
};

export default MyCouponList;
