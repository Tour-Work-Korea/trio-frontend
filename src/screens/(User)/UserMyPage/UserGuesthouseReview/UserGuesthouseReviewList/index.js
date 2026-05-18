import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';
import {
  formatLocalDateTimeToDotAndTimeWithDay,
  formatLocalTimeToKorean12Hour,
} from '@utils/formatDate';

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
    const isLastItem = index === reviews.length - 1;
    const createdAtFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.createdAt);
    const checkInFormatted = formatLocalTimeToKorean12Hour(item.checkIn);
    const checkOutFormatted = formatLocalTimeToKorean12Hour(item.checkOut);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.guesthouseInfo}>
            <Text style={[FONTS.fs_16_semibold, styles.guesthouseName]}>
              {item.guesthouseName}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.metaText]}>
              작성일 {createdAtFormatted.date}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.metaText]}>
              체크인 {checkInFormatted} · 체크아웃 {checkOutFormatted}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.ratingBox}>
              <StarIcon width={14} height={14} />
              <Text style={[FONTS.fs_14_semibold, styles.ratingText]}>
                {item.reviewRating}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleDeleteReview(item.reviewId)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <TrashIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.reviewBox}>
          <Text style={[FONTS.fs_14_regular, styles.reviewText]}>
            {item.reviewDetail}
          </Text>

          {/* 리뷰 이미지 목록 */}
          {item.reviewImageUrls?.length > 0 && (
            <ScrollView
              style={styles.imageRow}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageRowContent}
            >
              {item.reviewImageUrls.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
              ))}
            </ScrollView>
          )}

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

  if (loading) {
    return <Loading title={'리뷰를 불러오는 중이에요'} />;
  }
  if (!reviews || reviews.length === 0) {
    return <EmptyState icon={NoReview} title={'아직 작성된 리뷰가 없어요'} description={'첫 리뷰를 남겨주세요!'} iconSize={{ width: 100, height: 60 }}/>;
  }

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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  guesthouseInfo: {
    flex: 1,
    gap: 4,
  },
  guesthouseName: {
    color: COLORS.grayscale_900,
  },
  metaText: {
    color: COLORS.grayscale_500,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 12,
  },

  // 리뷰
  reviewBox: {
    backgroundColor: COLORS.grayscale_100,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
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
  ratingText: {
    color: COLORS.grayscale_0,
  },
  reviewText: {
    color: COLORS.grayscale_800,
    lineHeight: 20,
  },

  // 리뷰 이미지
  imageRow: {
    marginTop: 12,
  },
  imageRowContent: {
    gap: 12,
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
