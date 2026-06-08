import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Header from '@components/Header';
import styles from './UserGuesthouseReview.styles';
import { FONTS } from '@constants/fonts';

import UserGuesthouseReviewWrite from './UserGuesthouseReviewWrite';
import UserGuesthouseReviewList from './UserGuesthouseReviewList';

const TABS = [
  { key: 'write', label: '리뷰쓰기' },
  { key: 'written', label: '작성한 리뷰' },
];

const UserGuesthouseReview = () => {
  const [activeTab, setActiveTab] = useState('write');

  const renderTabContent = () => {
    if (activeTab === 'write') {
      return <UserGuesthouseReviewWrite />;
    } else if (activeTab === 'written') {
      return <UserGuesthouseReviewList />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="나의 게하 리뷰" />

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                FONTS.fs_14_regular,
                activeTab === tab.key && styles.activeTabText,
                activeTab === tab.key && FONTS.fs_14_semibold,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 내용 */}
      <View style={styles.tabContentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
};

export default UserGuesthouseReview;
