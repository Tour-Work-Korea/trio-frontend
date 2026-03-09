import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {MyLikeRecruitList, UserFavoriteGuesthouse, UserFavoriteMeet} from '@screens';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Header from '@components/Header';

const TAB_ITEMS = [
  {key: 'guesthouse', label: '게하'},
  {key: 'meet', label: '콘텐츠'},
  {key: 'recruit', label: '스탭'},
];

const Favorite = () => {
  const [activeTab, setActiveTab] = useState('guesthouse');

  const content = useMemo(() => {
    if (activeTab === 'meet') return <UserFavoriteMeet hideHeader />;
    if (activeTab === 'recruit') return <MyLikeRecruitList hideHeader />;
    return <UserFavoriteGuesthouse hideHeader />;
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <Header title='찜' showBackButton={false}/>
      <View style={styles.tabBar}>
        {TAB_ITEMS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}>
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>{content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  tabBar: {
    flexDirection: 'row',
    // backgroundColor: COLORS.grayscale_0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.grayscale_200,
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary_orange,
    borderBottomWidth: 2,
  },
  tabLabel: {
    color: COLORS.grayscale_500,
  },
  tabLabelActive: {
    color: COLORS.primary_orange,
  },
  content: {
    flex: 1,
  },
});

export default Favorite;
