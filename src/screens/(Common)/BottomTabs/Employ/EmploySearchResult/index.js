import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {RecruitList} from '@components/Employ/RecruitList';
import userEmployApi from '@utils/api/userEmployApi';
import EmployFilterModal from '@components/modals/Employ/EmployFilterModal';
import EmploySortModal from '@components/modals/Employ/EmploySortModal';
import useUserStore from '@stores/userStore';
import AlertModal from '@components/modals/AlertModal';
import Header from '@components/Header';
import Loading from '@components/Loading';

import styles from './EmploySearchResult.styles';
import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import {COLORS} from '@constants/colors';

const PAGE_SIZE = 10;

const EmploySearchResult = ({route}) => {
  const navigation = useNavigation();
  const userRole = useUserStore.getState()?.userRole;

  const {search} = route.params ?? {};

  // 인풋에 보여줄 값
  const [searchText, setSearchText] = useState(search ?? '');
  // 실제 검색에 쓰는 확정 키워드
  const [appliedKeyword, setAppliedKeyword] = useState(search ?? '');

  const [recruitList, setRecruitList] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

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

  const initializedRef = useRef(false);

  // region/tag -> 상단 키워드 텍스트
  useEffect(() => {
    const regionKeywords =
      filterOptions?.regions?.map(r => r.displayName) || [];
    const tagKeywords = filterOptions?.tags?.map(t => t.hashtag) || [];
    setKeywords([...regionKeywords, ...tagKeywords]);
  }, [filterOptions]);

  // ✅ params builder (keyword를 인자로!)
  const buildParams = useCallback(
    (pageToFetch, keyword) => {
      const regionIds =
        filterOptions.regions?.map(r => r.id).filter(Boolean) ?? [];
      const tagIds = filterOptions.tags?.map(t => t.id).filter(Boolean) ?? [];

      const kw = (keyword ?? '').trim();

      return {
        page: pageToFetch,
        size: PAGE_SIZE,
        ...(selectedSort?.value ? {sortBy: selectedSort.value} : {}),
        ...(kw ? {searchKeyword: kw} : {}),
        ...(regionIds.length ? {locationIds: regionIds} : {}),
        ...(tagIds.length ? {hashtagIds: tagIds} : {}),
      };
    },
    [filterOptions, selectedSort],
  );

  // ✅ fetch 함수: appliedKeyword에 "직접" 의존하지 않음
  const fetchRecruitList = useCallback(
    async (pageToFetch = 0, isLoadMore = false, keyword) => {
      try {
        if (isLoadMore) setIsMoreLoading(true);
        else setIsInitialLoading(true);

        const params = buildParams(pageToFetch, keyword);
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
        if (isLoadMore) setIsMoreLoading(false);
        else setIsInitialLoading(false);
      }
    },
    [buildParams, userRole],
  );

  // ✅ 초기 로드: search param 바뀔 때만 실행 (fetchRecruitList deps 제거!)
  useEffect(() => {
    const initKeyword = (search ?? '').trim();

    setSearchText(initKeyword);
    setAppliedKeyword(initKeyword);
    setRecruitList([]);
    setPage(0);
    setIsLast(false);

    fetchRecruitList(0, false, initKeyword).finally(() => {
      initializedRef.current = true;
    });
  }, [search]); // ✅ 여기서 fetchRecruitList 넣지 말기

  // ✅ 필터/정렬 변경 시 appliedKeyword 기준으로 재조회
  useEffect(() => {
    if (!initializedRef.current) return;

    setRecruitList([]);
    setPage(0);
    setIsLast(false);

    const kw = (appliedKeyword ?? '').trim();
    fetchRecruitList(0, false, kw);
  }, [filterOptions, selectedSort]); // ✅ appliedKeyword는 그대로 사용

  // ✅ 엔터 눌렀을 때만 appliedKeyword 확정 + 재조회
  const handleSearchTrigger = useCallback(
    rawText => {
      const nextKeyword = (rawText ?? '').trim();

      setSearchText(nextKeyword);
      setAppliedKeyword(nextKeyword);

      setRecruitList([]);
      setPage(0);
      setIsLast(false);

      fetchRecruitList(0, false, nextKeyword);
    },
    [fetchRecruitList],
  );

  // 무한 스크롤
  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || isLast) return;
    const kw = (appliedKeyword ?? '').trim();
    fetchRecruitList(page + 1, true, kw);
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isInitialLoading && page === 0) {
    return (
      <View style={styles.container}>
        <Header title="채용공고" />
        <Loading title="채용 정보를 가져오는 중입니다..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="채용공고" />

      {/* 검색창 */}
      <View style={styles.searchInputContainer}>
        <SearchIcon width={24} height={24} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholderTextColor={COLORS.grayscale_600}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={e => handleSearchTrigger(e.nativeEvent.text)}
        />
      </View>

      {/* 리스트 + 필터/정렬 */}
      <View style={styles.recruitListContainer}>
        <View style={styles.recruitListHeader}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButtonContainer}
              onPress={() => setFilterModalVisible(true)}>
              <FilterIcon width={20} height={20} />
              <Text style={styles.filterTitleText}>필터</Text>
            </TouchableOpacity>

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

          <TouchableOpacity
            style={styles.sortContainer}
            onPress={() => setSortModalVisible(true)}>
            <SortIcon width={20} height={20} />
            <Text style={styles.sortText}>{selectedSort.label}</Text>
          </TouchableOpacity>
        </View>

        <RecruitList
          data={recruitList}
          loading={false}
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
        }}
      />

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmploySearchResult;
