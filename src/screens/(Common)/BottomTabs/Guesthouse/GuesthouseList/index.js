import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native'; 
import dayjs from 'dayjs';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import Person from '@assets/images/person20_gray.svg';
import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';
import Star from '@assets/images/star_white.svg';
import LeftChevron from '@assets/images/chevron_left_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import MapIcon from '@assets/images/map_black.svg';

import styles from './GuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import { guesthouseTags } from '@data/guesthouseTags';
import DateGuestModal from '@components/modals/Guesthouse/DateGuestModal';
import GuesthouseSortModal from '@components/modals/Guesthouse/GuesthouseSortModal';
import GuesthouseFilterModal from '@components/modals/Guesthouse/GuesthouseFilterModal';
import { COLORS } from '@constants/colors';
import Loading from '@components/Loading';
import EmptyResult from '@components/EmptyResult';

const GuesthouseList = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [guesthouses, setGuesthouses] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);

  const {
    displayDate: routeDisplayDate,
    adultCount: routeAdultCount,
    childCount: routeChildCount,
    keyword: initialKeyword = null,
    searchText,
    regionIds = [],
  } = route.params || {};

  // 지역을 눌러서 왔는지 검색어로 왔는지 구분
  const [keyword] = useState(initialKeyword);
  const isKeywordSearch = !!keyword;
  const isRegionSearch = regionIds.length > 0;

  // 모달
  const [dateGuestModalVisible, setDateGuestModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // 태그 선택 데이터 (필터에서 온)
  const [selectedTags, setSelectedTags] = useState(guesthouseTags);  // 처음엔 전체 선택
  const [tempSelectedTags, setTempSelectedTags] = useState([]);

  // 필터 정보
  const [filterOptions, setFilterOptions] = useState({
    tags: guesthouseTags,                 // id, hashtag 전체 선택
    minPrice: 10000,
    maxPrice: 10000000,
    roomType: [],                         // 제외 (아직 API 미사용)
    facility: [],                         // amenity object { id, name }
    onlyAvailable: false,
  });
  const [filterApplied, setFilterApplied] = useState(false);

  // id 값 추출
  const getHashtagIds = (selectedTags) => selectedTags.map(tag => tag.id);
  const getAmenityIds = (facilities) => [...facilities];

  // 정렬 기본 추천순
  const [selectedSort, setSelectedSort] = useState("RECOMMEND");

  // 상태 - 처음에는 props 값으로 초기화
  const [adultCount, setAdultCount] = useState(routeAdultCount || 1);
  const [childCount, setChildCount] = useState(routeChildCount || 0);
  const [displayDateState, setDisplayDateState] = useState(routeDisplayDate);

  // api 보낼 날짜 데이터
  const [start, end] = displayDateState.split(" - ");
  const startDateOnly = start.split(' ')[0];
  const endDateOnly = end.split(' ')[0];
  const [startMonth, startDay] = startDateOnly.split('.').map(Number);
  const [endMonth, endDay] = endDateOnly.split('.').map(Number);
  const year = dayjs().year();
  const checkIn = dayjs(`${year}-${startMonth}-${startDay}`).format('YYYY-MM-DD');
  const checkOut = dayjs(`${year}-${endMonth}-${endDay}`).format('YYYY-MM-DD');
  const [sortBy, setSortBy] = useState("RECOMMEND");

  // 게하 불러오기
  const fetchGuesthouses = async (pageToFetch = 0) => {
    if (loading || isLast || error) return;
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

      // 키워드 검색인 경우
      if (isKeywordSearch) {
        params.keyword = keyword.keyword;
        params.keywordId = keyword.id;
      }

      // 지역 검색인 경우
      if (isRegionSearch) {
        params.regionIds = regionIds;
      }

      // 필터 적용 시 조건 분기
      if (filterApplied) {
        const allTagsSelected = filterOptions.tags.length === guesthouseTags.length;
        const allFacilitiesSelected = filterOptions.facility.length === 0;

        if (!allTagsSelected) {
          params.hashtagIds = getHashtagIds(filterOptions.tags);
        }
        if (!allFacilitiesSelected) {
          params.amenityIds = getAmenityIds(filterOptions.facility);
        }

        params.minPrice = filterOptions.minPrice;
        params.maxPrice = filterOptions.maxPrice;
        params.availableOnly = filterOptions.onlyAvailable;
      }
      
      const response = await userGuesthouseApi.getGuesthouseList(params);
      const { content, last } = response.data;

      setGuesthouses(prev => pageToFetch === 0 ? content : [...prev, ...content]);
      setIsLast(last);
    } catch (e) {
      setError(true); // 한번이라도 실패하면 더이상 호출X
      setIsLast(true); // (추가) 무한호출도 막음
      console.warn('게스트하우스 조회 실패', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuesthouses(page);
  }, [page, keyword, sortBy, filterOptions, filterApplied]);

  const handleEndReached = () => {
    if (loading) return;
    // 마지막이 아니라면 현재 페이지 계속
    setPage(prev => prev + 1);
  };


  const toggleLike = async (id, liked) => {
    try {
      if (liked) {
        await userGuesthouseApi.unfavoriteGuesthouse(id);
      } else {
        await userGuesthouseApi.favoriteGuesthouse(id);
      }
      setGuesthouses(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      );
    } catch (e) {
      console.warn('찜 실패', e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('GuesthouseDetail', {
        id: item.id,
        checkIn,
        checkOut,
        guestCount: adultCount + childCount,
        onLikeChange: (id, isLiked) => {
          setGuesthouses(prev =>
            prev.map(item =>
              item.id === id ? { ...item, isFavorite: isLiked } : item
            )
          );
        },
      })}
    >
      <View style={styles.card}>
        <View style={styles.imgRatingContainer}>
          {/* 이미지 데이터 없을 때 */}
          {item.thumbnailImgUrl ? (
            <Image
              source={{ uri: item.thumbnailImgUrl }}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, { backgroundColor: COLORS.grayscale_200 }]} />
          )}
          <View style={styles.rating}>
            <Star width={14} height={14} />
            <Text style={[FONTS.fs_12_medium, styles.ratingText]}>
              {item.averageRating?.toFixed(1) ?? '0.0'}
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.tagRow}>
            {item.hashtags && item.hashtags.map((tag, index) => (
              <View style={styles.tagContainer}>
                <Text key={index} style={[FONTS.fs_body, styles.tagText]}>
                  {tag}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={() => toggleLike(item.id, item.isFavorite)}
            >
              {item.isFavorite ? <FillHeart width={20} height={20}/> : <EmptyHeart width={20} height={20}/>}
            </TouchableOpacity>
          </View>
          <Text style={[FONTS.fs_16_medium, styles.name]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.address]}>{item.address}</Text>
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
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[FONTS.fs_20_semibold, styles.headerText]}>게스트 하우스</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.navigate("GuesthouseSearch", {
              displayDate: displayDateState,
              adultCount,
              childCount,
              searchText,
            });
          }}
        >
          <LeftChevron width={24} height={24}/>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => {
          navigation.navigate("GuesthouseSearch", {
            displayDate: displayDateState,
            adultCount,
            childCount,
            searchText,
          });
        }}
      >
        <View style={styles.searchIconContainer}>
          <SearchIcon width={24} height={24}/>
          <Text style={[FONTS.fs_14_regular, styles.searchText]}>{searchText || '찾는 숙소가 있으신가요?'}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.selectRow}>
        <TouchableOpacity
          style={styles.dateContainer}
          onPress={() => setDateGuestModalVisible(true)}
        >
          <CalendarIcon width={20} height={20}/>
          <Text style={[FONTS.fs_14_medium, styles.dateText]}>{displayDateState}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.personRoomContainer}
          onPress={() => setDateGuestModalVisible(true)}
        >
          <Person width={20} height={20}/>
          <Text style={[FONTS.fs_14_medium, styles.personText]}>
            {childCount > 0
              ? `성인 ${adultCount}, 아동 ${childCount}`
              : `인원 ${adultCount}`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.guesthouseListContainer}>
        <View style={styles.guesthouseListHeader}>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={styles.filterButtonContainer}
              onPress={() => {
                // 현재 선택된 태그를 임시 상태로 저장
                setTempSelectedTags([...selectedTags]);;
                setFilterModalVisible(true);
              }}
            >
              <FilterIcon width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium, styles.filterText]}>필터</Text>
            </TouchableOpacity>
            {/* 필터 선택 내용 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectFilterContainer}
            >
              {selectedTags.map((tag, index) => (
                <View key={index} style={styles.selectFilter}>
                  <Text style={[FONTS.fs_12_medium, styles.selectFilterText]}>
                    {tag.hashtag}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity 
            style={styles.sortContainer}
            onPress={() => setSortModalVisible(true)}
          >
            <SortIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_medium, styles.sortText]}>정렬</Text>
          </TouchableOpacity>
          

        </View>

        {!searched && loading ? (
          <Loading title="숙소를 불러오는 중이에요" />
        ) : guesthouses.length === 0 ? (
          <EmptyResult />
        ) : (
          <FlatList
            data={guesthouses}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.7}
            ListFooterComponent={loading && <ActivityIndicator size="small" color="gray" />}
          />
        )}
      </View>

      {/* 지도 버튼 */}
      <View style={styles.mapButtonContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('GuesthouseMap')}
        >
          <MapIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.mapButtonText]}>지도</Text>
        </TouchableOpacity>
      </View>
      
      {/* 인원, 날짜 선택 모달 */}
      <DateGuestModal
        visible={dateGuestModalVisible}
        onClose={() => setDateGuestModalVisible(false)}
        onApply={(checkIn, checkOut, adults, children) => {
          setAdultCount(adults);
          setChildCount(children);

          const formattedCheckIn = dayjs(checkIn).format('M.D ddd');
          const formattedCheckOut = dayjs(checkOut).format('M.D ddd');
          setDisplayDateState(`${formattedCheckIn} - ${formattedCheckOut}`);

          setDateGuestModalVisible(false);

          // 검색 다시 실행
          setSearched(true);
          setPage(0);
          setIsLast(false);
          setGuesthouses([]);
        }}
        initCheckInDate={dayjs(`${year}-${startMonth}-${startDay}`).format('YYYY-MM-DD')}
        initCheckOutDate={dayjs(`${year}-${endMonth}-${endDay}`).format('YYYY-MM-DD')}
        initAdultGuestCount={adultCount}
        initChildGuestCount={childCount}
      />

      {/* 정렬 모달 */}
      <GuesthouseSortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selected={selectedSort}
        onSelect={(option) => {
          setSelectedSort(option);
          setSortModalVisible(false);

          // sortBy 업데이트
          setSortBy(option);

          // 새로 fetch
          setPage(0);
          setIsLast(false);
          setGuesthouses([]);
        }}
      />

      {/* 필터 모달 */}
      <GuesthouseFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filterOptions}
        onApply={(filters) => {
           console.log('[필터 적용됨] 받은 filters:', filters);
          setSelectedTags(filters.tags);
          setFilterOptions(filters);
          setFilterApplied(true);
          setFilterModalVisible(false);

          setSearched(true);
          setPage(0);
          setIsLast(false);
          setGuesthouses([]);
        }}
      />
    </View>
  );
};

export default GuesthouseList;
