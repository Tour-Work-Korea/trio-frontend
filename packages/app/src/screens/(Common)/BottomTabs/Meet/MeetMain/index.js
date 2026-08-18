import React, {useMemo, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import dayjs from 'dayjs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import styles from './MeetMain.styles';
import MeetFilterModal from '@components/modals/Meet/MeetFilterModal';
import MeetSortModal from '@components/modals/Meet/MeetSortModal';
import userMeetApi from '@utils/api/userMeetApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import AppImage, {prefetchImageUrls} from '@components/AppImage';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import ChevronRightBlue from '@assets/images/chevron_right_blue.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import PeopleIcon from '@assets/images/people_gray.svg';
import MapPinIcon from '@assets/images/map_pin_fill_gray.svg';

import {meetScales, stayTypes} from '@constants/meetOptions';

const getPartyDisplayKey = party => {
  if (party?.applicationType === 'ADVANCE') {
    return [
      party?.contentId,
      party?.partyGroupId,
      party?.guesthouseId,
      party?.partyTitle,
      party?.partyImageUrl,
    ]
      .filter(Boolean)
      .join('|');
  }

  return String(party?.partyId ?? '');
};

const MeetMain = () => {
  const navigation = useNavigation();
  const inFlightKeyRef = useRef(null);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterInitialScrollTarget, setFilterInitialScrollTarget] =
    useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('RECOMMEND');
  const [filters, setFilters] = useState({
    hasApplied: false,
    contentTypes: undefined,
    isGuest: null,
    attendeeRange: undefined,
    priceOption: 'all',
    priceRange: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

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

  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestKey = useMemo(
    () => JSON.stringify({sortOption, scaleId, stayId, filters}),
    [sortOption, scaleId, stayId, filters],
  );

  const fetchRecent = useCallback(async () => {
    if (inFlightKeyRef.current === requestKey) {
      return;
    }

    try {
      inFlightKeyRef.current = requestKey;
      setLoading(true);

      const params = {sortBy: sortOption};
      if (scaleId) {
        params.isBigParty = isBigById[scaleId];
      }
      if (stayId) {
        params.isGuest = isGuestById[stayId];
      }
      if (filters.contentTypes?.length) {
        params.contentTypes = filters.contentTypes;
      }
      if (filters.isGuest !== null && filters.isGuest !== undefined) {
        params.isGuest = filters.isGuest;
      }
      if (filters.attendeeRange) {
        params.attendeeRange = filters.attendeeRange;
      }
      if (filters.priceRange) {
        params.priceRange = filters.priceRange;
      }
      if (filters.minPrice !== undefined) {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        params.maxPrice = filters.maxPrice;
      }

      const {data} = await userMeetApi.getRecentParties(params);
      const list = Array.isArray(data) ? data : [];
      setMeets(list);
      prefetchImageUrls(list.map(item => item.partyImageUrl), {limit: 8});
    } catch (e) {
      console.warn('getRecentParties error', e?.response?.data || e?.message);
    } finally {
      inFlightKeyRef.current = null;
      setLoading(false);
    }
  }, [requestKey, sortOption, scaleId, stayId, filters, isBigById, isGuestById]);

  useFocusEffect(
    useCallback(() => {
      fetchRecent();
    }, [fetchRecent]),
  );

  const groupedGuesthouses = useMemo(() => {
    const uniqueParties = meets.reduce((acc, party) => {
      const key = getPartyDisplayKey(party);

      if (!key || acc.seen.has(key)) {
        return acc;
      }

      acc.seen.add(key);
      acc.items.push(party);
      return acc;
    }, {seen: new Set(), items: []}).items;

    const grouped = uniqueParties.reduce((acc, party) => {
      const guesthouseName = party.guesthouseName || '게스트하우스';
      const guesthouseId = party.guesthouseId ?? party.guesthouse?.id ?? null;
      const key = guesthouseId ? `${guesthouseId}` : guesthouseName;
      if (!acc.has(key)) {
        acc.set(key, {
          guesthouseId,
          guesthouseName,
          parties: [],
        });
      }
      acc.get(key).parties.push(party);
      return acc;
    }, new Map());
    return Array.from(grouped.values());
  }, [meets]);

  function formatWhenTime(isoStr) {
    const d = dayjs(isoStr);
    return `${d.hour() < 12 ? '오전' : '오후'} ${d.format('h:mm')}`;
  }

  const handleToggleFavorite = async item => {
    try {
      await toggleFavorite({
        type: 'party',
        id: item.partyId,
        isLiked: item.isLiked,
        setList: setMeets,
      });
    } catch (error) {
      console.warn('파티 즐겨찾기 토글 실패', error?.response?.data?.message);
    }
  };

  // 파티 카드
  const renderPartyItem = item => {
    const isFav = !!item.isLiked;
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={String(item.partyId)}
        style={styles.partyCard}
        onPress={() =>
          navigation.navigate('MeetDetail', {partyId: item.partyId})
        }>
        <AppImage uri={item.partyImageUrl} style={styles.partyThumb} />
        <View style={styles.partyInfo}>
          <View style={styles.partyTopInfo}>
            <View style={styles.partyTitleRow}>
              <Text
                style={[FONTS.fs_16_semibold, styles.partyTitle]}
                numberOfLines={1}>
                {item.partyTitle}
              </Text>
              <TouchableOpacity
                activeOpacity={1} onPress={() => handleToggleFavorite(item)}>
                {isFav ? (
                  <HeartFilled width={20} height={20} />
                ) : (
                  <HeartEmpty width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.partyMetaRow}>
              <MapPinIcon width={16} height={16} />
              <Text
                style={[FONTS.fs_12_medium, styles.partyMetaText]}
                numberOfLines={1}>
                {trimJejuPrefix(item.location)} ·{' '}
                {formatWhenTime(item.partyStartDateTime)}
              </Text>
            </View>
            <View style={styles.partyPeopleRow}>
              <PeopleIcon width={16} height={16} />
              <Text style={[FONTS.fs_12_medium, styles.partyMetaText]}>
                최대인원 {item.maxAttendance}명
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 게하 카드
  const renderGuesthouseItem = ({item}) => {
    const handleMoveGuesthouse = () => {
      if (!item.guesthouseId) {
        return;
      }
      navigation.navigate('GuesthouseDetail', {
        id: item.guesthouseId,
        checkIn: dayjs().format('YYYY-MM-DD'),
        checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        guestCount: 1,
      });
    };

    return (
      <View style={styles.guesthouseSection}>
        <View style={styles.guesthouseTitleRow}>
          <Text style={[FONTS.fs_16_semibold, styles.guesthouseName]}>
            {item.guesthouseName}
          </Text>
          <TouchableOpacity
            style={styles.moveGuesthouseButton}
            activeOpacity={1}
            onPress={handleMoveGuesthouse}>
            <Text style={[FONTS.fs_12_medium, styles.moveGuesthouseText]}>
              게하 보러가기
            </Text>
            <ChevronRightBlue width={12} height={12} />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.chipRow}>
          <View style={[styles.countChip, styles.partyCountChip]}>
            <Text style={[FONTS.fs_12_medium, styles.partyCountText]}>
              게하 파티 {item.parties.length}
            </Text>
          </View>
          <View style={styles.countChip}>
            <Text style={[FONTS.fs_12_medium, styles.eventCountText]}>콘텐츠 0</Text>
          </View>
        </View> */}

        <View style={styles.partyList}>{item.parties.map(renderPartyItem)}</View>
      </View>
    );
  };

  const openFilterModal = target => {
    setFilterInitialScrollTarget(target ?? null);
    setFilterModalVisible(true);
  };

  const quickTags = [
    {label: '카테고리', target: 'category'},
    {label: '참여 대상', target: 'guest'},
    {label: '정원', target: 'capacity'},
    {label: '가격', target: 'price'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={[FONTS.fs_20_semibold, styles.contentTitle]}>콘텐츠</Text>
        <Text style={[FONTS.fs_16_medium, styles.contentSubTitle]}>
          콘텐츠가 있는 게스트하우스를 찾아보세요
        </Text>
        <TouchableOpacity
          style={styles.searchBox}
          activeOpacity={1}
          onPress={() => navigation.navigate('MeetSearch')}>
          <SearchIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_regular, styles.searchPlaceholder]}>
            언제 어디로 떠나시나요?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FlatList
          data={groupedGuesthouses}
          keyExtractor={(item, index) =>
            item.guesthouseId ? String(item.guesthouseId) : `${item.guesthouseName}-${index}`
          }
          renderItem={renderGuesthouseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* 검색 필터 */}
              <View style={styles.filterHeader}>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.filterButton}
                    onPress={() => openFilterModal(null)}>
                    <FilterIcon width={18} height={18} />
                    <Text style={[FONTS.fs_16_medium, styles.filterText]}>필터</Text>
                  </TouchableOpacity>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickTagScroll}>
                    {quickTags.map(tag => (
                      <TouchableOpacity
                        activeOpacity={1}
                        key={tag.label}
                        style={styles.quickTagChip}
                        onPress={() => openFilterModal(tag.target)}>
                        <Text style={[FONTS.fs_14_medium, styles.quickTagText]}>
                          {tag.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {/* <TouchableOpacity
                  activeOpacity={1}
                  style={styles.sortButton}
                  onPress={() => setSortModalVisible(true)}>
                  <SortIcon width={20} height={20} />
                  <Text style={[FONTS.fs_16_medium, styles.sortText]}>정렬</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={[FONTS.fs_16_regular, styles.emptyText]}>
                  표시할 콘텐츠가 없어요.
                </Text>
              )}
            </View>
          }
        />
      </View>

      <MeetFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filters}
        initialScrollTarget={filterInitialScrollTarget}
        onApply={next => {
          setFilters(next);
          setScaleId(null);
          setStayId(null);
          setFilterModalVisible(false);
        }}
      />

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
