import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, ActivityIndicator} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from '../Employ.styles';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';

// 아이콘 불러오기
import SearchIcon from '@assets/images/search_gray.svg';
import userEmployApi from '@utils/api/userEmployApi';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useUserStore from '@stores/userStore';
import ErrorModal from '@components/modals/ErrorModal';
import Header from '@components/Header';

const EmploySearchList = () => {
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);
  const [isEmLoading, setIsEmLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setRecruitList([]);
      setHasNext(true);
      fetchRecruitList(0);
    }, [fetchRecruitList]),
  );

  //채용 공고 조회
  const fetchRecruitList = useCallback(
    async (pageToFetch = 0) => {
      if (isEmLoading || !hasNext) return;
      setIsEmLoading(true);
      try {
        const userRole = useUserStore.getState()?.userRole;
        const res = await userEmployApi.getRecruits(
          {
            page: pageToFetch,
            size: 8,
          },
          userRole === 'USER',
        );
        const newContent = res.data.content;
        setRecruitList(prev => [...prev, ...newContent]);
        setHasNext(!res.data.last);
      } catch (error) {
        setHasNext(false);
        console.warn('fetchRecruitList 실패:', error);
      } finally {
        setIsEmLoading(false);
      }
    },
    [isEmLoading, hasNext, page],
  );

  const handleEndReached = () => {
    if (!isEmLoading && hasNext) {
      setPage(prev => prev + 1);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isEmLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
  }
  return (
    <View style={[styles.container]}>
      {/* 헤더 */}
      <Header title="채용공고" />
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'column',
          gap: 16,
          paddingBottom: 12,
        }}>
        {/* 검색창 */}
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
        <View
          style={[
            styles.titleSection,
            {justifyContent: 'center', marginBottom: 4, marginTop: 8},
          ]}>
          <Text style={{...FONTS.fs_14_medium, color: COLORS.grayscale_500}}>
            채용 중인 게스트하우스
          </Text>
        </View>
        <RecruitList
          data={recruitList}
          loading={isEmLoading}
          onEndReached={handleEndReached}
          onJobPress={handleJobPress}
          onToggleFavorite={toggleLikeRecruit}
          setRecruitList={setRecruitList}
          showErrorModal={setErrorModal}
          ListFooterComponent={
            isEmLoading && <ActivityIndicator size="small" color="gray" />
          }
        />
      </View>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmploySearchList;
