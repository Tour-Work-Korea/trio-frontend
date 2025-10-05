import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetMain.styles';
import MeetFilterModal from '@components/modals/Meet/MeetFilterModal';
import MeetSortModal from '@components/modals/Meet/MeetSortModal';
import userMeetApi from '@utils/api/userMeetApi';
import { toggleFavorite } from '@utils/toggleFavorite';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';

import { meetTags } from '@data/meetOptions';

// 임시 이미지
const bannerImages = [
  require('@assets/images/exphoto.jpeg'),
  require('@assets/images/exphoto.jpeg'),
  require('@assets/images/exphoto.jpeg'),
];

const PLACEHOLDER = require('@assets/images/exphoto.jpeg');

const {width} = Dimensions.get('window');

const MeetMain = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  // 필터 모달
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // 정렬 모달
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('recent'); // 기본 정렬: 실시간 인기 순

  const [selectedDateKey, setSelectedDateKey] = useState(dayjs().format('YYYY-MM-DD')); // 오늘

  // 모임 7일치 데이터
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(false);

  // 7일(오늘 + 6일)
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
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
      // 필요 시 기본값: { searchKeyword:"", page:0, size:10 } 등을 params로 넘길 수 있음
      const { data } = await userMeetApi.getRecentParties();
      // 안전 가드 및 정렬(기본: 시작시간 오름차순)
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) =>
        dayjs(a.partyStartDateTime).valueOf() - dayjs(b.partyStartDateTime).valueOf()
      );
      setMeets(list);
    } catch (e) {
      console.warn('getRecentParties error', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // 선택 날짜 기준 필터
  const filteredList = useMemo(() => {
    return meets.filter(m =>
      dayjs(m.partyStartDateTime).format('YYYY-MM-DD') === selectedDateKey
    );
  }, [meets, selectedDateKey]);

  function formatWhenTime(isoStr) {
    const d = dayjs(isoStr);
    const now = dayjs();
    const todayKey = now.format('YYYY-MM-DD');
    const dateKey = d.format('YYYY-MM-DD');

    let dayStr = '';
    if (dateKey === todayKey) dayStr = '오늘';
    else if (dateKey === now.add(1, 'day').format('YYYY-MM-DD')) dayStr = '내일';
    else {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      dayStr = days[d.day()];
    }

    return `${dayStr}, ${d.hour() < 12 ? '오전' : '오후'} ${d.format('h:mm')}`;
  }

  // 모임 즐겨찾기 토글
  const handleToggleFavorite = async (item) => {
    try {
      await toggleFavorite({
        type: 'party',
        id: item.partyId,
        isLiked: item.isLiked,
        setList: setMeets,
      });
    } catch (error) {
      console.warn('파티 즐겨찾기 토글 실패', error?.response?.data || error?.message);
    }
  };

  // 모임
  const renderMeetItem = ({ item }) => {
    const isFav = !!item.isLiked;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.meetItemContainer}
        onPress={() => navigation.navigate('MeetDetail', { partyId: item.partyId })}
      >
        <View style={styles.meetTopContainer}>
          <Image source={PLACEHOLDER} style={styles.meetThumb} />
          <View style={styles.meetInfo}>
            {/* 장소명 / 즐겨찾기 */}
            <View style={styles.meetTextRow}>
              <Text style={[FONTS.fs_12_medium, styles.meetPlace]} numberOfLines={1}>
                {item.guesthouseName}
              </Text>
              <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
                {isFav ? <HeartFilled width={20} height={20} /> : <HeartEmpty width={20} height={20} />}
              </TouchableOpacity>
            </View>

            {/* 제목 / 인원 */}
            <View style={styles.meetTextRow}>
              <Text
                style={[FONTS.fs_14_medium, styles.meetTitle]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
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
            ellipsizeMode="tail"
          >
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
        <Text style={[FONTS.fs_20_semibold, styles.headerText]}>모임</Text>
        <TouchableOpacity 
          style={styles.searchIcon}
          onPress={() => navigation.navigate('MeetSearch')}
        >
          <SearchIcon width={24} height={24}/>
        </TouchableOpacity>
      </View>
      
      {/* 배너 */}
      <View style={styles.bannerContainer}>
        <Carousel
          width={width * 0.9}
          height={120}
          style={{ alignItems: 'center', justifyContent:'center' }}
          autoPlay
          loop
          data={bannerImages}
          scrollAnimationDuration={2000}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: 50,
          }}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            <View style={styles.bannerImageContainer}>
              <Image source={item} style={styles.bannerImage} />
            </View>
          )}
        />

        {/* 인디케이터 */}
        <View style={styles.dotsContainer}>
          {bannerImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* 모임 일정 캘린더 */}
      <View style={styles.meetListContainer}>
        <Text style={[FONTS.fs_16_semibold, styles.headerText]}>모임 일정 캘린더</Text>
        {/* 날짜 칸 */}
        <View style={styles.dateTabsRow}>
          {dates.map(d => {
            const selected = d.key === selectedDateKey;
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.dateTab, selected && styles.dateTabSelected]}
                onPress={() => setSelectedDateKey(d.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    FONTS.fs_12_medium,
                    styles.dateTabTop,
                    selected && styles.dateTabTopSelected,
                  ]}
                >
                  {d.labelTop}
                </Text>
                <Text
                  style={[
                    FONTS.fs_16_regular,
                    styles.dateTabDayNum,
                    selected && styles.dateTabDayNumSelected,
                    selected && FONTS.fs_16_semibold,
                  ]}
                >
                  {d.dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.devide}/>

        {/* 필터/정렬 바 */}
        <View style={styles.filterBar}>
          <TouchableOpacity 
            style={styles.filterLeft}
            onPress={() => setFilterModalVisible(true)}
          >
            <FilterIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.filterText]}>필터</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagChipsContainer}
          >
            {meetTags.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={styles.tagChip}
                activeOpacity={0.8}
              >
                <Text style={[FONTS.fs_12_medium, styles.tagChipText]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.sortRight}
            onPress={() => setSortModalVisible(true)}
          >
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
        onApply={() => {}} // 아직 적용 로직 없음
      />

      {/* 정렬 모달 */}
      <MeetSortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selected={sortOption}
        onSelect={(value) => {
          setSortOption(value);
          setSortModalVisible(false);
        }}
      />
    </View>
  );
};

export default MeetMain;
