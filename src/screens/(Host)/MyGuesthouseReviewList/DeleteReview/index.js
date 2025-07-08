// 콘솔에만 출력
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const DeleteReview = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reviewId } = route.params;

  const [reason, setReason] = useState('');

  // 리뷰 삭제 요청
  const handleDelete = async () => {
    try {
      await hostGuesthouseApi.deleteReview(reviewId, reason);
      console.log('리뷰 삭제 성공');
      navigation.goBack();
    } catch (error) {
      console.error('리뷰 삭제 실패:', error.response?.data || error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>리뷰 삭제 사유</Text>
      <TextInput
        placeholder="삭제 사유를 입력하세요..."
        value={reason}
        onChangeText={setReason}
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
        title="리뷰 삭제"
        marginHorizontal="0"
        onPress={handleDelete}
      />
    </View>
  );
};

export default DeleteReview;
