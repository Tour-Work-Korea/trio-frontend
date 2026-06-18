import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import dayjs from 'dayjs';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import Person from '@assets/images/person20_gray.svg';
import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';
import Star from '@assets/images/star_white.svg';
import MapIcon from '@assets/images/map_black.svg';
import ListIcon from '@assets/images/bullet_list_black.svg';
import SearchEmpty from '@assets/images/search_empty.svg';

import styles from './GuesthouseList.styles';
import GuesthouseListMap from '../GuesthouseListMap';
import {FONTS} from '@constants/fonts';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import DateGuestModal from '@components/modals/Guesthouse/DateGuestModal';
import GuesthouseFilterModal from '@components/modals/Guesthouse/GuesthouseFilterModal';
import {COLORS} from '@constants/colors';
import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import { toggleFavorite } from '@utils/toggleFavorite';
import { trimJejuPrefix } from '@utils/formatAddress';
import {
  GUESTHOUSE_MAP_BOUNDS,
  getGuesthouseMapBoundsByRegionIds,
} from '@constants/guesthouseMapRegions';
import {WEB_ROUTES} from '@web/routes';

const EMPTY_REGION_IDS = [];
const EMPTY_CATEGORY_TAGS = [];
const CATEGORY_FILTERS = ['포틀럭', '독서', '디너파티', '서핑/레저', '프로그램'];
const CONTENT_TYPE_MAP = {
  포틀럭: 'POTLUCK',
  독서: 'BOOK',
  디너파티: 'DINNER_PARTY',
  '서핑/레저': 'SURF_LEISURE',
  프로그램: 'PROGRAM',
};
const ROOM_TYPE_MAP = {
  '일반 객실': 'PRIVATE',
  도미토리: 'DORMITORY',
};

const getGuesthouseFilterApiParams = filters => {
  const params = {};
  const contentTypes = (filters.tags || [])
    .map(tag => CONTENT_TYPE_MAP[tag])
    .filter(Boolean);
  const roomType = ROOM_TYPE_MAP[filters.roomType];

  if (contentTypes.length > 0) {
    params.contentTypes = contentTypes;
  }

  if (roomType) {
    params.roomType = roomType;
  }

  if (filters.minPrice !== 10000) {
    params.minPrice = filters.minPrice;
  }

  if (filters.maxPrice !== 1000000) {
    params.maxPrice = filters.maxPrice;
  }

  if (filters.onlyAvailable) {
    params.availableOnly = true;
  }

  if (filters.facility?.length > 0) {
    params.amenityIds = [...filters.facility];
  }

  return params;
};

const shouldUseInitialMapView = initialMapView => {
  if (!initialMapView) {
    return false;
  }

  if (Platform.OS !== 'web') {
    return true;
  }

  return typeof window !== 'undefined'
    && window.location?.pathname === WEB_ROUTES.MAP;
};

const goToWebPath = path => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  window.location.assign(path);
  return true;
};

const GuesthouseList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const defaultDisplayDate = `${dayjs().format('M.D dd')} - ${dayjs()
    .add(1, 'day')
    .format('M.D dd')}`;

  const [guesthouses, setGuesthouses] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const loadingRef = useRef(false);
  const isLastRef = useRef(false);
  const errorRef = useRef(false);
  const manualListModeRef = useRef(false);
  const lastMapResetKeyRef = useRef(null);

  const {
    displayDate: routeDisplayDate = defaultDisplayDate,
    adultCount: routeAdultCount = 1,
    childCount: routeChildCount = 0,
    searchText = '',
    categoryTags = EMPTY_CATEGORY_TAGS,
    regionIds = EMPTY_REGION_IDS,
    regionBounds: initialRegionBounds = null,
    initialMapView = false,
    mapResetKey = 0,
  } = route.params || {};
  const selectedCategoryTags = useMemo(
    () => (Array.isArray(categoryTags) ? categoryTags : []),
    [categoryTags],
  );

  const regionBounds = useMemo(
    () =>
      initialRegionBounds
        ?? getGuesthouseMapBoundsByRegionIds(regionIds)
        ?? GUESTHOUSE_MAP_BOUNDS.ALL,
    [initialRegionBounds, regionIds],
  );

  // 모달
  const [dateGuestModalVisible, setDateGuestModalVisible] = useState(false);
  const [modalInitialSection, setModalInitialSection] = useState('date');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isMapView, setIsMapView] = useState(() =>
    shouldUseInitialMapView(initialMapView),
  );
  const [viewModeVersion, setViewModeVersion] = useState(0);

  // 필터 정보
  const [filterOptions, setFilterOptions] = useState({
    tags: selectedCategoryTags,
    minPrice: 10000,
    maxPrice: 1000000,
    roomType: null,
    facility: [], // amenity object { id, name }
    onlyAvailable: false,
  });
  const [filterApplied, setFilterApplied] = useState(
    selectedCategoryTags.length > 0,
  );

  const isInitialLoading = loading && guesthouses.length === 0;

  const filteredGuesthouses = guesthouses;

  const filterApiParams = useMemo(
    () => getGuesthouseFilterApiParams(filterOptions),
    [filterOptions],
  );

  // 상태 - 처음에는 props 값으로 초기화
  const [adultCount, setAdultCount] = useState(routeAdultCount || 1);
  const [childCount, setChildCount] = useState(routeChildCount || 0);
  const [displayDateState, setDisplayDateState] = useState(routeDisplayDate);

  const resetListState = useCallback(() => {
    loadingRef.current = false;
    isLastRef.current = false;
    errorRef.current = false;
    setPage(0);
    setLoading(false);
    setIsLast(false);
    setGuesthouses([]);
    setError(false);
  }, []);

  useEffect(() => {
    setFilterOptions(prev => {
      const nextFilters = {
        ...prev,
        tags: selectedCategoryTags,
      };

      setFilterApplied(
        nextFilters.tags.length > 0 ||
        Boolean(nextFilters.roomType) ||
        nextFilters.facility.length > 0 ||
        nextFilters.onlyAvailable ||
        nextFilters.minPrice !== 10000 ||
        nextFilters.maxPrice !== 1000000
      );

      return nextFilters;
    });
    resetListState();
  }, [resetListState, selectedCategoryTags]);

  useEffect(() => {
    setDisplayDateState(routeDisplayDate);
    setAdultCount(routeAdultCount);
    setChildCount(routeChildCount);

    if (lastMapResetKeyRef.current !== mapResetKey) {
      lastMapResetKeyRef.current = mapResetKey;
      manualListModeRef.current = false;
    }

    if (
      shouldUseInitialMapView(initialMapView)
      && !manualListModeRef.current
    ) {
      setIsMapView(true);
    } else if (!shouldUseInitialMapView(initialMapView)) {
      setIsMapView(false);
    }
  }, [
    initialMapView,
    mapResetKey,
    routeAdultCount,
    routeChildCount,
    routeDisplayDate,
  ]);

  // api 보낼 날짜 데이터
  const year = dayjs().year();
  const [startInit, endInit] = routeDisplayDate.split(' - ');
  const startDateOnlyInit = startInit.split(' ')[0];
  const endDateOnlyInit = endInit.split(' ')[0];
  const [startMonthInit, startDayInit] = startDateOnlyInit.split('.').map(Number);
  const [endMonthInit, endDayInit] = endDateOnlyInit.split('.').map(Number);
  const [checkIn, setCheckIn] = useState(
    dayjs(`${year}-${startMonthInit}-${startDayInit}`).format('YYYY-MM-DD'),
  );
  const [checkOut, setCheckOut] = useState(
    dayjs(`${year}-${endMonthInit}-${endDayInit}`).format('YYYY-MM-DD'),
  );

  useEffect(() => {
    const [nextStart, nextEnd] = routeDisplayDate.split(' - ');
    const [nextStartMonth, nextStartDay] = nextStart
      .split(' ')[0]
      .split('.')
      .map(Number);
    const [nextEndMonth, nextEndDay] = nextEnd
      .split(' ')[0]
      .split('.')
      .map(Number);

    setCheckIn(
      dayjs(`${year}-${nextStartMonth}-${nextStartDay}`).format('YYYY-MM-DD'),
    );
    setCheckOut(
      dayjs(`${year}-${nextEndMonth}-${nextEndDay}`).format('YYYY-MM-DD'),
    );
    resetListState();
  }, [
    regionBounds,
    resetListState,
    routeAdultCount,
    routeChildCount,
    routeDisplayDate,
    year,
  ]);

  // 모달 열기 전 값 저장(닫을 때 변경 감지용)
  const [tempDateGuest, setTempDateGuest] = useState({
    checkIn,
    checkOut,
    adultCount,
    childCount,
  });
  const [sortBy, setSortBy] = useState('RECOMMEND');
  const [filterResultCount, setFilterResultCount] = useState(null);

  const fetchFilterResultCount = useCallback(async filters => {
    if (!checkIn || !checkOut || !regionBounds) {
      return null;
    }

    const params = {
      checkIn,
      checkOut,
      guestCount: adultCount + childCount,
      swLat: regionBounds.swLat,
      swLng: regionBounds.swLng,
      neLat: regionBounds.neLat,
      neLng: regionBounds.neLng,
      ...getGuesthouseFilterApiParams(filters),
    };

    const {data} = await userGuesthouseApi.getGuesthouseFilterCount(params);
    const count = Number(data?.count ?? 0);
    setFilterResultCount(count);
    return count;
  }, [adultCount, checkIn, checkOut, childCount, regionBounds]);

  // 게하 불러오기
  const fetchGuesthouses = useCallback(async (pageToFetch = 0) => {
    if (loadingRef.current || isLastRef.current || errorRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const guestCount = adultCount + childCount;

      const params = {
        checkIn,
        checkOut,
        guestCount,
        page: pageToFetch,
        size: 10,
        sortBy,
      };

      if (regionBounds) {
        params.swLat = regionBounds.swLat;
        params.swLng = regionBounds.swLng;
        params.neLat = regionBounds.neLat;
        params.neLng = regionBounds.neLng;
      }

      // 필터 적용 시 조건 분기
      if (filterApplied) {
        Object.assign(params, filterApiParams);
      }

      const response = await userGuesthouseApi.getGuesthouseList(params);
      const {content, last} = response.data;

      const normalized = content.map(it => ({
        ...it,
        guesthouseId: it.id,
        isLiked: !!it.isFavorite,
      }));

      setGuesthouses(prev =>
        pageToFetch === 0 ? normalized : [...prev, ...normalized]
      );
      isLastRef.current = last;
      setIsLast(last);
    } catch (e) {
      errorRef.current = true;
      isLastRef.current = true;
      setError(true); // 한번이라도 실패하면 더이상 호출X
      setIsLast(true); // (추가) 무한호출도 막음
      console.warn('게스트하우스 조회 실패', e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [
    adultCount,
    childCount,
    checkIn,
    checkOut,
    filterApplied,
    filterApiParams,
    regionBounds,
    sortBy,
  ]);

  useEffect(() => {
    if (isMapView) {
      return;
    }

    fetchGuesthouses(page);
  }, [fetchGuesthouses, isMapView, page]);

  useEffect(() => {
    if (
      isMapView
      || page !== 0
      || guesthouses.length > 0
      || loadingRef.current
      || errorRef.current
    ) {
      return;
    }

    fetchGuesthouses(0);
  }, [fetchGuesthouses, guesthouses.length, isMapView, page]);

  const handleEndReached = () => {
    if (loadingRef.current || isLastRef.current || errorRef.current) return;
    // 마지막이 아니라면 현재 페이지 계속
    setPage(prev => prev + 1);
  };

  // 게하 즐겨찾기
  const handleToggleFavorite = (item) => {
    toggleFavorite({
      type: 'guesthouse',
      id: item.guesthouseId,
      isLiked: item.isLiked,
      setList: setGuesthouses,
    });
  };

  const handlePressGuesthouse = (item) => {
    navigation.navigate('GuesthouseDetail', {
      id: item.id,
      checkIn,
      checkOut,
      guestCount: adultCount + childCount,
      onLikeChange: (id, nextIsLiked) => {
        setGuesthouses(prev =>
          prev.map(g =>
            g.id === id
              ? { ...g, isLiked: nextIsLiked }
              : g
          )
        );
      },
      onDateGuestChange: ({checkIn, checkOut, adults, children}) => {
        // 디테일 화면에서 날짜, 인원 변경 시 반영
        const formattedCheckIn = dayjs(checkIn).format('M.D ddd');
        const formattedCheckOut = dayjs(checkOut).format('M.D ddd');
        setDisplayDateState(`${formattedCheckIn} - ${formattedCheckOut}`);
        setAdultCount(adults);
        setChildCount(children);

        // API용 날짜 state도 같이 업데이트
        setCheckIn(dayjs(checkIn).format('YYYY-MM-DD'));
        setCheckOut(dayjs(checkOut).format('YYYY-MM-DD'));

        // 리스트 리로드
        resetListState();
      },
    });
  };

  const handlePressCategoryFilter = tag => {
    setFilterOptions(prev => {
      const isSelected = prev.tags.includes(tag);
      const nextFilters = {
        ...prev,
        tags: isSelected
          ? prev.tags.filter(item => item !== tag)
          : [...prev.tags, tag],
      };

      setFilterApplied(
        nextFilters.tags.length > 0 ||
        Boolean(nextFilters.roomType) ||
        nextFilters.facility.length > 0 ||
        nextFilters.onlyAvailable ||
        nextFilters.minPrice !== 10000 ||
        nextFilters.maxPrice !== 1000000
      );

      return nextFilters;
    });
    resetListState();
  };

  const renderItem = ({item}) => {
    // 별점 0 이거나 이상한 값 오면 안보이게 처리
    const ratingNumber = Number(item.averageRating);
    const hasValidRating =
      Number.isFinite(ratingNumber) && ratingNumber > 0;
    const displayRating = hasValidRating ? ratingNumber.toFixed(1) : null;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handlePressGuesthouse(item)}
        >
          <View style={styles.imgRatingContainer}>
            {/* 이미지 데이터 없을 때 */}
            {item.thumbnailImgUrl ? (
              <Image source={{uri: item.thumbnailImgUrl}} style={styles.image} />
            ) : (
              <View
                style={[styles.image, {backgroundColor: COLORS.grayscale_200}]}
              />
            )}
            {hasValidRating && (
              <View style={styles.rating}>
                <Star width={14} height={14} />
                <Text style={[FONTS.fs_12_medium, styles.ratingText]}>
                  {displayRating}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <View style={styles.tagRow}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagScrollContent}
              style={styles.tagScroll}
            >
              {item.hashtags &&
                item.hashtags.map((tag, index) => (
                  <View key={`${tag}-${index}`} style={styles.tagContainer}>
                    <Text style={[FONTS.fs_body, styles.tagText]}>{tag}</Text>
                  </View>
                ))}
            </ScrollView>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.heartIcon}
              onPress={() => handleToggleFavorite(item)}
            >
              {item.isLiked ? (
                <FillHeart width={20} height={20} />
              ) : (
                <EmptyHeart width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.cardInfoPressable}
            onPress={() => handlePressGuesthouse(item)}
          >
            <Text style={[FONTS.fs_16_medium, styles.name]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.address]}>
              {trimJejuPrefix(item.address)}
            </Text>
            <View style={styles.bottomRow}>
              {item.isReserved ? (
                <Text style={[FONTS.fs_16_semibold, styles.emptyPrice]}>
                  예약마감
                </Text>
              ) : (
                <Text style={[FONTS.fs_18_semibold, styles.price]}>
                  {item.minPrice.toLocaleString()}원 ~
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[FONTS.fs_20_semibold, styles.headerText]}>
          게스트 하우스
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.searchContainer}
        onPress={() => {
          navigation.navigate('GuesthouseSearch', {
            displayDate: displayDateState,
            adultCount,
            childCount,
            searchText,
          });
        }}>
        <View style={styles.searchIconContainer}>
          <SearchIcon width={24} height={24} />
          <Text style={[FONTS.fs_14_regular, styles.searchText]}>
            {searchText || '찾는 숙소가 있으신가요?'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.selectRow}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dateContainer}
          onPress={() => {
            setTempDateGuest({checkIn, checkOut, adultCount, childCount});
            setModalInitialSection('date');
            setDateGuestModalVisible(true);
          }}>
          <CalendarIcon width={18} height={18} />
          <Text
            numberOfLines={1}
            style={[FONTS.fs_14_medium, styles.dateText]}>
            {displayDateState}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.filterButtonContainer}
          onPress={() => {
            setFilterModalVisible(true);
          }}>
          <FilterIcon width={18} height={18} />
          <Text style={[FONTS.fs_14_medium, styles.filterText]}>필터</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.personRoomContainer}
          onPress={() => {
            setTempDateGuest({checkIn, checkOut, adultCount, childCount});
            setModalInitialSection('guest');
            setDateGuestModalVisible(true);
          }}>
          <Person width={18} height={18} />
          <Text style={[FONTS.fs_14_medium, styles.personText]}>
            {`인원 ${adultCount + childCount}`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        style={styles.categoryFilterScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterContainer}>
        {CATEGORY_FILTERS.map(tag => {
          const isSelected = filterOptions.tags.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.8}
              style={[
                styles.categoryFilterChip,
                isSelected && styles.categoryFilterChipActive,
              ]}
              onPress={() => handlePressCategoryFilter(tag)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.categoryFilterText,
                  isSelected && styles.categoryFilterTextActive,
                ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isMapView ? (
        <View style={styles.guesthouseMapContainer}>
          <GuesthouseListMap
            key={`guesthouse-list-map-${mapResetKey}`}
            embedded
            guesthouses={filteredGuesthouses}
            checkIn={checkIn}
            checkOut={checkOut}
            guestCount={adultCount + childCount}
            regionIds={regionIds}
            regionBounds={regionBounds}
            sortBy={sortBy}
            filterParams={filterApiParams}
            resetKey={mapResetKey}
            onPressListToggle={() => {
              manualListModeRef.current = true;
              if (!goToWebPath(WEB_ROUTES.GUESTHOUSES)) {
                setLoading(false);
                setViewModeVersion(prev => prev + 1);
                setIsMapView(false);
              }
            }}
          />
        </View>
      ) : (
        <View
          key={`guesthouse-list-view-${viewModeVersion}`}
          style={styles.guesthouseListContainer}
        >
          {isInitialLoading ? (
            <Loading title="숙소를 불러오는 중이에요" />
          ) : filteredGuesthouses.length === 0 ? (
            <EmptyState
              icon={SearchEmpty}
              iconSize={{width: 120, height: 120}}
              title="앗, 찾는 결과가 없어요"
            />
          ) : (
            <FlatList
              key={`guesthouse-list-flatlist-${viewModeVersion}`}
              data={filteredGuesthouses}
              style={styles.list}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.7}
              ListFooterComponent={
                loading ? <ActivityIndicator size="small" color="gray" /> : null
              }
              {...(Platform.OS === 'web'
                ? {}
                : {maintainVisibleContentPosition: {minIndexForVisible: 0}})}
              removeClippedSubviews={false}
            />
          )}
        </View>
      )}

      {/* 지도 버튼 */}
      {!isMapView && (
        <View style={styles.mapButtonContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.mapButton}
            onPress={() => {
              manualListModeRef.current = false;
              if (!goToWebPath(WEB_ROUTES.MAP)) {
                setLoading(false);
                setViewModeVersion(prev => prev + 1);
                setIsMapView(true);
              }
            }}
          >
            <MapIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.mapButtonText]}>
              지도
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 인원, 날짜 선택 모달 */}
      <DateGuestModal
        visible={dateGuestModalVisible}
        // 모달 닫힐 때 변경 감지 → 변경 있으면 API 재호출
        onClose={() => {
          setDateGuestModalVisible(false);
        }}
        onApply={(nextCheckIn, nextCheckOut, adults, children) => {
          setAdultCount(adults);
          setChildCount(children);

          setCheckIn(dayjs(nextCheckIn).format('YYYY-MM-DD'));
          setCheckOut(dayjs(nextCheckOut).format('YYYY-MM-DD'));

          const formattedCheckIn = dayjs(nextCheckIn).format('M.D ddd');
          const formattedCheckOut = dayjs(nextCheckOut).format('M.D ddd');
          setDisplayDateState(`${formattedCheckIn} - ${formattedCheckOut}`);

          setDateGuestModalVisible(false);
        }}
        initCheckInDate={checkIn}
        initCheckOutDate={checkOut}
        initAdultGuestCount={adultCount}
        initChildGuestCount={childCount}
        initialSection={modalInitialSection}
      />

      {/* 필터 모달 */}
      <GuesthouseFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filterOptions}
        selectedSort={sortBy}
        onCountRequest={fetchFilterResultCount}
        onApply={filters => {
          const {sortBy: nextSortBy = sortBy, ...nextFilters} = filters;

          setSortBy(nextSortBy);
          setFilterOptions(nextFilters);
          setFilterApplied(
            nextFilters.tags.length > 0 ||
            Boolean(nextFilters.roomType) ||
            nextFilters.facility.length > 0 ||
            nextFilters.onlyAvailable ||
            nextFilters.minPrice !== 10000 ||
            nextFilters.maxPrice !== 1000000
          );
          setFilterModalVisible(false);

          resetListState();
        }}
        resultCount={filterResultCount}
      />
    </View>
  );
};

export default GuesthouseList;
