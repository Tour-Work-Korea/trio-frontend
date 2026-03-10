import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, ActivityIndicator} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {RecruitList} from '@components/Employ/RecruitList';
import useUserStore from '@stores/userStore';
import AlertModal from '@components/modals/AlertModal';
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';
import Loading from '@components/Loading';
import styles from './EmploySearchList.styles';
import SearchIcon from '@assets/images/search_gray.svg';
import {COLORS} from '@constants/colors';

const PAGE_SIZE = 8;

const EmploySearchList = () => {
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const navigation = useNavigation();
  const userRole = useUserStore.getState()?.userRole;

  const tryFetchRecruitList = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const res = await userEmployApi.getRecruits(
          {
            page: pageToFetch,
            size: PAGE_SIZE,
          },
          // userRole === 'USER',
        );

        const {content, last, number} = res.data;

        if (pageToFetch === 0) {
          // 첫 페이지
          setRecruitList(content);
        } else {
          // 이어붙이기
          setRecruitList(prev => [...prev, ...content]);
        }

        setPage(number);
        setHasNext(!last);
      } catch (error) {
        setHasNext(false);
        console.warn('fetchRecruitList 실패:', error);
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
    [userRole],
  );

  useFocusEffect(
    useCallback(() => {
      setRecruitList([]);
      setHasNext(true);
      setPage(0);
      tryFetchRecruitList(0, false);
    }, [tryFetchRecruitList]),
  );

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || !hasNext) {
      return;
    }
    tryFetchRecruitList(page + 1, true);
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  // 전체 풀스크린 로딩으로 막고 싶으면 이 부분 사용
  if (isInitialLoading && page === 0) {
    return (
      <View style={styles.container}>
        <Header title="채용공고" />
        <Loading title="채용 정보를 가져오는 중입니다..." />
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {/* 헤더 */}
      <Header title="채용공고" />

      {/* 검색 박스 */}
      <View style={styles.headerBox}>
        <View style={[styles.searchInputContainer]}>
          <SearchIcon width={24} height={24} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="일할 게스트하우스를 찾아보세요"
            placeholderTextColor={COLORS.grayscale_600}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={() =>
              navigation.navigate('EmploySearchResult', {search: searchText})
            }
          />
        </View>
      </View>

      {/* 뽑고 있는 게스트하우스 */}
      <View style={styles.employContainer}>
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>채용 중인 게스트하우스</Text>
        </View>

        <RecruitList
          data={recruitList}
          // 첫 페이지 로딩일 때만 RecruitList 내부의 전체 로딩 사용
          loading={isInitialLoading && page === 0}
          onEndReached={handleEndReached}
          onJobPress={handleJobPress}
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

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmploySearchList;
