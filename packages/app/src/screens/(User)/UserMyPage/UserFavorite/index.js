import {useTranslation} from 'react-i18next';
import React from 'react';
import {
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  MyLikeRecruitList,
  UserFavoriteGuesthouse,
  UserFavoriteMeet,
} from '@screens';
import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import useSwipeTabs from '@hooks/useSwipeTabs';

const TAB_ITEMS = [
  {key: 'guesthouse', labelKey: 'common.guesthouse'},
  {key: 'meet', labelKey: 'common.activity'},
  {key: 'recruit', labelKey: 'common.staff'},
];

const UserFavorite = () => {
  const {t} = useTranslation();
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    swipeEnabled,
    onPagerLayout,
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    webSwipeHandlers,
  } = useSwipeTabs({
    tabs: TAB_ITEMS,
    initialKey: 'guesthouse',
  });

  return (
    <View style={styles.container}>
      <Header title={t('common.steamed')} />

      <View style={styles.tabBar}>
        {TAB_ITEMS.map((tab, index) => {
          const active = isActive(tab.key);

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={1}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              onPress={() => onTabPress(index)}>
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                ]}>
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        scrollEnabled={swipeEnabled}
        directionalLockEnabled
        pagingEnabled
        nestedScrollEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onLayout={onPagerLayout}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
        {...webSwipeHandlers}
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
    ...Platform.select({
      web: {
        touchAction: 'pan-y',
      },
    }),
  },
  contentContainer: {
    ...Platform.select({
      web: {
        touchAction: 'pan-y',
      },
    }),
  },
  page: {
    flex: 1,
  },
});

export default UserFavorite;
