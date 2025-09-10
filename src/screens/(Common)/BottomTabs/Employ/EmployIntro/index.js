import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import WorkAndStay from './WorkAndStay';
import {RecruitList} from '@components/Employ/RecruitList';
import useUserStore from '@stores/userStore';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import userEmployApi from '@utils/api/userEmployApi';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import Loading from '@components/Loading';
import ErrorModal from '@components/modals/ErrorModal';
import Header from '@components/Header';
// 아이콘 불러오기
import styles from '../Employ.styles';
import SearchIcon from '@assets/images/search_gray.svg';
import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';

const EmployIntro = () => {
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      tryFetchGuesthouses();
      tryFetchRecruitList();
    }, [tryFetchGuesthouses, tryFetchRecruitList]),
  );

  const tryFetchGuesthouses = useCallback(async () => {
    const today = dayjs();
    const tomorrow = today.add(1, 'day');

    try {
      const params = {
        checkIn: today.format('YYYY-MM-DD'),
        checkOut: tomorrow.format('YYYY-MM-DD'),
        guestCount: 1,
        page: 0,
        size: 10,
        sort: 'RECOMMEND',
        keyword: '외도',
      };
      const response = await userGuesthouseApi.getGuesthouseList(params);
      setGuesthouseList(response.data.content);
    } catch (error) {
      console.warn('게스트하우스 조회 실패', error);
    } finally {
      setIsGHLoading(false);
    }
  }, []);

  const tryFetchRecruitList = useCallback(async () => {
    try {
      const userRole = useUserStore.getState()?.userRole;
      const response = await userEmployApi.getRecruits(
        {page: 0, size: 10},
        userRole === 'USER',
      );
      setRecruitList(response.data.content);
    } catch (error) {
      console.warn('공고 조회 실패', error);
    } finally {
      setIsEmLoading(false);
    }
  }, []);

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isEmLoading || isGHLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
  }
  return (
    <View style={styles.container}>
      <Header title="채용공고" />
      <ScrollView contentContainerStyle={styles.scrollContentEmployIntro}>
        {/* 검색창 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EmploySearchList')}>
          <View style={styles.searchInputContainer}>
            <SearchIcon width={24} height={24} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="일할 게스트하우스를 찾아보세요"
              value={searchText}
              onChangeText={setSearchText}
              editable={false}
            />
          </View>
        </TouchableOpacity>

        {/* Work+Stay를 한 번에 */}
        <View>
          <WorkAndStay guesthouses={guesthouseList} />
        </View>
        {/* 추천 일자리 */}
        <View style={styles.employContainer}>
          <View style={[styles.titleSection]}>
            <Text style={styles.sectionTitle}>추천 일자리</Text>
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => {
                navigation.navigate('EmploySearchList');
              }}>
              <Text style={styles.seeMoreText}>더보기</Text>
              <ChevronRightIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
          <RecruitList
            data={recruitList}
            loading={isEmLoading}
            onJobPress={handleJobPress}
            onToggleFavorite={toggleLikeRecruit}
            setRecruitList={setRecruitList}
            ListFooterComponent={
              isEmLoading && <ActivityIndicator size="small" color="gray" />
            }
            scrollEnabled={false}
            showErrorModal={setErrorModal}
          />
        </View>
      </ScrollView>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmployIntro;
