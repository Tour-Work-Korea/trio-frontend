import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';

import styles from './GuesthouseReview.styles';
import {FONTS} from '@constants/fonts';

import Star from '@assets/images/star_white.svg';
import NoReviewIcon from '@assets/images/wa_orange_noreview.svg';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import ImageModal from '@components/modals/ImageModal';
import Avatar from '@components/Avatar';
import AppImage from '@components/AppImage';

const PAGE_SIZE = 10;
const SORT = 'id';

const getDisplayRating = rating => {
  const ratingNumber = Number(rating);
  return Number.isFinite(ratingNumber) ? ratingNumber.toFixed(1) : '0.0';
};

const GuesthouseReview = ({ guesthouseId, averageRating = 0, totalCount = 0 }) => {
  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalSourceKeys, setModalSourceKeys] = useState([]);
  const [imageSourceRect, setImageSourceRect] = useState(null);
  const imageSourceRefs = useRef(new Map());
  const measureImageSource = useCallback(sourceKey => {
    const target = imageSourceRefs.current.get(sourceKey);
    if (!target) {
      return;
    }

    if (Platform.OS === 'web' && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      setImageSourceRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
      return;
    }

    target.measureInWindow?.((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setImageSourceRect({x, y, width, height});
      }
    });
  }, []);

  // 첫 로드 or 새로고침
  const fetchReviews = useCallback(
    async (pageToLoad = 0, isRefresh = false) => {
      if (loadingRef.current || (!isRefresh && lastPageRef.current)) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);

      try {
        const res = await userGuesthouseApi.getGuesthouseReviews({
          guesthouseId,
          page: pageToLoad,
          size: PAGE_SIZE,
          sort: SORT,
        });

        const newReviews = (res.data.content || []).filter(
          r => r.isJobReview === false,
        );
        lastPageRef.current = res.data.last;

        if (isRefresh || pageToLoad === 0) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
        setPage(pageToLoad);
      } catch (e) {
        lastPageRef.current = true;
        if (pageToLoad === 0) {
          setReviews([]);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [guesthouseId],
  );

  // guesthouseId, 컴포넌트 mount 될 때마다 state 초기화 & 첫 fetch
  useEffect(() => {
    loadingRef.current = false;
    lastPageRef.current = false;
    hasUserScrolledRef.current = false;
    setReviews([]);
    setPage(0);
    setLoading(false);
    setRefreshing(false);
    fetchReviews(0, true);
  }, [fetchReviews]);

  const handleScrollBeginDrag = useCallback(() => {
    hasUserScrolledRef.current = true;
  }, []);

  // 무한스크롤 핸들러
  const handleEndReached = useCallback(() => {
    if (
      !hasUserScrolledRef.current ||
      loadingRef.current ||
      lastPageRef.current
    ) {
      return;
    }

    fetchReviews(page + 1);
  }, [fetchReviews, page]);

  // 새로고침 핸들러
  const onRefresh = useCallback(() => {
    hasUserScrolledRef.current = false;
    lastPageRef.current = false;
    setRefreshing(true);
    fetchReviews(0, true);
  }, [fetchReviews]);

  // 이미지 모달
  const openImageModal = useCallback(
    (reviewId, images, index) => {
      const sourceKeys = images.map((url, imageIndex) =>
        `review:${reviewId}:${url ?? imageIndex}`,
      );
      setModalImages(
        images.map((url, i) => ({id: i.toString(), imageUrl: url})),
      );
      setModalSourceKeys(sourceKeys);
      setModalIndex(index);
      setImageSourceRect(null);
      setImageModalVisible(true);
      requestAnimationFrame(() => measureImageSource(sourceKeys[index]));
    },
    [measureImageSource],
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const hasImages = item.imgUrls && item.imgUrls.length > 0;
      const displayRating = getDisplayRating(item.reviewRating);

      return (
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeaderContainer}>
            <View style={styles.userProfileContainer}>
              <Avatar uri={item.userImgUrl} size={44} iconSize={18} style={styles.userImage} />
              <Text style={[FONTS.fs_14_medium, styles.userNicknameText]}>{item.nickname}</Text>
            </View>
            <View style={styles.userRatingContainer}>
              <Star width={14} height={14} />
              <Text style={[FONTS.fs_14_semibold, styles.userRatingText]}>{displayRating}</Text>
            </View>
          </View>

          {/* 리뷰 이미지 */}
          {hasImages && (
            <View style={styles.reviewImageContainer}>
              <ScrollView
                horizontal
                nestedScrollEnabled
                directionalLockEnabled
                showsHorizontalScrollIndicator={false}
                onStartShouldSetResponderCapture={() => true}
                onMoveShouldSetResponderCapture={() => true}
                contentContainerStyle={{ flexDirection: 'row', marginBottom: 6, gap: 4 }}
              >
                {item.imgUrls.map((imgUrl, i) => (
                  <TouchableOpacity
                    ref={node => {
                      const sourceKey = `review:${item.id}:${
                        imgUrl ?? i
                      }`;
                      if (node) {
                        imageSourceRefs.current.set(sourceKey, node);
                      } else {
                        imageSourceRefs.current.delete(sourceKey);
                      }
                    }}
                    activeOpacity={1} key={i} onPress={() => openImageModal(item.id, item.imgUrls, i)}>
                    <AppImage
                      uri={imgUrl}
                      style={[
                        styles.reviewImage,
                        imageModalVisible &&
                          modalSourceKeys[modalIndex] ===
                            `review:${item.id}:${imgUrl ?? i}` && {
                            opacity: 0,
                          },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={[FONTS.fs_14_regular, styles.reviewText]}>{item.reviewDetail}</Text>
          {item.replies && item.replies.length > 0 && (
            <View style={styles.replyContainer}>
              <Text style={[FONTS.fs_12_medium, styles.replyTitle]}>사장님의 한마디</Text>
              {item.replies.map((reply, ri) => (
                <Text key={ri} style={[FONTS.fs_14_regular, styles.replyText]}>
                  {reply}
                </Text>
              ))}
            </View>
          )}
        </View>
      );
    },
    [imageModalVisible, modalIndex, modalSourceKeys, openImageModal]
  );

  const keyExtractor = useCallback(item => item.id?.toString(), []);

  return (
    <View style={styles.reviewRowContainer}>
      <FlatList
        data={reviews}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={handleScrollBeginDrag}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading &&
          <View style={styles.emptyReviewContainer}>
            <NoReviewIcon />
            <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
              아직 등록된 리뷰가 없어요.{'\n'}
              당신의 첫 리뷰를 남겨주세요!
            </Text>
          </View>
        }
      />

      {/* 이미지 모달 */}
      {imageModalVisible && (
        <ImageModal
          visible={imageModalVisible}
          images={modalImages}
          selectedImageIndex={modalIndex}
          sourceRect={imageSourceRect}
          sourceBorderRadius={4}
          onImageIndexChange={index => {
            setModalIndex(index);
            measureImageSource(modalSourceKeys[index]);
          }}
          onClose={() => setImageModalVisible(false)}
        />
      )}
    </View>
  );
};

export default GuesthouseReview;
