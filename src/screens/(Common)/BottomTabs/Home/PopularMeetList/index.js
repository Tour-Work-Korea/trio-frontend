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
import userMeetApi from '@utils/api/userMeetApi';
import { trimJejuPrefix } from '@utils/formatAddress';
import { toggleFavorite } from '@utils/toggleFavorite';

import HeaderImg from '@assets/images/meet_popular_header.svg';
import Workaways from '@assets/images/workaways_text_white.svg';
import LeftChevron from '@assets/images/chevron_left_white.svg';
import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';

const PAGE_SIZE = 10;
const TRENDING_CARD_WIDTH = SCREEN_WIDTH * 0.9;
const TRENDING_CARD_GAP = 16;
const TRENDING_SNAP_INTERVAL = TRENDING_CARD_WIDTH + TRENDING_CARD_GAP;

const PopularMeetList = () => {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const scrollViewRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const formatPrice = (price) => {
    const num = Number(price || 0);
    if (num === 0) return '무료';
    return `${num.toLocaleString('ko-KR')}원`;
  };

  const formatWhenTime = (isoStr) => {
    const d = dayjs(isoStr);
    const now = dayjs();
    const todayKey = now.format('YYYY-MM-DD');
    const dateKey = d.format('YYYY-MM-DD');

    let dayStr = '';
    if (dateKey === todayKey) dayStr = '오늘';
    else if (dateKey === now.add(1, 'day').format('YYYY-MM-DD'))
      dayStr = '내일';
    else {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      dayStr = days[d.day()];
    }

    return `${dayStr}, ${d.hour() < 12 ? '오전' : '오후'} ${d.format('h:mm')}`;
  };

  const normalizeParties = useCallback(
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
      const { data } = await userMeetApi.searchParties({
        page: page + 1,
        size: PAGE_SIZE,
        // isGuest: false,
      });

      const normalized = normalizeParties(data?.content ?? []);
      setParties(prev => [...prev, ...normalized]);
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
      const { data } = await userMeetApi.searchParties({
        page: 0,
        size: PAGE_SIZE,
        // isGuest: false,
      });

      const normalized = normalizeParties(data?.content ?? []);

      setParties(normalized);
      setPage(0);
      setHasNext(!data?.last);
    } catch (e) {
      console.warn('초기 로딩 실패', e);
      setParties([]);
    } finally {
      setInitialLoading(false);
    }
  }, [normalizeParties]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const { trendingList, restList } = parties.reduce(
    (acc, item) => {
      const key = item?.partyId;
      if (acc.trendingList.length < 3 && !acc.seen.has(key)) {
        acc.seen.add(key);
        acc.trendingList.push(item);
      } else {
        acc.restList.push(item);
      }
      return acc;
    },
    { trendingList: [], restList: [], seen: new Set() },
  );

  // --- 카드 UI들 (FlatList 제거, 컴포넌트만 재사용) ---
  const TrendingCard = ({ item, style }) => {
    return (
      <TouchableOpacity
        style={[
          styles.trendingCard,
          { width: TRENDING_CARD_WIDTH, marginRight: TRENDING_CARD_GAP },
          style,
        ]}
        onPress={() => navigation.navigate('MeetDetail', { partyId: item.partyId })}>
        {item.partyImageUrl ? (
          <Image source={{ uri: item.partyImageUrl }} style={styles.trendingImage} />
        ) : (
          <View style={[styles.trendingImage, { backgroundColor: COLORS.grayscale_200 }]} />
        )}

        <View style={styles.trendingInfo}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text
              style={[FONTS.fs_16_semibold, styles.trendingTitle]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.partyTitle}
            </Text>
            <Text
              style={[FONTS.fs_16_semibold, styles.trendingPriceText]}
            >
              {formatPrice(item.amount)}
            </Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text
              style={[FONTS.fs_12_medium, styles.meetPlace]}
              numberOfLines={1}
            >
              {item.guesthouseName}
            </Text>
            <Text style={[FONTS.fs_14_regular, styles.timeText]}>
              {formatWhenTime(item.partyStartDateTime)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const PopularCard = ({ item }) => {
    const handleToggleFavorite = () => {
      toggleFavorite({
        type: 'party',
        id: item.partyId,
        isLiked: item.isLiked,
        setList: setParties,
      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.meetItemContainer}
        onPress={() => navigation.navigate('MeetDetail', { partyId: item.partyId })}>
        <View style={styles.meetTopContainer}>
          {item.partyImageUrl ? (
            <Image source={{ uri: item.partyImageUrl }} style={styles.meetThumb} />
          ) : (
            <View style={[styles.meetThumb, { backgroundColor: COLORS.grayscale_200 }]} />
          )}

          <View style={styles.meetInfo}>
            <View style={styles.meetTextRow}>
              <Text
                style={[FONTS.fs_12_medium, styles.meetPlace]}
                numberOfLines={1}
              >
                {item.guesthouseName}
              </Text>
              <View style={styles.meetPlaceSpacer} />
              <TouchableOpacity onPress={handleToggleFavorite}>
                {item.isLiked ? (
                  <FillHeart width={20} height={20} />
                ) : (
                  <EmptyHeart width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.meetTextRow}>
              <Text
                style={[FONTS.fs_14_medium, styles.meetTitle]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.partyTitle}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
                {item.numOfAttendance}/{item.maxAttendance}명
              </Text>
            </View>

            <View style={styles.meetBottomRow}>
              <Text style={[FONTS.fs_18_semibold, styles.price]}>
                {Number(item.amount || 0).toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.meetBottomContainer}>
          <Text
            style={[FONTS.fs_12_medium, styles.meetAddress]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {trimJejuPrefix(item.location)}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.timeText]}>
            {formatWhenTime(item.partyStartDateTime)}
          </Text>
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
                  key={item.partyId}
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
            <PopularCard key={item.partyId} item={item} />
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
