import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import EmptyState from '@components/EmptyState';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import Loading from '@components/Loading';
import AddReviewCommentModal from '@components/modals/HostMy/Guesthouse/AddReviewCommentModal';
import DeleteReviewModal from '@components/modals/HostMy/Guesthouse/DeleteReviewModal';

import EmptyIcon from '@assets/images/wa_orange_noreview.svg';
import StarIcon from '@assets/images/star_white.svg';

const PAGE_SIZE = 10;
const SORT = 'id';

// 댓글 없는거 우선 + 최신(id) 정렬
const prioritizeNoReplies = (list) =>
  [...list].sort((a, b) => {
    const aLen = (a.replies || []).length;
    const bLen = (b.replies || []).length;
    if (aLen !== bLen) return aLen - bLen;    // 0(없음) 먼저
    return (b.id ?? 0) - (a.id ?? 0);         // id
  });

// isJobReview=false만 남기고 replies 정규화
const normalize = (arr = []) =>
  arr
    .filter((r) => r && r.isJobReview === false)
    .map((r) => ({ ...r, replies: Array.isArray(r.replies) ? r.replies : [] }));

const MyGuesthouseReviewList = ({ guesthouseId }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 답글달기 모달
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState(null);

  // 리뷰 삭제요청 모달
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeDeleteReviewId, setActiveDeleteReviewId] = useState(null);

  // 첫 로드 & guesthouse 변경 시
  useEffect(() => {
    if (!guesthouseId) return;
    setReviews([]);
    setPage(0);
    setLastPage(false);
    fetchReviews(0, true);
  }, [guesthouseId]);

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

      const merged = isRefresh || pageToLoad === 0
        ? newReviews
        : [...reviews, ...newReviews];
      
      setReviews(prioritizeNoReplies(merged));
      setPage(pageToLoad);
    } catch (error) {
      Alert.alert('리뷰 불러오기 실패', '잠시 후 다시 시도해주세요.');
      setLastPage(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 무한스크롤
  const handleEndReached = () => {
    if (!loading && !lastPage) {
      fetchReviews(page + 1);
    }
  };

  // 리뷰
  const renderItem = ({ item, index }) => {
    const hasReplies = Array.isArray(item.replies) && item.replies.length > 0;
    const isLast = index === reviews.length - 1;
    const images = Array.isArray(item.imgUrls) ? item.imgUrls : [];

    return (
      <View style={styles.card}>
        {/* <Text style={[FONTS.fs_16_medium, styles.roomText]}>방이름 (0인실 성별)</Text> */}
        <Text style={[FONTS.fs_16_medium, styles.roomText]}>{item.nickname}</Text>
        <View style={styles.ratingDeleteRow}>
            <View style={styles.ratingBox}>
              <StarIcon width={14} height={14}/>
              <Text style={[FONTS.fs_14_semibold, styles.ratingText]}>{item.reviewRating}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                setActiveDeleteReviewId(item.id);
                setDeleteModalOpen(true);
              }}
            >
              <Text style={[FONTS.fs_14_semibold, styles.deleteText]}>삭제요청</Text>
            </TouchableOpacity>
        </View>

        {/* 리뷰 사진 */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.sliderContent}
          >
            {images.map((uri, idx) => (
              <Image
                key={`${item.id}-img-${idx}`}
                source={{ uri }}
                style={styles.slideImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* 리뷰 내용 */}
        <View style={styles.reviewDetailContainer}>
          <Text style={[FONTS.fs_14_medium, styles.reviewText]}>
            {item.reviewDetail}
          </Text>
        </View>
        
        {/* 사장님 답글 */}
        {hasReplies ? (
          <View style={styles.replyContainer}>
            <Text style={[FONTS.fs_12_medium, styles.replyTitle]}>사장님의 한마디</Text>
            {item.replies.map((rep, i) => (
              <Text key={`${item.id}-rep-${i}`} style={[FONTS.fs_14_regular, styles.replyText]}>
                {rep}
              </Text>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setActiveReviewId(item.id);
              setReplyModalOpen(true);
            }}
            style={styles.replyButton}
          >
            <Text style={[FONTS.fs_16_semibold, styles.replyButtonText]}>답글달기</Text>
          </TouchableOpacity>
        )}

        {!isLast && <View style={styles.devide} />}
        
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        onEndReached={handleEndReached}
        // onEndReached가 어느 시점에서 호출될지 결정 (0.5 → 화면 절반 전 도달 시 호출)
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && !refreshing ? <Loading title="리뷰를 불러오는 중이에요" /> : null}
        contentContainerStyle={
          reviews.length === 0
            ? { flex: 1, justifyContent: 'center', alignItems: 'center' }
            : { marginBottom: 40, }
        }
        ListEmptyComponent={
          <View style={{flex: 1, justifyContent: 'center'}}>
            <EmptyState
              icon={EmptyIcon}
              iconSize={{ width: 96, height: 52 }}
              title="아직 작성된 리뷰가 없어요"
            />
          </View>
        }
      />

      {/* 답글달기 */}
      <AddReviewCommentModal
        visible={replyModalOpen}
        reviewId={activeReviewId}
        onClose={() => setReplyModalOpen(false)}
        onSuccess={() => fetchReviews(0, true)}
      />

      {/* 삭제요청 */}
      <DeleteReviewModal
        visible={deleteModalOpen}
        reviewId={activeDeleteReviewId}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => {
          setDeleteModalOpen(false);
        }}
      />
    </View>
  );
};

export default MyGuesthouseReviewList;

const styles = StyleSheet.create({
  // 리뷰
  card: {
    marginTop: 12,
  },
  ratingDeleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 별점
  ratingBox: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_800,
    gap: 4,
  },
  ratingText: {
    color: COLORS.grayscale_0,
  },
  // 삭제 버튼
  deleteButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  deleteText: {
    color: COLORS.grayscale_400,
  },

  // 리뷰 이미지
  sliderContent: {
    marginTop: 8,
  },
  slideImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: COLORS.grayscale_100,
  },

  // 리뷰 내용
  reviewDetailContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  reviewText: {
    lineHeight: 20,
  },

  // 사장님 답글
  replyContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    gap: 4,
  },
  replyTitle: {
    color: COLORS.grayscale_500,
  },
  replyText: {
    lineHeight: 20,
  },
  // 답글달기 버튼
  replyButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
  },
  replyButtonText: {
  },

  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginTop: 12,
  },
});
