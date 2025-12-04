import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './PopularGuesthouseList.styles';
import { guesthouseTags } from '@data/guesthouseTags';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';

import HeaderImg from '@assets/images/guesthouse_popular_header.svg';
import Workaways from '@assets/images/workaways_text_white.svg';
import StarIcon from '@assets/images/star_white.svg';
import LeftChevron from '@assets/images/chevron_left_white.svg';

const PAGE_SIZE = 10;

const PopularGuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const scrollViewRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const tagNameById = Object.fromEntries(
    guesthouseTags.map(t => [t.id, t.hashtag]),
  );

  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  const getRatingInfo = (avgRating) => {
    const num = Number(avgRating);
    const valid = Number.isFinite(num) && num > 0;
    return { hasRating: valid, text: valid ? num.toFixed(1) : '0.0' };
  };

  // 📌 ScrollView용 무한스크롤 로딩
  const loadMore = async () => {
    if (!hasNext || loading || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoading(true);

    try {
      const { data } = await userGuesthouseApi.getPopularGuesthouses({
        page: page + 1,
        size: PAGE_SIZE,
      });

      setGuesthouses(prev => [...prev, ...(data?.content ?? [])]);
      setPage(page + 1);
      setHasNext(!data?.last);
    } catch (e) {
      console.warn('추가 로딩 실패', e);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  };

  // 최초 로딩
  const fetchInitial = useCallback(async () => {
    setInitialLoading(true);

    try {
      const { data } = await userGuesthouseApi.getPopularGuesthouses({
        page: 0,
        size: PAGE_SIZE,
      });

      setGuesthouses(data?.content ?? []);
      setPage(0);
      setHasNext(!data?.last);
    } catch (e) {
      console.warn('초기 로딩 실패', e);
      setGuesthouses([]);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const trendingList = guesthouses.slice(0, 3);
  const restList = guesthouses.slice(3);

  // --- 카드 UI들 (FlatList 제거, 컴포넌트만 재사용) ---
  const TrendingCard = ({ item }) => {
    const { hasRating, text } = getRatingInfo(item.avgRating);
    return (
      <TouchableOpacity
        style={[styles.trendingCard, { width: SCREEN_WIDTH * 0.9 }]}
        onPress={() =>
          navigation.navigate('GuesthouseDetail', {
            id: item.guesthouseId,
            isFromDeeplink: true,
            checkIn: today.format('YYYY-MM-DD'),
            checkOut: tomorrow.format('YYYY-MM-DD'),
            guestCount: 1,
          })
        }>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.trendingImage} />
        ) : (
          <View style={[styles.trendingImage, { backgroundColor: COLORS.grayscale_200 }]} />
        )}

        {hasRating && (
          <View style={styles.trendingRating}>
            <View style={styles.ratingRow}>
              <StarIcon width={14} height={14} />
              <Text style={[FONTS.fs_14_medium, styles.ratingText]}>{text}</Text>
            </View>
          </View>
        )}

        <View style={styles.trendingInfo}>
          <Text style={[FONTS.fs_16_semibold, styles.trendingName]}>
            {item.guesthouseName}
          </Text>

          {Number(item.minAmount) > 0 ? (
            <View style={styles.trendingPriceContainer}>
              <Text style={[FONTS.fs_12_medium, styles.trendingPrice]}>최저가</Text>
              <Text style={[FONTS.fs_16_semibold, styles.trendingPriceText]}>
                {item.minAmount?.toLocaleString()}원 ~
              </Text>
            </View>
          ) : (
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
              <Text key={id} style={styles.tag}>
                {tagNameById[id] ?? `#${id}`}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const PopularCard = ({ item }) => {
    const { hasRating, text } = getRatingInfo(item.avgRating);
    return (
      <TouchableOpacity
        style={styles.popularCard}
        onPress={() =>
          navigation.navigate('GuesthouseDetail', {
            id: item.guesthouseId,
            isFromDeeplink: true,
            checkIn: today.format('YYYY-MM-DD'),
            checkOut: tomorrow.format('YYYY-MM-DD'),
            guestCount: 1,
          })
        }>

        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.popularImage} />
        ) : (
          <View style={[styles.popularImage, { backgroundColor: COLORS.grayscale_200 }]} />
        )}

        <View style={styles.popularInfo}>
          <View style={styles.popularTitleRow}>
            <Text style={[FONTS.fs_16_semibold, styles.popularName]}>
              {item.guesthouseName}
            </Text>
            {hasRating && (
              <View style={styles.ratingRow}>
                <StarIcon width={14} height={14} />
                <Text style={styles.ratingText}>{text}</Text>
              </View>
            )}
          </View>

          <View style={styles.popularBottomRow}>
            <View style={styles.tags}>
              {(item.hashtagIds ?? []).slice(0, 3).map((id) => (
                <Text key={id} style={styles.tag}>
                  {tagNameById[id] ?? `#${id}`}
                </Text>
              ))}
            </View>

            {Number(item.minAmount) > 0 ? (
              <Text style={[FONTS.fs_18_semibold, styles.popularPrice]}>
                {item.minAmount?.toLocaleString()}원 ~
              </Text>
            ) : (
              <Text
                style={[
                  FONTS.fs_18_semibold,
                  styles.popularPrice,
                  { color: COLORS.grayscale_300 },
                ]}>
                예약마감
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- UI 구성 ---
  return (
    <View style={styles.container}>
      {initialLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.grayscale_400} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          onScroll={({ nativeEvent }) => {
            const bottomReached =
              nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - 200;

            if (bottomReached) loadMore();
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* --- 상단 헤더 --- */}
          <View style={styles.headerContainer}>
            <HeaderImg style={styles.headerImg} />
            <View style={styles.headerTitle}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <LeftChevron width={28} height={28} />
              </TouchableOpacity>
              <Text style={[FONTS.fs_20_semibold, styles.headerTitleText]}>
                인기 게스트하우스
              </Text>
            </View>

            <View style={styles.headerSubtitle}>
              <Workaways />
              <Text style={[FONTS.fs_16_medium, styles.headerSubtitleText]}>
                가장 인기 있는 게스트하우스들만 모아봤어요
              </Text>
            </View>
          </View>

          {/* 지금 뜨는 게하 */}
          <Text style={[FONTS.fs_16_semibold, styles.title]}>지금 뜨는 게하</Text>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.trendingList}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const page = Math.round(offsetX / SCREEN_WIDTH);
              setCurrentPage(page);
            }}
            scrollEventThrottle={16}
          >
            {trendingList.map((item) => (
              <TrendingCard key={item.guesthouseId} item={item} />
            ))}
          </ScrollView>

          {/* 인디케이터 */}
          <View style={styles.indicatorContainer}>
            {trendingList.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  currentPage === index && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>

          {/* 믿고 가는 인기 게하 */}
          <Text style={[FONTS.fs_16_semibold, styles.title]}>
            믿고 가는 인기 게하
          </Text>

          {restList.map((item) => (
            <PopularCard key={item.guesthouseId} item={item} />
          ))}

          {/* --- 하단 로딩 --- */}
          {loading && hasNext && (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={COLORS.grayscale_400} />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default PopularGuesthouseList;
