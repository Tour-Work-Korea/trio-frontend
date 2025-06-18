import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './EmployList.styles';
import {RecruitList} from '@components/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';

// 아이콘 불러오기
import SearchIcon from '@assets/images/gray_search.svg';
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';

const EmployList = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecruitList(page);
  }, [page]);

  //채용 공고 조회
  const fetchRecruitList = async (pageToFetch = 0) => {
    if (loading || !hasNext) return;
    setLoading(true);
    try {
      const res = await userEmployApi.getRecruits({pageToFetch, size: 10}); // ← 페이지 기반 API 호출
      const newContent = res.data.content;
      setRecruitList(prev => [...prev, ...newContent]);
      setHasNext(!res.data.last); // 'last'가 true이면 더 없음
    } catch (error) {
      setHasNext(false);
      Alert.alert('공고 조회에 실패했습니다.');
      console.warn('fetchRecruitList 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndReached = () => {
    if (!loading && hasNext) {
      setPage(prev => prev + 1);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});
  const handleApplyPress = recruit =>
    navigation.navigate('Applicant', {
      recruitId: recruit?.recruitId,
      recruitTitle: recruit.recruitTitle,
      guesthouseName: recruit.guesthouseName,
      recruitEnd: recruit.recruitEnd,
    });

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="지역으로 검색"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>검색하기</Text>
        </TouchableOpacity>
      </View>
      <RecruitList
        data={recruitList}
        loading={loading}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.7}
        onJobPress={handleJobPress}
        onApplyPress={handleApplyPress}
        onToggleFavorite={toggleLikeRecruit}
        setRecruitList={setRecruitList}
        ListFooterComponent={
          loading && <ActivityIndicator size="small" color="gray" />
        }
      />
    </SafeAreaView>
  );
};

export default EmployList;
