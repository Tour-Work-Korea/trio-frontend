import React, {useCallback, useRef} from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './Home.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import Star from '@assets/images/star_white.svg';

export default function Guesthouses({guesthouses}) {
  const navigation = useNavigation();
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  const getTagLabels = item =>
    (Array.isArray(item.hashtags) ? item.hashtags : [])
      .map(tag => (typeof tag === 'string' ? tag : tag?.hashtag ?? tag?.name ?? null))
      .filter(Boolean)
      .slice(0, 3);

  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  const renderGuesthouse = ({item}) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        navigation.navigate('GuesthouseDetail', {
          id: item.guesthouseId,
          checkIn: today.format('YYYY-MM-DD'),
          checkOut: tomorrow.format('YYYY-MM-DD'),
          guestCount: 1,
        });
      }}
    >
      <View style={styles.guesthouseCard}>
        <View>
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.guesthouseImage}
            />
          ) : (
            <View style={[styles.guesthouseImage, { backgroundColor: COLORS.grayscale_200 }]} />
          )}
          <View style={styles.ratingBox}>
            <Star width={14} height={14}/>
            <Text style={[FONTS.fs_14_medium, styles.ratingText]}>{item.avgRating}</Text>
          </View>
        </View>
        <View style={[styles.titleSection, {marginBottom: 10}]}>
          <Text
            style={styles.guesthouseTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.guesthouseName}
          </Text>
          {Number(item.minAmount) > 0 ? (
            // 정상 가격 노출
            <View style={styles.guesthousePrice}>
              <Text style={[FONTS.fs_12_medium, styles.guesthousePriceName]}>
                최저가
              </Text>
              <Text style={FONTS.fs_16_semibold}>
                {Number(item.minAmount).toLocaleString()}원 ~
              </Text>
            </View>
          ) : (
            // 예약 마감 노출
            <View style={styles.guesthousePrice}>
              <Text style={[FONTS.fs_16_semibold, { color: COLORS.grayscale_300 }]}>
                다른 날짜 확인
              </Text>
            </View>
          )}
        </View>
        <View style={styles.hashTagContainer}>
          {getTagLabels(item).map((tag, index) => (
            <View style={styles.hashtagButton} key={`${tag}-${index}`}>
              <Text style={[FONTS.fs_12_medium, styles.hashtagText]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleHorizontalScroll = useCallback(event => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
  }, []);

  const stopHorizontalMomentum = useCallback(event => {
    const offset = event.nativeEvent.contentOffset.x;
    scrollOffsetRef.current = offset;
    listRef.current?.scrollToOffset({offset, animated: false});
  }, []);

  return (
    <View style={styles.guesthouseContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>
          <Text style={{color: COLORS.primary_orange}}>게딱지</Text> 추천 게하
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('PopularGuesthouseList', {
              guesthouses,
            });
          }}
        >
          <Text style={styles.seeMoreText}>더보기</Text>
          <Chevron_right_gray width={24} height={24} />
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
        keyExtractor={item => String(item.guesthouseId)}
        renderItem={renderGuesthouse}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </View>
  );
}
