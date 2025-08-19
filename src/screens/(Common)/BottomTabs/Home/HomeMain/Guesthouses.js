import React from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './Home.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import { guesthouseTags } from '@data/guesthouseTags';

import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import Star from '@assets/images/star_white.svg';

export default function Guesthouses({guesthouses}) {
  const navigation = useNavigation();
  const tagNameById = Object.fromEntries(guesthouseTags.map(t => [t.id, t.hashtag]));

  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  const renderGuesthouse = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('GuesthouseDetail', {
          id: item.guesthouseId,
          isFromDeeplink: true,
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
            ellipsizeMode="tail">
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
                예약마감
              </Text>
            </View>
          )}
        </View>
        <View style={styles.hashTagContainer}>
          {(item.hashtagIds ?? []).slice(0, 3).map((id) => (
            <View style={styles.hashtagButton} key={id}>
              <Text style={[FONTS.fs_12_medium, styles.hashtagText]}>
                {tagNameById[id] ?? `#${id}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.guesthouseContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>인기 게스트하우스</Text>
        <TouchableOpacity
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
        data={guesthouses}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => String(item.guesthouseId)}
        renderItem={renderGuesthouse}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </View>
  );
}
