import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const ReviewCommentAddEdit = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reviewId } = route.params;

  const [reply, setReply] = useState('');

  // 리뷰 답글 달기
  const handleSubmit = async () => {
    try {
      await hostGuesthouseApi.postReviewReply(reviewId, reply);
      console.log('답글 작성 성공');
      navigation.goBack();
    } catch (error) {
      console.error('답글 작성 실패:', error.response?.data || error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>답글 작성</Text>
      <TextInput
        placeholder="답글을 입력하세요..."
        value={reply}
        onChangeText={setReply}
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          minHeight: 100,
          marginBottom: 20,
        }}
      />
      <ButtonScarlet
        title="답글 등록"
        marginHorizontal="0"
        onPress={handleSubmit}
      />
    </View>
  );
};

export default ReviewCommentAddEdit;
