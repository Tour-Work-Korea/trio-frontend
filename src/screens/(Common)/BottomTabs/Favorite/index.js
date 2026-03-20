import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {MyLikeRecruitList, UserFavoriteGuesthouse, UserFavoriteMeet} from '@screens';
import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import useSwipeTabs from '@hooks/useSwipeTabs';

const TAB_ITEMS = [
  {key: 'guesthouse', label: '게하'},
  {key: 'meet', label: '콘텐츠'},
  {key: 'recruit', label: '스탭'},
];

const Favorite = () => {
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs: TAB_ITEMS,
    initialKey: 'guesthouse',
  });

  return (
    <View style={styles.container}>
      <Header title='찜' showBackButton={false} />

      <View style={styles.tabBar}>
        {TAB_ITEMS.map((tab, index) => {
          const active = isActive(tab.key);

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              onPress={() => onTabPress(index)}>
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onLayout={onPagerLayout}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.content}>
        <View style={[styles.page, pageWidth > 0 && {width: pageWidth}]}>
          <UserFavoriteGuesthouse hideHeader />
        </View>
        <View style={[styles.page, pageWidth > 0 && {width: pageWidth}]}>
          <UserFavoriteMeet hideHeader />
        </View>
        <View style={[styles.page, pageWidth > 0 && {width: pageWidth}]}>
          <MyLikeRecruitList hideHeader />
        </View>
      </ScrollView>
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
  page: {
    flex: 1,
  },
});

export default Favorite;
