import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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
  // 목록/페이지 상태
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);

  // 로딩 상태
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false); // onEndReached 중복 호출 가드

  // 답글달기 모달
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState(null);

  // 리뷰 삭제요청 모달
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeDeleteReviewId, setActiveDeleteReviewId] = useState(null);

  const fetchPage = useCallback(
    async (p, { replace = false } = {}) => {
      // 중복 호출 방지
      if (inFlight.current) return;
      inFlight.current = true;

      // 상태별 스피너
      if (replace) {
        setRefreshing(true);
      } else if (p === 0) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await hostGuesthouseApi.getGuesthouseReviews({
          guesthouseId,
          page: p,
          size: PAGE_SIZE,
          sort: SORT,
        });

        const content = Array.isArray(res?.data?.content)
          ? res.data.content
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const last = res?.data?.last ?? true;

        const normalized = normalize(content);
        
        // 댓글 없는 리뷰 우선 + id 최신
        setReviews(prev => {
          const merged = replace || p === 0 ? normalized : [...prev, ...normalized];
          const deduped = Array.from(new Map(merged.map(r => [String(r.id), r])).values());
          return prioritizeNoReplies(deduped);
        });

        setPage(p);
        setHasNext(!last);
      } catch (e) {
        console.log('리뷰 불러오기 실패:', e?.message ?? e);
      } finally {
        if (replace) setRefreshing(false);
        else if (p === 0) setInitialLoading(false);
        else setLoadingMore(false);
        inFlight.current = false;
      }
    }, [guesthouseId]
  );

  // 첫 로드 & guesthouse 변경 시
  useEffect(() => {
    if (!guesthouseId) return;
    setReviews([]);
    setPage(0);
    setHasNext(true);
    fetchPage(0, { replace: true });
  }, [guesthouseId]);

  // 무한 스크롤
  const handleEndReached = () => {
    if (initialLoading || refreshing || loadingMore) return;
    if (!hasNext) return;
    fetchPage(page + 1);
  };

  // 당겨서 새로고침
  const handleRefresh = () => {
    if (initialLoading || refreshing) return;
    fetchPage(0, { replace: true });
  };

  // 리뷰
  const renderItem = ({ item, index }) => {
    const isLast = index === reviews.length - 1;
    const images = Array.isArray(item.imgUrls) ? item.imgUrls : [];
    const hasReplies = (item.replies || []).length > 0;

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

  if (initialLoading && !refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Loading title="리뷰를 불러오는 중이에요" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        onEndReached={handleEndReached}
        // onEndReached가 어느 시점에서 호출될지 결정 (0.5 → 화면 절반 전 도달 시 호출)
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loadingMore ? <Loading title="리뷰를 불러오는 중이에요" /> : null
        }
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
        onSuccess={() => fetchPage(0, { replace: true })}
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
