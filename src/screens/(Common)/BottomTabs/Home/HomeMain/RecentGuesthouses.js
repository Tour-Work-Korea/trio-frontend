import React, {useCallback, useRef} from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './Home.styles';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ChevronRightGray from '@assets/images/chevron_right_gray.svg';

const RecentGuesthouseSeparator = () => (
  <View style={styles.recentGuesthouseGap} />
);

export default function RecentGuesthouses({guesthouses = []}) {
  const navigation = useNavigation();
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  const handleHorizontalScroll = useCallback(event => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
  }, []);

  const stopHorizontalMomentum = useCallback(event => {
    const offset = event.nativeEvent.contentOffset.x;
    scrollOffsetRef.current = offset;
    listRef.current?.scrollToOffset({offset, animated: false});
  }, []);

  const renderGuesthouse = ({item}) => (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.recentGuesthouseCard}
      onPress={() => {
        navigation.navigate('GuesthouseDetail', {
          id: item.id,
          checkIn: today.format('YYYY-MM-DD'),
          checkOut: tomorrow.format('YYYY-MM-DD'),
          guestCount: 1,
        });
      }}>
      {item.thumbnailUrl ? (
        <Image
          source={{uri: item.thumbnailUrl}}
          style={styles.recentGuesthouseImage}
        />
      ) : (
        <View
          style={[
            styles.recentGuesthouseImage,
            {backgroundColor: COLORS.grayscale_200},
          ]}
        />
      )}
      <Text
        style={[FONTS.fs_14_medium, styles.recentGuesthouseName]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {item.guesthouseName}
      </Text>
    </TouchableOpacity>
  );

  if (!guesthouses.length) {
    return null;
  }

  return (
    <View style={styles.recentGuesthouseContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.sectionTitle}>최근 본 게하</Text>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('RecentGuesthouseList');
          }}>
          <Text style={styles.seeMoreText}>더보기</Text>
          <ChevronRightGray width={24} height={24} />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={guesthouses}
        horizontal
        directionalLockEnabled
        nestedScrollEnabled={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleHorizontalScroll}
        onScrollEndDrag={stopHorizontalMomentum}
        keyExtractor={item => String(item.id)}
        renderItem={renderGuesthouse}
        ItemSeparatorComponent={RecentGuesthouseSeparator}
      />
    </View>
  );
}
