import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetSearch.styles';
import userMeetApi from '@utils/api/userMeetApi';
import EmptyState from '@components/EmptyState';

import SearchIcon from '@assets/images/search_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import ChevronLeft from '@assets/images/chevron_left_gray.svg';
import SearchEmpty from '@assets/images/search_empty.svg';

const mapApiToUI = (it) => {
  const price = it.isGuest ? it.amount : (it.nonGuestAmount ?? it.amount);
  return {
    id: it.partyId,
    placeName: it.guesthouseName,
    title: it.partyTitle,
    address: it.location,
    thumbnailUri: it.partyImageUrl,
    startAt: it.partyStartDateTime,
    joined: it.numOfAttendance,
    capacity: it.maxAttendance,
    price: Number(price || 0),
    isLiked: !!it.isLiked,
  };
};

const MeetSearch = () => {
  const navigation = useNavigation();

  // 검색/목록/paging 상태
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const size = 10;
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  // 좋아요 토글
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 날짜 출력
  const todayKey = dayjs().format('YYYY-MM-DD');
  const formatWhen = isoStr => {
    const d = dayjs(isoStr);
    const isToday = d.format('YYYY-MM-DD') === todayKey;
    const label = (isToday ? '오늘, ' : `${d.date()}일, `) +
      `${d.hour() < 12 ? '오전' : '오후'} ${d.format('h:mm')}`;
    return { isToday, label };
  };

  // 모임 데이터 로더
  const fetchPage = useCallback(async (nextPage, reset = false) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const params = {
        searchKeyword: keyword ?? '',
        sort: 'RECOMMEND',
        page: nextPage,
        size,
      };
      const { data } = await userMeetApi.searchParties(params);
      const content = Array.isArray(data?.content) ? data.content : [];
      const mapped = content.map(mapApiToUI);

      setItems(prev => (reset ? mapped : [...prev, ...mapped]));
      setPage(nextPage);
      // hasNext: Spring Page 없다고 가정 → content 사이즈로 판정
      setHasNext(mapped.length === size);
    } catch (e) {
      console.log('searchParties error', e);
      // 실패 시 다음 페이지 요청 막기 위해 hasNext는 일단 false
      setHasNext(false);
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  }, [keyword, isFetching]);

  // 최초 로드
  useEffect(() => {
    fetchPage(0, true);
  }, []); // 첫 마운트

  // 검색 실행
  const submitSearch = () => {
    setRefreshing(true);
    setHasNext(true);
    fetchPage(0, true);
  };

  // 당겨서 새로고침
  const onRefresh = () => {
    setRefreshing(true);
    setHasNext(true);
    fetchPage(0, true);
  };

  // 무한 스크롤
  const loadMore = () => {
    if (isFetching || !hasNext) return;
    fetchPage(page + 1, false);
  };

  // 모임 리스트
  const renderItem = ({ item }) => {
    const when = formatWhen(item.startAt);
    const isFav = favorites[item.id] ?? item.isLiked;

    return (
      <TouchableOpacity
        style={styles.itemWrap}
        onPress={() => navigation.navigate('MeetDetail', { partyId: item.id })}
      >
        <View style={styles.itemTopWrap}>
          <Image
            source={item.thumbnailUri}
            style={styles.thumbnail}
          />
          <View style={styles.infoWrap}>
            <View style={styles.nameHeartWrap}>
              <Text style={[FONTS.fs_12_medium, styles.placeText]} numberOfLines={1}>
                {item.placeName}
              </Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                {isFav ? <HeartFilled width={20} height={20} /> : <HeartEmpty width={20} height={20} />}
              </TouchableOpacity>
            </View>
            <View style={styles.titleCapacityWrap}>
              <Text style={[FONTS.fs_14_medium, styles.titleText]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.countText]}>
                {item.joined}/{item.capacity}명
              </Text>
            </View>
            <Text style={[FONTS.fs_18_semibold, styles.priceText]}>
              {item.price.toLocaleString()}원
            </Text>
          </View>
        </View>
      
        <View style={styles.itemBottomWrap}>
          <Text style={[FONTS.fs_12_medium, styles.addressText]}>
            {item.address}
          </Text>
          <Text
            style={[
              FONTS.fs_12_medium,
              styles.timeText,
              when.isToday && styles.timeTextToday,
            ]}
          >
            {when.label}
          </Text>
          
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft width={24} height={24} />
        </TouchableOpacity>
        <Text style={[FONTS.fs_20_semibold, styles.headerTitle]}>모임</Text>
      </View>

      {/* 검색창 */}
      <View style={styles.searchBox}>
        <SearchIcon width={24} height={24} />
        <TextInput
          placeholder="찾는 모임이 있으신가요?"
          style={[FONTS.fs_14_regular, styles.input]}
          placeholderTextColor={COLORS.grayscale_600}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={submitSearch} // 엔터로 검색
          returnKeyType="search"
        />
      </View>

      {/* 모임 리스트 */}
      <View style={styles.meetListContainer}>
        <Text style={[FONTS.fs_14_medium, styles.sectionTitle]}>
          모임 중인 게스트하우스
        </Text>

        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, gap: 24, flexGrow: 1 }}
          onEndReachedThreshold={0.6}
          onEndReached={loadMore}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            !isFetching ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 }}>
                <EmptyState
                  icon={SearchEmpty}
                  iconSize={{ width: 120, height: 120 }}
                  title="조건에 맞는 모임이 없어요"
                  description="마음에 드는 모임을 찾으러 가볼까요?"
                />
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetching && items.length > 0 ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={COLORS.grayscale_500} />
              </View>
            ) : null
          }
        />
      </View>

    </View>
  );
};

export default MeetSearch;
