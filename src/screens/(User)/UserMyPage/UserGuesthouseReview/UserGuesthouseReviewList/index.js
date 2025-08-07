import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';

import StarIcon from '@assets/images/star_white.svg';
import TrashIcon from '@assets/images/delete_gray.svg';
import NoReview from '@assets/images/wa_orange_noreview.svg';

const UserGuesthouseReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await userMyApi.getMyReviews();
      setReviews(res.data);
    } catch (error) {
      console.log('리뷰 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 리뷰 삭제
  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      '리뷰 삭제',
      '정말로 이 리뷰를 삭제하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await userMyApi.deleteReview(reviewId);
              Toast.show({
                type: 'success',
                text1: '삭제되었어요!',
                position: 'top',
                visibilityTime: 2000,
              });
              await fetchReviews(); // 최신 상태 반영
            } catch (error) {
              console.error('리뷰 삭제 실패:', error);
              Alert.alert('삭제 실패', '리뷰 삭제 중 문제가 발생했어요.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderReviewItem = ({ item, index }) => {
    // const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkIn);
    // const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkOut);
    const isLastItem = index === reviews.length - 1;

    return (
      <View style={styles.card}>
        {/* 상단: 이미지 + 기본정보 */}
        <View style={styles.topRow}>
          <Image source={{ uri: item.reviewImageUrls[0] }} style={styles.thumbnail} />
          <View style={styles.topInfoRow}>
            <Text style={[FONTS.fs_16_semibold]}>{item.guesthouseName}</Text>
            <Text style={[FONTS.fs_14_medium]}>룸이름</Text>
            <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_500}]}>주소</Text>
            <Text style={[FONTS.fs_12_medium, { color: COLORS.grayscale_500 }]}>
              {item.checkIn} ~ {item.checkOut}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          {/* 평점 */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <StarIcon width={14} height={14} />
              <Text style={[FONTS.fs_14_semibold, {color: COLORS.grayscale_0}]}>{item.reviewRating}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteReview(item.reviewId)}>
              <TrashIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 리뷰 이미지 목록 */}
          {item.reviewImageUrls?.length > 0 && (
            <ScrollView 
              style={styles.imageRow}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {item.reviewImageUrls.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
              ))}
            </ScrollView>
          )}

          {/* 리뷰 내용 */}
          <Text style={[FONTS.fs_14_regular, { marginTop: 10 }]}>{item.reviewDetail}</Text>

          {/* 사장님 한마디 */}
          {item.replies?.length > 0 && (
            <View style={styles.ownerReplyBox}>
              <Text style={[FONTS.fs_12_medium, { color: COLORS.grayscale_400 }]}>사장님의 한마디</Text>
              <Text style={[FONTS.fs_14_regular]}>{item.replies[0]}</Text>
            </View>
          )}
        </View>

        {!isLastItem && <View style={styles.devide} />}
      </View>
    );
  };

  if (loading) return <Loading title={'리뷰를 불러오는 중이에요'} />;
  if (!reviews || reviews.length === 0) return <EmptyState icon={NoReview} title={'아직 작성된 리뷰가 없어요'} description={'첫 리뷰를 남겨주세요!'} iconSize={{ width: 100, height: 60 }}/>;

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.reviewId.toString()}
        renderItem={renderReviewItem}
        contentContainerStyle={{}}
      />
    </View>
  );
};

export default UserGuesthouseReviewList;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  devide: {
    marginVertical: 16,
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },  

  // 리스트
  card: {
  },
  // 게하 정보
  topRow: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 12,
  },
  topInfoRow: {
    flex: 1,
    paddingVertical: 4,
    gap: 4,
  },

  // 리뷰
  bottomRow: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  // 평점
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_800,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 100,
    gap: 4,
  },

  // 리뷰 이미지
  imageRow: {
    marginTop: 10,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },

  // 사장님 답글
  ownerReplyBox: {
    marginTop: 10,
    backgroundColor: COLORS.grayscale_0,
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
});
