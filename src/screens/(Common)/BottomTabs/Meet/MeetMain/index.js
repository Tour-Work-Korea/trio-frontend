import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, FlatList, ScrollView } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetMain.styles';
import MeetFilterModal from '@components/modals/Meet/MeetFilterModal';
import MeetSortModal from '@components/modals/Meet/MeetSortModal';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';

import { meetTags } from '@data/meetOptions';

// 임시 게하 데이터
import { MOCK_MEETS } from './mockData';

// 임시 이미지
const bannerImages = [
  require('@assets/images/exphoto.jpeg'),
  require('@assets/images/exphoto.jpeg'),
  require('@assets/images/exphoto.jpeg'),
];

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
  const [favorites, setFavorites] = useState({}); // { [id]: true }

  /** 7일(오늘 + 6일) */
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

  /** 리스트 */
  const filteredList = useMemo(() => {
    return MOCK_MEETS.filter(meet =>
      dayjs(meet.startAt).format('YYYY-MM-DD') === selectedDateKey
    );
  }, [selectedDateKey]);

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

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 게하
  const renderMeetItem = ({ item }) => {
    const isFav = !!favorites[item.id];
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={styles.meetItemContainer}
        onPress={() => navigation.navigate('MeetDetail')}
      >
        <View style={styles.meetTopContainer}>
          <Image source={item.thumbnail} style={styles.meetThumb} />
          <View style={styles.meetInfo}>
            {/* 게하 이름, 하트토글 */}
            <View style={styles.meetTextRow}>
              <Text style={[FONTS.fs_12_medium, styles.meetPlace]} numberOfLines={1}>
                {item.placeName}
              </Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.id)} >
                {isFav ? <HeartFilled width={20} height={20} /> : <HeartEmpty width={20} height={20} />}
              </TouchableOpacity>
            </View>
            {/* 글 제목, 인원수 */}
            <View style={styles.meetTextRow}>
              <Text style={[FONTS.fs_14_medium, styles.meetTitle]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
                {item.joined}/{item.capacity}명
              </Text>
            </View>
            {/* 가격 */}
            <View style={styles.meetBottomRow}>
              <Text style={[FONTS.fs_18_semibold, styles.price]}>
                {item.price.toLocaleString()}원
              </Text>
            </View> 
          </View>
        </View>
        <View style={styles.meetBottomContainer}>
          <Text style={[FONTS.fs_12_medium, styles.meetAddress]} numberOfLines={1}>
            {item.address}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.timeText]}>
            {formatWhenTime(item.startAt)}
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
          keyExtractor={item => String(item.id)}
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
