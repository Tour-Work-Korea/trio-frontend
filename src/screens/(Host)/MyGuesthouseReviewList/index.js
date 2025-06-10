// 콘솔에만 출력
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const MyGuesthouseReviewList = () => {
  const route = useRoute();
  const { guesthouseId } = route.params;
  const [reviews, setReviews] = useState([]);
  const navigation = useNavigation();

  // 특정 게하 리뷰 목록 조회
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await hostGuesthouseApi.getGuesthouseReviews(guesthouseId);
        console.log('게스트하우스 리뷰 목록:', response.data);
        setReviews(response.data.content);
      } catch (error) {
        console.error('리뷰 목록 조회 실패:', error.response?.data || error.message);
      }
    };

    fetchReviews();
  }, [guesthouseId]);

  // 데이터 출력용 임시 디자인
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}
      onPress={() =>
        navigation.navigate('MyGuesthouseReviewDetail', { review: item })
      }
    >
      <Text style={{ fontWeight: 'bold' }}>{item.nickname}</Text>
      <Text>{item.content}</Text>
      <Text style={{ color: '#888' }}>⭐ {item.rating}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.reviewId.toString()}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>리뷰가 없습니다.</Text>}
      />
    </View>
  );
};

export default MyGuesthouseReviewList;
