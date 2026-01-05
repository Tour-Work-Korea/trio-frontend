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
import styles from './PopularMeetList.styles';
import { guesthouseTags } from '@data/guesthouseTags';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import { trimJejuPrefix } from '@utils/formatAddress';
import { toggleFavorite } from '@utils/toggleFavorite';

import HeaderImg from '@assets/images/meet_popular_header.svg';
import Workaways from '@assets/images/workaways_text_white.svg';
import StarIcon from '@assets/images/star_white.svg';
import LeftChevron from '@assets/images/chevron_left_white.svg';
import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';

const PAGE_SIZE = 10;
const TRENDING_CARD_WIDTH = SCREEN_WIDTH * 0.9;
const TRENDING_CARD_GAP = 16;
const TRENDING_SNAP_INTERVAL = TRENDING_CARD_WIDTH + TRENDING_CARD_GAP;

const PopularMeetList = () => {
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

  const normalizeGuesthouses = useCallback(
    (list = []) =>
      list.map((it) => ({
        ...it,
        isLiked: Boolean(it?.isLiked ?? it?.isFavorite ?? it?.favorite),
      })),
    [],
  );

  // ScrollView용 무한스크롤 로딩
  const loadMore = async () => {
    if (!hasNext || loading || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoading(true);

    try {
      const { data } = await userGuesthouseApi.getPopularGuesthouses({
        page: page + 1,
        size: PAGE_SIZE,
      });

      const normalized = normalizeGuesthouses(data?.content ?? []);
      setGuesthouses(prev => [...prev, ...normalized]);
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

      const normalized = normalizeGuesthouses(data?.content ?? []);

      setGuesthouses(normalized);
      setPage(0);
      setHasNext(!data?.last);
    } catch (e) {
      console.warn('초기 로딩 실패', e);
      setGuesthouses([]);
    } finally {
      setInitialLoading(false);
    }
  }, [normalizeGuesthouses]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const trendingList = guesthouses.slice(0, 3);
  const restList = guesthouses.slice(3);

  // --- 카드 UI들 (FlatList 제거, 컴포넌트만 재사용) ---
  const TrendingCard = ({ item, style }) => {
    const { hasRating, text } = getRatingInfo(item.avgRating);
    return (
      <TouchableOpacity
        style={[
          styles.trendingCard,
          { width: TRENDING_CARD_WIDTH, marginRight: TRENDING_CARD_GAP },
          style,
        ]}
        onPress={() =>
          navigation.navigate('GuesthouseDetail', {
            id: item.guesthouseId,
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
    const handleToggleFavorite = () => {
      toggleFavorite({
        type: 'guesthouse',
        id: item.guesthouseId,
        isLiked: item.isLiked,
        setList: setGuesthouses,
      });
    };

    return (
      <TouchableOpacity
        style={styles.popularCard}
        onPress={() =>
          navigation.navigate('GuesthouseDetail', {
            id: item.guesthouseId,
            checkIn: today.format('YYYY-MM-DD'),
            checkOut: tomorrow.format('YYYY-MM-DD'),
            guestCount: 1,
          })
        }>

        <View style={styles.imgRatingContainer}>
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={styles.popularImage} />
          ) : (
            <View style={[styles.popularImage, { backgroundColor: COLORS.grayscale_200 }]} />
          )}
          {hasRating && (
            <View style={styles.rating}>
              <StarIcon width={14} height={14} />
              <Text style={[FONTS.fs_12_medium, styles.ratingText]}>{text}</Text>
            </View>
          )}
        </View>

        <View style={styles.popularInfo}>
          <View style={styles.tagRow}>
            {(item.hashtagIds ?? []).slice(0, 3).map((id) => (
              <View key={id} style={styles.tagContainer}>
                <Text style={[FONTS.fs_body, styles.tagText]}>
                  {tagNameById[id] ?? `#${id}`}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.heartIcon} onPress={handleToggleFavorite}>
              {item.isLiked ? (
                <FillHeart width={20} height={20} />
              ) : (
                <EmptyHeart width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={[FONTS.fs_16_medium, styles.popularName]} numberOfLines={1}>
            {item.guesthouseName}
          </Text>
          {item.address ? (
            <Text style={[FONTS.fs_12_medium, styles.popularAddress]} numberOfLines={1}>
              {trimJejuPrefix(item.address)}
            </Text>
          ) : null}

          <View style={styles.popularBottomRow}>
            {Number(item.minAmount) > 0 ? (
              <Text style={[FONTS.fs_18_semibold, styles.popularPrice]}>
                {item.minAmount?.toLocaleString()}원 ~
              </Text>
            ) : (
              <Text style={[FONTS.fs_16_semibold, styles.popularEmptyPrice]}>
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
                인기 이벤트
              </Text>
            </View>

            <View style={styles.headerSubtitle}>
              <Workaways />
              <Text style={[FONTS.fs_16_medium, styles.headerSubtitleText]}>
                가장 인기 있는 이벤트들만 모아봤어요
              </Text>
            </View>
          </View>

          {/* 지금 뜨는 이벤트 */}
          <Text style={[FONTS.fs_16_semibold, styles.title]}>지금 뜨는 이벤트</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.trendingList}
            onScroll={(e) => {
              if (!trendingList.length) return;

              const offsetX = e.nativeEvent.contentOffset.x;
              const page = Math.round(offsetX / TRENDING_SNAP_INTERVAL);
              const clamped = Math.max(
                0,
                Math.min(page, trendingList.length - 1),
              );
              setCurrentPage(clamped);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingHorizontal: (SCREEN_WIDTH - TRENDING_CARD_WIDTH) / 2,
            }}
            decelerationRate="fast"
            snapToInterval={TRENDING_SNAP_INTERVAL}
            snapToAlignment="start"
          >
            {trendingList.map((item, index) => {
              const isLast = index === trendingList.length - 1;
              return (
                <TrendingCard
                  key={item.guesthouseId}
                  item={item}
                  style={isLast && { marginRight: 0 }}
                />
              );
            })}
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

          {/* 추천 이벤트 */}
          <Text style={[FONTS.fs_16_semibold, styles.title]}>
            추천 이벤트
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

export default PopularMeetList;
