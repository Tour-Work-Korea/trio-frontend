import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './PopularGuesthouseList.styles';
import { guesthouseTags } from '@data/guesthouseTags';

import HeaderImg from '@assets/images/guesthouse_popular_header.svg';
import Workaways from '@assets/images/workaways_text_white.svg';
import StarIcon from '@assets/images/star_white.svg';
import LeftChevron from '@assets/images/chevron_left_white.svg';

const PopularGuesthouseList = () => {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);
  const route = useRoute();
  const guesthouses = route.params?.guesthouses || [];
  const flatListRef = useRef(null);
  const tagNameById = Object.fromEntries(guesthouseTags.map(t => [t.id, t.hashtag]));

  const renderTrendingCard = (item) => (
    <View key={item.guesthouseId} style={[styles.trendingCard, { width: SCREEN_WIDTH * 0.9}]}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.trendingImage} />
      ) : (
        <View style={[styles.trendingImage, { backgroundColor: COLORS.grayscale_200 }]} />
      )}
      <View style={styles.trendingRating}>
        <View style={styles.ratingRow}>
          <StarIcon width={14} height={14} />
          <Text style={[FONTS.fs_14_medium, styles.ratingText]}>
            {Number(item.avgRating ?? 0).toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.trendingInfo}>
        <Text style={[FONTS.fs_16_semibold, styles.trendingName]}>{item.guesthouseName}</Text>
        {Number(item.minAmount) > 0 ? (
          // 정상 가격 노출
          <View style={styles.trendingPriceContainer}>
            <Text style={[FONTS.fs_12_medium, styles.trendingPrice]}>최저가</Text>
            <Text style={[FONTS.fs_16_semibold, styles.trendingPriceText]}>{item.minAmount?.toLocaleString()}원 ~</Text>
          </View>
        ) : (
          // 예약 마감 노출
          <View style={styles.trendingPriceContainer}>
            <Text style={[FONTS.fs_16_semibold, styles.trendingPriceText, { color: COLORS.grayscale_300 }]}>
              예약마감
            </Text>
          </View>
        )}
      </View>
      <View style={styles.trendingTag}>
        <View style={styles.tags}>
          {(item.hashtagIds ?? []).slice(0, 3).map((id) => (
            <Text key={id} style={styles.tag}>{tagNameById[id] ?? `#${id}`}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPopularCard = (item) => (
    <View key={item.id} style={styles.popularCard}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.popularImage} />
      ) : (
        <View style={[styles.popularImage, { backgroundColor: COLORS.grayscale_200 }]} />
      )}
      <View style={styles.popularInfo}>
        <View style={styles.popularTitleRow}>
          <Text style={[FONTS.fs_16_semibold, styles.popularName]}>{item.guesthouseName}</Text>
          <View style={styles.ratingRow}>
            <StarIcon width={14} height={14} />
            <Text style={styles.ratingText}>{Number(item.avgRating ?? 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.popularBottomRow}>
          <View style={styles.tags}>
            {(item.hashtagIds ?? []).slice(0, 3).map((id) => (
              <Text key={id} style={styles.tag}>{tagNameById[id] ?? `#${id}`}</Text>
            ))}
          </View>
          {Number(item.minAmount) > 0 ? (
            // 정상 가격 노출
            <Text style={[FONTS.fs_18_semibold, styles.popularPrice]}>{item.minAmount?.toLocaleString()}원 ~</Text>
          ) : (
            // 예약 마감 노출 
            <Text style={[FONTS.fs_18_semibold, styles.popularPrice, { color: COLORS.grayscale_300 }]}>
              예약마감
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <HeaderImg style={styles.headerImg} />
        <View style={styles.headerTitle}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <LeftChevron width={28} height={28}/>
          </TouchableOpacity>
          <Text style={[FONTS.fs_20_semibold, styles.headerTitleText]}>인기 게스트하우스</Text>
        </View>
        <View style={styles.headerSubtitle}>
          <Workaways />
          <Text style={[FONTS.fs_16_medium, styles.headerSubtitleText]}>가장 인기 있는 게스트하우스들만 모아봤어요</Text>
        </View>
      </View>

      <Text style={[FONTS.fs_16_semibold, styles.title]}>지금 뜨는 게하</Text>
      <FlatList
        ref={flatListRef}
        data={guesthouses.slice(0, 3)}
        renderItem={({ item }) => renderTrendingCard(item)}
        keyExtractor={(item) => String(item.guesthouseId)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const offsetX = e.nativeEvent.contentOffset.x;
          const page = Math.round(offsetX / SCREEN_WIDTH);
          setCurrentPage(page);
        }}
        style={styles.trendingList}
      />
      {/* 인디케이터 */}
      <View style={styles.indicatorContainer}>
        {guesthouses.slice(0, 3).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              currentPage === index && styles.indicatorDotActive,
            ]}
          />
        ))}
      </View>

      <Text style={[FONTS.fs_16_semibold, styles.title]}>믿고 가는 인기 게하</Text>
      <FlatList
        data={guesthouses.slice(3)}
        renderItem={({ item }) => renderPopularCard(item)}
        keyExtractor={(item) => String(item.guesthouseId)}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default PopularGuesthouseList;
