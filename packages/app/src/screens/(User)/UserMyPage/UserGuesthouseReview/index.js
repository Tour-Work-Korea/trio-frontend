import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Header from '@components/Header';
import styles from './UserGuesthouseReview.styles';
import {FONTS} from '@constants/fonts';

import UserGuesthouseReviewWrite from './UserGuesthouseReviewWrite';
import UserGuesthouseReviewList from './UserGuesthouseReviewList';
import UserPartyReviewWrite from './UserPartyReviewWrite';
import UserPartyReviewList from './UserPartyReviewList';

const REVIEW_TYPES = [
  {key: 'guesthouse', label: i18n.t('common.guesthouse')},
  {key: 'party', label: i18n.t('common.activity')},
];

const TABS = [
  {key: 'write', label: i18n.t('guesthouse.writeAReview_324296')},
  {key: 'written', label: i18n.t('guesthouse.writtenReview')},
];

const UserGuesthouseReview = () => {
  const {t} = useTranslation();
  const [reviewType, setReviewType] = useState('guesthouse');
  const [activeTab, setActiveTab] = useState('write');

  const renderTabContent = () => {
    if (activeTab === 'write') {
      return reviewType === 'guesthouse' ? (
        <UserGuesthouseReviewWrite />
      ) : (
        <UserPartyReviewWrite />
      );
    } else if (activeTab === 'written') {
      return reviewType === 'guesthouse' ? (
        <UserGuesthouseReviewList />
      ) : (
        <UserPartyReviewList />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title={t('common.myReview')} />

      <View style={styles.reviewTypeContainer}>
        {REVIEW_TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            activeOpacity={1}
            style={[
              styles.reviewTypeButton,
              reviewType === type.key && styles.activeReviewTypeButton,
            ]}
            onPress={() => setReviewType(type.key)}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.reviewTypeText,
                reviewType === type.key && styles.activeReviewTypeText,
              ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
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

      {/* 탭 내용 */}
      <View style={styles.tabContentContainer}>{renderTabContent()}</View>
    </View>
  );
};

export default UserGuesthouseReview;
