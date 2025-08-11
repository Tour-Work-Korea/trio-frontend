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

import EmptyIcon from '@assets/images/wa_orange_noreview.svg';
import StarIcon from '@assets/images/star_white.svg';

const PAGE_SIZE = 10;
const SORT = 'id';

const MOCK_IMG = 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg';
// ✅ 임시 리뷰 데이터 3개 (모두 isJobReview: false)
const MOCK_REVIEWS = [
  {
    id: 9003,
    nickname: '여행러버',
    reviewDetail: '처음 도착했을 때부터 따뜻하게 맞아주셔서 기분 좋게 하루를 시작할 수 있었습니다. 숙소 위치도 시내와 가까워서 도보로 이동하기 편했고, 근처 맛집이나 카페 정보도 친절하게 안내해주셔서 너무 감사했어요. 방 안은 사진으로 봤던 것보다 훨씬 더 깨끗했고, 침구 상태나 조명 분위기, 전체적인 인테리어가 아기자기하면서도 깔끔해서 힐링이 절로 되더라고요. 공용 공간도 정돈이 잘 되어 있어서 다른 게스트분들과 부담 없이 인사도 나눌 수 있었고, 각자의 여행 이야기를 나누는 시간도 정말 특별했어요. 사장님이 직접 알려주신 로컬 맛집이 특히 인상 깊었고, 덕분에 제주도의 새로운 매력을 알게 된 것 같아요. 혼자 여행 왔지만 전혀 외롭지 않았고, 오히려 더 따뜻하게 느껴졌던 시간이었어요. 다음에는 친구들과 다시 꼭 방문하고 싶습니다. 감사합니다!',
    reviewRating: 4.5,
    isJobReview: false,
    userImgUrl: MOCK_IMG,
    imgUrls: [MOCK_IMG, MOCK_IMG, MOCK_IMG],
    replies: [], // 댓글 없음 -> 우선 노출
  },
  {
    id: 9002,
    nickname: '워케이',
    reviewDetail: '사장님 친절, 방 컨디션 양호. 위치가 최고입니다.',
    reviewRating: 5.0,
    isJobReview: false,
    userImgUrl: MOCK_IMG,
    imgUrls: [MOCK_IMG],
    replies: ['감사합니다!'], // 댓글 있음
  },
  {
    id: 9001,
    nickname: '홍길동',
    reviewDetail: '가성비 좋아요. 청결하고 조용합니다.',
    reviewRating: 4.0,
    isJobReview: false,
    userImgUrl: MOCK_IMG,
    imgUrls: [MOCK_IMG],
    replies: [], // 댓글 없음 -> 우선 노출
  },
];


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

  // 첫 로드 & guesthouse 변경 시
  useEffect(() => {
    if (!guesthouseId) return;
    setReviews([]);
    setPage(0);
    setLastPage(false);
    fetchReviews(0, true);
  }, [guesthouseId]);

  // 임시 리뷰 목록 호출
  const fetchReviews = async (pageToLoad = 0, isRefresh = false) => {
    if (loading || (lastPage && !isRefresh)) return;
    setLoading(true);

    try {
      const res = await hostGuesthouseApi.getGuesthouseReviews({
        guesthouseId,
        page: pageToLoad,
        size: PAGE_SIZE,
        sort: SORT,
      });

      let newReviews = normalize(res?.data?.content || []);

      // 첫 페이지가 비어오면 임시데이터 사용
      
        newReviews = normalize(MOCK_REVIEWS);
        setLastPage(true);

      const merged = isRefresh || pageToLoad === 0
        ? newReviews
        : [...reviews, ...newReviews];

      setReviews(prioritizeNoReplies(merged));
      setPage(pageToLoad);
    } catch (error) {
      // 에러 시에도 임시데이터로 대체(첫 페이지일 때)
      if (pageToLoad === 0) {
        setReviews(prioritizeNoReplies(normalize(MOCK_REVIEWS)));
        setLastPage(true);
      } else {
        Alert.alert('리뷰 불러오기 실패', '잠시 후 다시 시도해주세요.');
      }
      console.log('리뷰 목록 조회 실패:', error?.response?.data || error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 특정 게하 리뷰 목록 조회
  // const fetchReviews = async (pageToLoad = 0, isRefresh = false) => {
  //   if (loading || lastPage && !isRefresh) return;
  //   setLoading(true);

  //   try {
  //     const res = await hostGuesthouseApi.getGuesthouseReviews({
  //       guesthouseId,
  //       page: pageToLoad,
  //       size: PAGE_SIZE,
  //       sort: SORT,
  //     });

  //     const newReviews = res.data.content || [];
  //     setLastPage(res.data.last);

  //     const merged = isRefresh || pageToLoad === 0
  //       ? newReviews
  //       : [...reviews, ...newReviews];
      
  //     setReviews(prioritizeNoReplies(merged));
  //     setPage(pageToLoad);
  //   } catch (error) {
  //     Alert.alert('리뷰 불러오기 실패', '잠시 후 다시 시도해주세요.');
  //     setLastPage(true);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  // 무한스크롤
  const handleEndReached = () => {
    if (!loading && !lastPage) {
      fetchReviews(page + 1);
    }
  };

  // 답글 달기
  const handlePressReply = (review) => {
    // TODO: 답글 작성 모달/화면 열기
    // navigation.navigate('HostReplyModal', { reviewId: review.id })
  };

  // 리뷰
  const renderItem = ({ item, index }) => {
    const hasReplies = Array.isArray(item.replies) && item.replies.length > 0;
    const isLast = index === reviews.length - 1;
    const images = Array.isArray(item.imgUrls) ? item.imgUrls : [];

    return (
      <View style={styles.card}>
        <Text style={[FONTS.fs_16_medium, styles.roomText]}>방이름 (0인실 성별)</Text>
        <View style={styles.ratingDeleteRow}>
            <View style={styles.ratingBox}>
              <StarIcon width={14} height={14}/>
              <Text style={[FONTS.fs_14_semibold, styles.ratingText]}>{item.reviewRating}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
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
            onPress={() => handlePressReply(item)}
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
