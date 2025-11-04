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

const EmploySearchResult = ({route}) => {
  const {search} = route.params;
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState(search);
  const [isSearch, setIsSearch] = useState(false);
  const [recruitList, setRecruitList] = useState([]);
  const [isEmLoading, setIsEmLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
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

  // 1. 검색 버튼 누르면 search 트리거
  useEffect(() => {
    if (!isSearch) {
      return;
    }
    setIsLast(false);
    setRecruitList([]);
    tryFetchRecruitList(0, false);
    setIsSearch(false);
    setPage(0);
    console.log('검색 트리거로 fetch');
  }, [isSearch]);

  // 2. 필터나 정렬 변경 시에도 fetch 실행
  useEffect(() => {
    setIsLast(false);
    setRecruitList([]);
    tryFetchRecruitList(0, false);
    setPage(0);
    console.log('필터/정렬 변경 시 fetch');
  }, [filterOptions, selectedSort]);

  // 3. 최초 진입 시 (1회만 실행)
  useFocusEffect(
    React.useCallback(() => {
      if (searchText && searchText.trim().length > 0) {
        setIsLast(false);
        setRecruitList([]);
        tryFetchRecruitList(0, false);
        setPage(0);
      }
    }, [searchText]),
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
  const tryFetchRecruitList = async (pageToFetch = 0, lastToFetch) => {
    if (isEmLoading || lastToFetch) {
      console.log(isEmLoading, lastToFetch);
      return;
    }
    setIsEmLoading(true);

    try {
      const userRole = useUserStore.getState()?.userRole;
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
      const res = await userEmployApi.getRecruits(params, userRole === 'USER');
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
      tryFetchRecruitList(nextPage, isLast);
      setPage(nextPage);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isEmLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
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
      {/* 공고 리스트 */}
      <View style={styles.recruitListContainer}>
        <View style={styles.recruitListHeader}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButtonContainer}
              onPress={() => {
                // 현재 선택된 태그를 임시 상태로 저장
                setFilterModalVisible(true);
              }}>
              <FilterIcon width={20} height={20} />
              <Text style={styles.filterTitleText}>필터</Text>
            </TouchableOpacity>
            {/* 필터 선택 내용 */}
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
          loading={isEmLoading}
          onJobPress={handleJobPress}
          onEndReached={handleEndReached}
          setRecruitList={setRecruitList}
          showErrorModal={setErrorModal}
          ListFooterComponent={
            isEmLoading && <ActivityIndicator size="small" color="gray" />
          }
        />
        {/* 지도 버튼 */}
        {/* <View style={styles.mapButtonContainer}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('EmployMap')}>
            <MapIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.mapButtonText]}>지도</Text>
          </TouchableOpacity>
        </View> */}
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
