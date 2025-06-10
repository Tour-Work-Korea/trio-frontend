// 콘솔에만 출력
import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';

const MyGuesthouseReviewDetail = () => {
  const route = useRoute();
  const { review } = route.params;
  const navigation = useNavigation();

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>작성자: {review.nickname}</Text>
      <Text style={{ marginVertical: 10 }}>{review.content}</Text>
      <Text>별점: {review.rating}</Text>
      <ButtonScarlet
        title="답글달기"
        marginHorizontal="0"
        onPress={() =>
          navigation.navigate('ReviewCommentAddEdit', { reviewId: review.reviewId })
        }
      />
      <ButtonScarlet
        title="삭제하기"
        marginHorizontal="0"
        onPress={() =>
          navigation.navigate('DeleteReview', { reviewId: review.reviewId })
        }
      />
    </View>
  );
};

export default MyGuesthouseReviewDetail;
