import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useUserStore from '@stores/userStore';
import guesthouseProfileApi from '@utils/api/guesthouseProfileApi';
import ImageModal from '@components/modals/ImageModal';
import Avatar from '@components/Avatar';

import Star from '@assets/images/star_white.svg';
import NoReviewIcon from '@assets/images/wa_orange_noreview.svg';

const PAGE_SIZE = 10;

const toImageUrls = item => {
  if (Array.isArray(item?.imgUrls)) return item.imgUrls.filter(Boolean);
  if (Array.isArray(item?.reviewImageUrls)) return item.reviewImageUrls.filter(Boolean);
  if (item?.thumbnailImageUrl) return [item.thumbnailImageUrl];
  if (Array.isArray(item?.images)) {
    return item.images
      .map(image => image?.imageUrl ?? image?.url ?? image)
      .filter(Boolean);
  }
  return [];
};

const normalizeReviewItem = (item, fallbackId) => ({
  id: String(item?.itemId ?? item?.reviewId ?? item?.id ?? fallbackId),
  nickname:
    item?.nickname ??
    item?.userNickname ??
    item?.reviewerNickname ??
    item?.profileSummary?.ownerName ??
    '사용자',
  userImgUrl:
    item?.userImgUrl ??
    item?.reviewerProfileImageUrl ??
    item?.profileImageUrl ??
    item?.profileSummary?.ownerProfileImageUrl ??
    null,
  reviewRating: Number(item?.reviewRating ?? item?.rating ?? 0),
  reviewDetail: item?.reviewDetail ?? item?.content ?? item?.reviewContent ?? '',
  imgUrls: toImageUrls(item),
  replies:
    Array.isArray(item?.replies)
      ? item.replies
      : Array.isArray(item?.replyContents)
        ? item.replyContents
        : [],
});

const HostProfileReviews = ({guesthouseId}) => {
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedHostGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  const inFlight = useRef(false);

  const selectedGuesthouseId = useMemo(() => {
    const routeId = Number(guesthouseId);
    if (Number.isFinite(routeId) && routeId > 0) return routeId;

    const profiles = Array.isArray(hostProfile?.guesthouseProfiles)
      ? hostProfile.guesthouseProfiles
      : [];
    if (!profiles.length) return null;

    const selected =
      profiles.find(
        (item, index) =>
          String(item?.guesthouseId ?? `guesthouse-${index}`) ===
          String(selectedHostGuesthouseId),
      ) || profiles[0];

    const id = Number(selected?.guesthouseId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [guesthouseId, hostProfile?.guesthouseProfiles, selectedHostGuesthouseId]);

  const fetchSummary = useCallback(async () => {
    if (!selectedGuesthouseId) {
      setAverageRating(0);
      setReviewCount(0);
      return;
    }

    try {
      const res = await guesthouseProfileApi.getGuesthouseProfile(selectedGuesthouseId);
      const data = res?.data ?? {};
      const summary = data?.profileSummary ?? {};
      setAverageRating(Number(data?.averageRating ?? summary?.averageRating ?? 0));
      setReviewCount(Number(data?.reviewCount ?? 0));
    } catch (error) {
      setAverageRating(0);
      setReviewCount(0);
    }
  }, [selectedGuesthouseId]);

  const fetchPage = useCallback(
    async ({pageToFetch, append, isRefresh = false}) => {
      if (!selectedGuesthouseId || inFlight.current) return;

      inFlight.current = true;
      if (append) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await guesthouseProfileApi.getGuesthouseProfileFeed({
          guesthouseId: selectedGuesthouseId,
          tab: 'REVIEWS',
          postType: 'ALL',
          page: pageToFetch,
          size: PAGE_SIZE,
        });

        const payload = res?.data ?? {};
        const content = Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

        const normalized = content.map((item, index) =>
          normalizeReviewItem(item, `${pageToFetch}-${index}`),
        );

        const last =
          typeof payload?.last === 'boolean' ? payload.last : normalized.length < PAGE_SIZE;
        const currentPage = Number(payload?.number);

        setReviews(prev => (append ? [...prev, ...normalized] : normalized));
        setPage(Number.isFinite(currentPage) ? currentPage : pageToFetch);
        setHasNext(!last);
      } catch (error) {
        if (!append) setReviews([]);
        setHasNext(false);
      } finally {
        inFlight.current = false;
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [selectedGuesthouseId],
  );

  useEffect(() => {
    setReviews([]);
    setPage(0);
    setHasNext(true);

    fetchSummary();
    if (!selectedGuesthouseId) return;
    fetchPage({pageToFetch: 0, append: false, isRefresh: false});
  }, [selectedGuesthouseId, fetchPage, fetchSummary]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || !hasNext) return;
    fetchPage({pageToFetch: page + 1, append: true});
  }, [fetchPage, hasNext, loading, loadingMore, page]);

  const handleRefresh = useCallback(() => {
    fetchPage({pageToFetch: 0, append: false, isRefresh: true});
  }, [fetchPage]);

  const openImageModal = (images, index) => {
    setModalImages(images.map((url, i) => ({id: String(i), imageUrl: url})));
    setModalIndex(index);
    setImageModalVisible(true);
  };

  const renderItem = ({item}) => {
    const hasImages = Array.isArray(item?.imgUrls) && item.imgUrls.length > 0;

    return (
      <View style={styles.reviewContainer}>
        <View style={styles.reviewHeaderContainer}>
          <View style={styles.userProfileContainer}>
            <Avatar uri={item.userImgUrl} size={44} iconSize={18} style={styles.userImage} />
            <Text style={[FONTS.fs_14_medium, styles.userNicknameText]}>{item.nickname}</Text>
          </View>
          <View style={styles.userRatingContainer}>
            <Star width={14} height={14} />
            <Text style={[FONTS.fs_14_semibold, styles.userRatingText]}>{item.reviewRating}</Text>
          </View>
        </View>

        {hasImages ? (
          <View style={styles.reviewImageContainer}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              onStartShouldSetResponderCapture={() => true}
              onMoveShouldSetResponderCapture={() => true}
              contentContainerStyle={styles.reviewImageScrollContent}>
              {item.imgUrls.map((imgUrl, idx) => (
                <TouchableOpacity key={`${item.id}-img-${idx}`} onPress={() => openImageModal(item.imgUrls, idx)}>
                  <Image source={{uri: imgUrl}} style={styles.reviewImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <Text style={[FONTS.fs_14_regular, styles.reviewText]}>{item.reviewDetail}</Text>

        {item.replies && item.replies.length > 0 ? (
          <View style={styles.replyContainer}>
            <Text style={[FONTS.fs_12_medium, styles.replyTitle]}>사장님의 한마디</Text>
            {item.replies.map((reply, idx) => (
              <Text key={`${item.id}-reply-${idx}`} style={[FONTS.fs_14_regular, styles.replyText]}>
                {reply}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyReviewContainer}>
              <ActivityIndicator size="small" color={COLORS.grayscale_500} />
            </View>
          ) : (
            <View style={styles.emptyReviewContainer}>
              <NoReviewIcon />
              <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
                아직 등록된 리뷰가 없어요.{"\n"}
                당신의 첫 리뷰를 남겨주세요!
              </Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />

      {imageModalVisible ? (
        <ImageModal
          visible={imageModalVisible}
          title="리뷰 사진"
          images={modalImages}
          selectedImageIndex={modalIndex}
          onClose={() => setImageModalVisible(false)}
        />
      ) : null}
    </View>
  );
};

export default HostProfileReviews;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  reviewRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabTitle: {
    color: COLORS.grayscale_800,
    marginTop: 28,
    marginBottom: 12,
  },
  reviewRow: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reviewBoxBlue: {
    backgroundColor: COLORS.primary_blue,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginTop: 28,
  },
  rating: {
    color: COLORS.grayscale_0,
    marginLeft: 4,
  },
  ratingDevide: {
    color: COLORS.grayscale_0,
    marginHorizontal: 2,
  },
  reviewCount: {
    color: COLORS.grayscale_0,
  },

  reviewContainer: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
    marginVertical: 2,
  },

  reviewHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    height: 44,
    width: 44,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_300,
  },
  userNicknameText: {
    marginLeft: 12,
  },

  userRatingContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayscale_800,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRatingText: {
    color: COLORS.grayscale_0,
    marginLeft: 4,
  },

  reviewImageContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  reviewImageScrollContent: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 4,
  },
  reviewImage: {
    height: 100,
    width: 100,
    borderRadius: 4,
  },

  reviewText: {
    marginTop: 10,
  },

  replyContainer: {
    backgroundColor: COLORS.grayscale_0,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  replyTitle: {
    color: COLORS.grayscale_400,
  },
  replyText: {
    color: COLORS.grayscale_800,
    marginTop: 4,
  },

  emptyReviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 88,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    color: COLORS.grayscale_500,
  },
});
