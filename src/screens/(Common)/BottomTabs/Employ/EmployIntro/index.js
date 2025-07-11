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
import styles from './EmployIntro.styles';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import {SafeAreaView} from 'react-native-safe-area-context';
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

  //채용 공고 조회
  const fetchRecruitList = async (pageToFetch = 0) => {
    setIsEmLoading(true);
    try {
      const res = await userEmployApi.getRecruits({pageToFetch, size: 6});
      const newContent = res.data.content;
      setRecruitList(prev => [...prev, ...newContent]);
    } catch (error) {
      console.warn('fetchRecruitList 실패:', error);
    } finally {
      setIsEmLoading(false);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  const handleApplyPress = recruit =>
    navigation.navigate('ApplicantForm', {
      recruitId: recruit?.recruitId,
      recruitTitle: recruit.recruitTitle,
      guesthouseName: recruit.guesthouseName,
      recruitEnd: recruit.recruitEnd,
    });

  if (isEmLoading || isGHLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{gap: 16}}>
        {/* 헤더 */}
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>채용공고</Text>
        </View>
        {/* 검색창 */}
        <View style={styles.searchInputContainer}>
          <SearchIcon width={24} height={24} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="지역으로 검색"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
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
            onApplyPress={handleApplyPress}
            onToggleFavorite={toggleLikeRecruit}
            setRecruitList={setRecruitList}
            ListFooterComponent={
              isEmLoading && <ActivityIndicator size="small" color="gray" />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployIntro;
