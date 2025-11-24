import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import dayjs from 'dayjs';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import styles from './MeetMain.styles';
import MeetFilterModal from '@components/modals/Meet/MeetFilterModal';
import MeetSortModal from '@components/modals/Meet/MeetSortModal';
import userMeetApi from '@utils/api/userMeetApi';
import adminApi from '@utils/api/adminApi';
import {toggleFavorite} from '@utils/toggleFavorite';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';

import {meetTags, meetScales, stayTypes} from '@data/meetOptions';

const {width} = Dimensions.get('window');

const MeetMain = () => {
  const navigation = useNavigation();

  // 배너
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  // 필터 모달
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // 정렬 모달
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('RECOMMEND'); // 기본 정렬: 실시간 인기 순

  // 필터
  const [scaleId, setScaleId] = useState(null);
  const [stayId, setStayId] = useState(null);

  const isBigById = useMemo(
    () => Object.fromEntries(meetScales.map(s => [s.id, s.isBigParty])),
    [],
  );
  const isGuestById = useMemo(
    () => Object.fromEntries(stayTypes.map(s => [s.id, s.isGuest])),
    [],
  );

  const [selectedDateKey, setSelectedDateKey] = useState(
    dayjs().format('YYYY-MM-DD'),
  ); // 오늘

  // 모임 7일치 데이터
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(false);

  // 7일(오늘 + 6일)
  const dates = useMemo(() => {
    return Array.from({length: 7}, (_, i) => {
      const d = dayjs().add(i, 'day');
      return {
        date: d,
        key: d.format('YYYY-MM-DD'),
        labelTop: getDateTopLabel(i, d),
        dayNum: d.date(),
      };
    });
  }, []);

  function getDateTopLabel(i, d) {
    if (i === 0) return '오늘';
    if (i === 1) return '내일';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[d.day()];
  }

  // 모임 불러오기
  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);

      const params = {sortBy: sortOption};
      if (scaleId) params.isBigParty = isBigById[scaleId];
      if (stayId) params.isGuest = isGuestById[stayId];

      const {data} = await userMeetApi.getRecentParties(params);
      const list = Array.isArray(data) ? data : [];
      setMeets(list);
    } catch (e) {
      console.warn('getRecentParties error', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }, [sortOption, scaleId, stayId, isBigById, isGuestById]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // 배너 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBannerLoading(true);
        const {data} = await adminApi.getMeetAdminBanners();
        // 안전 필터링: url이 있는 것만
        const list = Array.isArray(data) ? data.filter(b => !!b.url) : [];
        if (mounted) setBanners(list);
      } catch (e) {
        console.warn(
          'getMeetAdminBanners error',
          e?.response?.data || e?.message,
        );
        if (mounted) setBanners([]);
      } finally {
        if (mounted) setBannerLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 선택 날짜 기준 필터
  const filteredList = useMemo(() => {
    return meets.filter(
      m => dayjs(m.partyStartDateTime).format('YYYY-MM-DD') === selectedDateKey,
    );
  }, [meets, selectedDateKey]);

  function formatWhenTime(isoStr) {
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
  }

  // 모임 즐겨찾기 토글
  const handleToggleFavorite = async item => {
    try {
      await toggleFavorite({
        type: 'party',
        id: item.partyId,
        isLiked: item.isLiked,
        setList: setMeets,
      });
    } catch (error) {
      console.warn(
        '파티 즐겨찾기 토글 실패',
        error?.response?.data || error?.message,
      );
    }
  };

  // 모임
  const renderMeetItem = ({item}) => {
    const isFav = !!item.isLiked;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.meetItemContainer}
        onPress={() =>
          navigation.navigate('MeetDetail', {partyId: item.partyId})
        }>
        <View style={styles.meetTopContainer}>
          <Image source={{uri: item.partyImageUrl}} style={styles.meetThumb} />
          <View style={styles.meetInfo}>
            {/* 장소명 / 즐겨찾기 */}
            <View style={styles.meetTextRow}>
              <Text
                style={[FONTS.fs_12_medium, styles.meetPlace]}
                numberOfLines={1}>
                {item.guesthouseName}
              </Text>
              <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
                {isFav ? (
                  <HeartFilled width={20} height={20} />
                ) : (
                  <HeartEmpty width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* 제목 / 인원 */}
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

            {/* 가격 */}
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
            {item.location}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.timeText]}>
            {formatWhenTime(item.partyStartDateTime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View width={24} style={{backgroundColor: COLORS.grayscale_400}} />
        <Text style={[FONTS.fs_20_semibold, styles.headerText]}>모임</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MeetSearch')}>
          <SearchIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.bannerContainer}>
        {bannerLoading ? (
          <ActivityIndicator color={COLORS.grayscale_500} />
        ) : (
          <>
            <Carousel
              width={width}
              height={120}
              style={{alignItems: 'center', justifyContent: 'center'}}
              autoPlay
              loop
              data={banners}
              scrollAnimationDuration={3000}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 1,
                parallaxScrollingOffset: 50,
              }}
              onSnapToItem={index => setActiveIndex(index)}
              renderItem={({item}) => {
                const isHttps =
                  typeof item.link === 'string' &&
                  /^https:\/\//i.test(item.link);
                const onPress = async () => {
                  if (isHttps) {
                    try {
                      const supported = await Linking.canOpenURL(item.link);
                      if (supported) Linking.openURL(item.link);
                    } catch (e) {
                      console.warn('open banner link error', e?.message);
                    }
                  }
                };
                return (
                  <TouchableOpacity
                    activeOpacity={isHttps ? 0.85 : 1}
                    onPress={onPress}
                    style={styles.bannerImageContainer}>
                    <Image
                      source={{uri: item.url}}
                      style={styles.bannerImage}
                    />
                  </TouchableOpacity>
                );
              }}
            />

            {/* 인디케이터 */}
            <View style={styles.dotsContainer}>
              {banners.map((_, index) => (
                <View
                  key={String(index)}
                  style={[
                    styles.dot,
                    activeIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </View>

      {/* 모임 일정 캘린더 */}
      <View style={styles.meetListContainer}>
        <Text style={[FONTS.fs_16_semibold, styles.headerText]}>
          모임 일정 캘린더
        </Text>
        {/* 날짜 칸 */}
        <View style={styles.dateTabsRow}>
          {dates.map(d => {
            const selected = d.key === selectedDateKey;
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.dateTab, selected && styles.dateTabSelected]}
                onPress={() => setSelectedDateKey(d.key)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    FONTS.fs_12_medium,
                    styles.dateTabTop,
                    selected && styles.dateTabTopSelected,
                  ]}>
                  {d.labelTop}
                </Text>
                <Text
                  style={[
                    FONTS.fs_16_regular,
                    styles.dateTabDayNum,
                    selected && styles.dateTabDayNumSelected,
                    selected && FONTS.fs_16_semibold,
                  ]}>
                  {d.dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.devide} />

        {/* 필터/정렬 바 */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.filterLeft}
            onPress={() => setFilterModalVisible(true)}>
            <FilterIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.filterText]}>필터</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagChipsContainer}>
            {meetTags.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={styles.tagChip}
                activeOpacity={0.8}>
                <Text style={[FONTS.fs_12_medium, styles.tagChipText]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.sortRight}
            onPress={() => setSortModalVisible(true)}>
            <SortIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.sortText]}>정렬</Text>
          </TouchableOpacity>
        </View>

        {/* 리스트 */}
        <FlatList
          data={filteredList}
          keyExtractor={item => String(item.partyId)}
          renderItem={renderMeetItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
                선택한 날짜에 모임이 없어요.
              </Text>
            </View>
          }
        />
      </View>

      {/* 필터 모달 */}
      <MeetFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={next => {
          setScaleId(next.selectedScale ?? null);
          setStayId(next.selectedStay ?? null);
          setFilterModalVisible(false);
        }}
      />

      {/* 정렬 모달 */}
      <MeetSortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selected={sortOption}
        onSelect={value => {
          setSortOption(value);
          setSortModalVisible(false);
        }}
      />
    </View>
  );
};

export default MeetMain;
