import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {RecruitList} from '@components/Employ/RecruitList';
import userEmployApi from '@utils/api/userEmployApi';
import EmployFilterModal from '@components/modals/Employ/EmployFilterModal';
import EmploySortModal from '@components/modals/Employ/EmploySortModal';
import useUserStore from '@stores/userStore';
import ErrorModal from '@components/modals/ErrorModal';
import Header from '@components/Header';
import Loading from '@components/Loading';
// 아이콘 불러오기
import styles from './EmploySearchResult.styles';
import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import {COLORS} from '@constants/colors';

const PAGE_SIZE = 10;

const EmploySearchResult = ({route}) => {
  const {search} = route.params;
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState(search);
  const [isSearch, setIsSearch] = useState(false);

  const [recruitList, setRecruitList] = useState([]);

  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true); // 첫 페이지 로딩
  const [isMoreLoading, setIsMoreLoading] = useState(false); // 추가 페이지 로딩

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    tags: [],
  });
  const [keywords, setKeywords] = useState([]);
  const [selectedSort, setSelectedSort] = useState({
    label: '추천 순',
    value: 'RECOMMEND',
  });

  const userRole = useUserStore.getState()?.userRole;

  // region/tag -> 상단 필터 키워드 텍스트 배열로 변환
  useEffect(() => {
    const regionKeywords =
      filterOptions?.regions?.map(region => region.displayName) || [];
    const tagKeywords = filterOptions?.tags?.map(tag => tag.hashtag) || [];
    setKeywords([...regionKeywords, ...tagKeywords]);
  }, [filterOptions]);

  // 채용 공고 조회 (첫 로딩 / 추가 로딩 공용)
  const tryFetchRecruitList = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const params = {
          page: pageToFetch,
          size: PAGE_SIZE,
          sortBy: selectedSort.value,
          searchKeyword: searchText,
          locationIds: filterOptions.regions?.map(region => region.id),
          hashtagIds: filterOptions.tags?.map(tag => tag.id),
        };

        const res = await userEmployApi.getRecruits(
          params,
          userRole === 'USER',
        );
        const {content, last} = res.data;

        setRecruitList(prev =>
          pageToFetch === 0 ? content : [...prev, ...content],
        );

        setPage(pageToFetch);
        setIsLast(last);
      } catch (error) {
        console.warn('fetchRecruitList 실패:', error);
        setIsLast(true);
        setErrorModal({
          visible: true,
          message: '채용 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          buttonText: '확인',
        });
      } finally {
        if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [filterOptions, searchText, selectedSort, userRole],
  );

  // 1. 검색 버튼(엔터) 눌렀을 때 트리거
  useEffect(() => {
    if (!isSearch) return;

    setIsLast(false);
    setRecruitList([]);
    tryFetchRecruitList(0, false);
    setPage(0);
    setIsSearch(false);
  }, [isSearch, tryFetchRecruitList]);

  // 2. 필터 or 정렬 변경 시 새로 조회
  useEffect(() => {
    // 최초 마운트 직후에도 이 effect가 한 번 돌 수 있으므로
    // 검색어가 없는 경우엔 굳이 호출 안 해도 됨
    if (!searchText || searchText.trim().length === 0) return;

    setIsLast(false);
    setRecruitList([]);
    tryFetchRecruitList(0, false);
    setPage(0);
  }, [filterOptions, selectedSort, tryFetchRecruitList, searchText]);

  // 3. 최초 진입 시 (포커스 시) 초기 한 번 조회
  useFocusEffect(
    useCallback(() => {
      if (search && search.trim().length > 0) {
        setIsLast(false);
        setRecruitList([]);
        tryFetchRecruitList(0, false);
        setPage(0);
      }
    }, [search, tryFetchRecruitList]),
  );

  // 무한 스크롤 끝 도달
  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || isLast) return;
    const nextPage = page + 1;
    tryFetchRecruitList(nextPage, true);
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  // 첫 페이지 로딩일 때 전체 화면 로딩
  if (isInitialLoading && page === 0) {
    return (
      <View style={styles.container}>
        <Header title={'채용공고'} />
        <Loading title="채용 정보를 가져오는 중입니다..." />
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {/* 헤더 */}
      <Header title={'채용공고'} />

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

      {/* 공고 리스트 + 필터/정렬 영역 */}
      <View style={styles.recruitListContainer}>
        <View style={styles.recruitListHeader}>
          <View style={styles.filterContainer}>
            {/* 필터 버튼 */}
            <TouchableOpacity
              style={styles.filterButtonContainer}
              onPress={() => setFilterModalVisible(true)}>
              <FilterIcon width={20} height={20} />
              <Text style={styles.filterTitleText}>필터</Text>
            </TouchableOpacity>

            {/* 선택된 필터 태그 목록 (가로 스크롤) */}
            <ScrollView
              style={styles.modalContainer}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectFilterContainer}>
              {keywords.map((tag, index) => (
                <View key={index} style={styles.selectFilter}>
                  <Text style={styles.selectFilterText}>{tag}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 정렬 */}
          <TouchableOpacity
            style={styles.sortContainer}
            onPress={() => setSortModalVisible(true)}>
            <SortIcon width={20} height={20} />
            <Text style={styles.sortText}>{selectedSort.label}</Text>
          </TouchableOpacity>
        </View>

        {/* 리스트 (FlatList, 무한 스크롤) */}
        <RecruitList
          data={recruitList}
          loading={false} // 전체 로딩은 위에서 처리
          onJobPress={handleJobPress}
          onEndReached={handleEndReached}
          setRecruitList={setRecruitList}
          showErrorModal={setErrorModal}
          ListFooterComponent={
            isMoreLoading ? (
              <ActivityIndicator
                size="small"
                color="gray"
                style={{marginVertical: 16}}
              />
            ) : null
          }
        />
      </View>

      {/* 필터 모달 */}
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

      {/* 정렬 모달 */}
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

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmploySearchResult;
