import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';

import styles from './MyCouponList.styles';
import MyCouponOwnList from './MyCouponOwnList';
import MyCouponReceive from './MyCouponReceive';

const TABS = [
  {key: 'owned', label: i18n.t('common.holding')},
  {key: 'receive', label: i18n.t('common.getCoupon')},
];

const MyCouponList = () => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState('owned');

  return (
    <View style={styles.container}>
      <Header title={t('common.coupon')} />

      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            activeOpacity={1}
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
