import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from '../Employ.styles';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import dayjs from 'dayjs';

// 아이콘 불러오기
import SearchIcon from '@assets/images/search_gray.svg';
import userEmployApi from '@utils/api/userEmployApi';
import WorkAndStay from './WorkAndStay';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import Loading from '@components/Loading';

const EmployIntro = () => {
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    tryFetchGuesthouses();
    fetchRecruitList();
  }, []);

  const tryFetchGuesthouses = async () => {
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
  };

  const fetchRecruitList = async () => {
    try {
      const response = await userEmployApi.getRecruits({page: 0, size: 10});
      setRecruitList(response.data.content);
    } catch (error) {
      console.warn('공고 조회 실패', error);
    } finally {
      setIsEmLoading(false);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isEmLoading || isGHLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
  }
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingBottom: 0,
          flexGrow: 1,
        }}>
        {/* 헤더 */}
        <View style={styles.headerBox}>
          <View></View>
          <Text style={styles.headerText}>채용공고</Text>
          <View></View>
        </View>
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
                //   navigation.navigate('');
              }}>
              <Text style={styles.seeMoreText}>더보기</Text>
              <Chevron_right_gray width={24} height={24} />
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
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EmployIntro;
