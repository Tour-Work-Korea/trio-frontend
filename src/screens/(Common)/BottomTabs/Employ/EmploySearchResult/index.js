import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './EmploySearchResult.styles';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import userEmployApi from '@utils/api/userEmployApi';
import EmployFilterModal from '@components/modals/Employ/EmployFilterModal';
import {regions} from '@data/filter';
import EmploySortModal from '@components/modals/Employ/EmploySortModal';
// 아이콘 불러오기
import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import Chevron_left_black from '@assets/images/chevron_left_black.svg';
import MapIcon from '@assets/images/map_black.svg';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const EmploySearchResult = ({route}) => {
  const {search} = route.params;
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState(search);
  const [isSearch, setIsSearch] = useState(false);
  const [recruitList, setRecruitList] = useState([]);
  const [isEmLoading, setIsEmLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);

  //모달
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  //필터 정보
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    tags: [],
  });
  const [keywords, setKeywords] = useState([]);
  //정렬
  const [selectedSort, setSelectedSort] = useState({
    label: '추천 순',
    value: 'RECOMMEND',
  });

  // 1. 검색 버튼 누르면 search 트리거
  useEffect(() => {
    if (!isSearch) return;

    setIsLast(false);
    setRecruitList([]);
    fetchRecruitList(0, false);
    setIsSearch(false);
    setPage(0);
    console.log('검색 트리거로 fetch');
  }, [isSearch]);

  // 2. 필터나 정렬 변경 시에도 fetch 실행
  useEffect(() => {
    setIsLast(false);
    setRecruitList([]);
    fetchRecruitList(0, false);
    setPage(0);
    console.log('필터/정렬 변경 시 fetch');
  }, [filterOptions, selectedSort]);

  // 3. 최초 진입 시 (1회만 실행)
  useFocusEffect(
    React.useCallback(() => {
      setIsLast(false);
      setRecruitList([]);
      fetchRecruitList(0, false);
      setPage(0);
      console.log('최초 진입 시 fetch');
    }, []), // selectedSort, filterOptions 빼야 중복 호출 안 됨
  );

  useEffect(() => {
    const regionKeywords =
      filterOptions?.regions?.map(region => region.displayName) || [];
    const tagKeywords = filterOptions?.tags?.map(tag => tag.hashtag) || [];
    console.log('regionKeyword', regionKeywords);
    console.log('tagKeywords', tagKeywords);
    setKeywords([...regionKeywords, ...tagKeywords]);
  }, [filterOptions]);

  //채용 공고 조회
  const fetchRecruitList = async (pageToFetch = 0, lastToFetch) => {
    if (isEmLoading || lastToFetch) {
      console.log(isEmLoading, lastToFetch);
      return;
    }
    setIsEmLoading(true);

    try {
      const params = {
        page: pageToFetch,
        size: 10,
        sortBy: selectedSort.value,
        searchKeyword: searchText,
        ...{
          locationIds: filterOptions.regions?.map(region => region.id),
          hashtagIds: filterOptions?.tags?.map(tag => tag.id),
        },
      };
      console.log(params);
      const res = await userEmployApi.getRecruits(params);
      const {content, last} = res.data;
      setRecruitList(prev =>
        pageToFetch === 0 ? content : [...prev, ...content],
      );
      if (last) {
        setIsLast(true);
      } else {
        setIsLast(false);
      }
    } catch (error) {
      console.warn('fetchRecruitList 실패:', error);
      setIsLast(true);
    } finally {
      setIsEmLoading(false);
    }
  };

  const handleEndReached = () => {
    if (!isEmLoading && !isLast) {
      const nextPage = page + 1;
      fetchRecruitList(nextPage, isLast); // 먼저 요청 보내고
      setPage(nextPage); // 그다음 상태 업데이트
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isEmLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
  }
  return (
    <View style={[styles.container]} contentContainerStyle={{gap: 12}}>
      {/* 헤더 */}
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'column',
          gap: 16,
          paddingBottom: 12,
        }}>
        <View style={[styles.headerBox]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Chevron_left_black width={28.8} height={28.8} />
          </TouchableOpacity>

          <Text style={styles.headerText}>채용공고</Text>
          <View style={{width: 28.8}}></View>
        </View>
        {/* 검색창 */}
        <View style={[styles.searchInputContainer]}>
          <SearchIcon width={24} height={24} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholderTextColor={COLORS.grayscale_600}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={() => setIsSearch(true)}
          />
        </View>
      </View>

      {/* 뽑고 있는 게스트하우스 */}
      <View style={styles.guesthouseListContainer}>
        <View style={styles.guesthouseListHeader}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButtonContainer}
              onPress={() => {
                // 현재 선택된 태그를 임시 상태로 저장
                setFilterModalVisible(true);
              }}>
              <FilterIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium, styles.filterText]}>필터</Text>
            </TouchableOpacity>
            {/* 필터 선택 내용 */}
            <ScrollView
              style={{flex: 1}}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectFilterContainer}>
              {keywords.map((tag, index) => (
                <View key={index} style={styles.selectFilter}>
                  <Text style={[FONTS.fs_12_medium, styles.selectFilterText]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.sortContainer}
            onPress={() => setSortModalVisible(true)}>
            <SortIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.sortText]}>
              {selectedSort.label}
            </Text>
          </TouchableOpacity>
        </View>

        <RecruitList
          data={recruitList}
          loading={isEmLoading}
          onJobPress={handleJobPress}
          onToggleFavorite={toggleLikeRecruit}
          onEndReached={handleEndReached}
          setRecruitList={setRecruitList}
          ListFooterComponent={
            isEmLoading && <ActivityIndicator size="small" color="gray" />
          }
        />
        {/* 지도 버튼 */}
        <View style={styles.mapButtonContainer}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('EmployMap')}>
            <MapIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.mapButtonText]}>지도</Text>
          </TouchableOpacity>
        </View>
      </View>

      <EmployFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filterOptions}
        onApply={filters => {
          setFilterOptions({
            regions: [...filters.regions],
            tags: [...filters.tags],
          });
          setFilterModalVisible(false);
        }}
      />
      <EmploySortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selected={selectedSort.value}
        onSelect={option => {
          setSelectedSort(option);
          setSortModalVisible(false);

          setPage(0);
          setIsLast(false);
          setRecruitList([]);
        }}
      />
    </View>
  );
};

export default EmploySearchResult;
