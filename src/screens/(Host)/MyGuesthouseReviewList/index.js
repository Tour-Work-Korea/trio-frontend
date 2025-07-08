// 콘솔에만 출력
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const PAGE_SIZE = 10;
const SORT = 'id';

const MyGuesthouseReviewList = () => {
  const route = useRoute();
  const { guesthouseId } = route.params;
  const navigation = useNavigation();

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 특정 게하 리뷰 목록 조회
  const fetchReviews = async (pageToLoad = 0, isRefresh = false) => {
    if (loading || lastPage && !isRefresh) return;
    setLoading(true);

    try {
      const res = await hostGuesthouseApi.getGuesthouseReviews({
        guesthouseId,
        page: pageToLoad,
        size: PAGE_SIZE,
        sort: SORT,
      });

      const newReviews = res.data.content || [];
      setLastPage(res.data.last);

      if (isRefresh || pageToLoad === 0) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setPage(pageToLoad);
    } catch (error) {
      Alert.alert('리뷰 불러오기 실패', '네트워크 오류 또는 서버 오류가 발생했습니다.');
      console.error('리뷰 목록 조회 실패:', error.response?.data || error.message);
      setLastPage(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // mount/guesthouseId 바뀔 때 초기화+첫 fetch
  useEffect(() => {
    setReviews([]);
    setPage(0);
    setLastPage(false);
    setLoading(false);
    setRefreshing(false);
    fetchReviews(0, true);
  }, [guesthouseId]);

   // 무한스크롤
  const handleEndReached = () => {
    if (!loading && !lastPage) {
      fetchReviews(page + 1);
    }
  };

  // 새로고침
  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews(0, true);
  };

  // 데이터 출력용 임시 디자인
  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}
      onPress={() =>
        navigation.navigate('MyGuesthouseReviewDetail', { review: item })
      }
    >
      <Text style={{ fontWeight: 'bold' }}>{item.nickname}</Text>
      <Text>{item.reviewDetail || item.content}</Text>
      <Text style={{ color: '#888' }}>⭐ {item.reviewRating || item.rating}</Text>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={item => (item.reviewId || item.id).toString()}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>리뷰가 없습니다.</Text>}
      />
    </View>
  );
};

export default MyGuesthouseReviewList;
