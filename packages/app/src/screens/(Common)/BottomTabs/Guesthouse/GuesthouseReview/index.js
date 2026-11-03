import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native';

import styles from './GuesthouseReview.styles';
import {FONTS} from '@constants/fonts';

import Star from '@assets/images/star_white.svg';
import NoReviewIcon from '@assets/images/wa_orange_noreview.svg';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import ImageModal from '@components/modals/ImageModal';
import Avatar from '@components/Avatar';
import AppImage from '@screens/_components/ContentImage';
import ReviewLoadingSkeleton from './LoadingSkeleton';

const PAGE_SIZE = 10;
const SORT = 'id';

const getDisplayRating = rating => {
  const ratingNumber = Number(rating);
  return Number.isFinite(ratingNumber) ? ratingNumber.toFixed(1) : '0.0';
};

const GuesthouseReview = ({
  guesthouseId,
  averageRating = 0,
  totalCount = 0,
  loadMoreSignal = 0,
}) => {
  const {t} = useTranslation();
  const requestStateRef = useRef(null);
  const reviewSourceIdRef = useRef(guesthouseId);
  const lastLoadMoreSignalRef = useRef(loadMoreSignal);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalSourceKeys, setModalSourceKeys] = useState([]);
  const [imageSourceRect, setImageSourceRect] = useState(null);
  const imageSourceRefs = useRef(new Map());
  const measureImageSource = useCallback((sourceKey, imageIndex) => {
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
        imageIndex,
      });
      return;
    }

    target.measureInWindow?.((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setImageSourceRect({x, y, width, height, imageIndex});
      }
    });
  }, []);

  const fetchReviews = useCallback(async () => {
    const requestState = requestStateRef.current;
    if (
      !requestState ||
      requestState.guesthouseId !== guesthouseId ||
      requestState.loading ||
      !requestState.hasMore
    ) {
      return;
    }

    requestState.loading = true;
    setLoading(true);
    try {
      // A page can contain only staff reviews. Continue until a public guest
      // review is found or the server reports the final page.
      while (requestState.hasMore) {
        const response = await userGuesthouseApi.getGuesthouseReviews({
          guesthouseId,
          page: requestState.nextPage,
          size: PAGE_SIZE,
          sort: SORT,
        });
        if (requestStateRef.current !== requestState) {
          return;
        }

        const page = response.data;
        const content = Array.isArray(page?.content) ? page.content : [];
        const nextReviews = content.filter(
          review => review.isJobReview === false,
        );
        requestState.nextPage += 1;
        requestState.hasMore = page?.last === false && content.length > 0;
        if (nextReviews.length > 0) {
          const replaceReviews = requestState.replaceReviews;
          requestState.replaceReviews = false;
          setReviews(previous => {
            if (replaceReviews) {
              return nextReviews;
            }
            const ids = new Set(previous.map(review => review.id));
            return [
              ...previous,
              ...nextReviews.filter(review => !ids.has(review.id)),
            ];
          });
          break;
        }
        if (!requestState.hasMore && requestState.replaceReviews) {
          setReviews([]);
        }
      }
    } catch (error) {
      // Keep the current cards and retry this page on the next scroll signal.
    } finally {
      if (requestStateRef.current === requestState) {
        requestState.loading = false;
        setLoading(false);
      }
    }
  }, [guesthouseId]);

  useEffect(() => {
    const requestState = {
      guesthouseId,
      nextPage: 0,
      hasMore: true,
      loading: false,
      replaceReviews: true,
    };
    requestStateRef.current = requestState;
    if (reviewSourceIdRef.current !== guesthouseId) {
      setReviews([]);
      reviewSourceIdRef.current = guesthouseId;
    }
    fetchReviews();
    return () => {
      if (requestStateRef.current === requestState) {
        requestStateRef.current = null;
      }
    };
  }, [fetchReviews, guesthouseId, totalCount]);

  useEffect(() => {
    if (lastLoadMoreSignalRef.current === loadMoreSignal) {
      return;
    }
    lastLoadMoreSignalRef.current = loadMoreSignal;
    if (loadMoreSignal > 0) {
      fetchReviews();
    }
  }, [fetchReviews, loadMoreSignal]);

  // 이미지 모달
  const openImageModal = useCallback(
    (reviewId, images, index) => {
      const sourceKeys = images.map(
        (url, imageIndex) => `review:${reviewId}:${url ?? imageIndex}`,
      );
      setModalImages(
        images.map((url, i) => ({id: i.toString(), imageUrl: url})),
      );
      setModalSourceKeys(sourceKeys);
      setModalIndex(index);
      setImageSourceRect(null);
      setImageModalVisible(true);
      requestAnimationFrame(() => measureImageSource(sourceKeys[index], index));
    },
    [measureImageSource],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      const hasImages = item.imgUrls && item.imgUrls.length > 0;
      const displayRating = getDisplayRating(item.reviewRating);

      return (
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeaderContainer}>
            <View style={styles.userProfileContainer}>
              <Avatar
                uri={item.userImgUrl}
                size={44}
                iconSize={18}
                style={styles.userImage}
              />

              <Text style={[FONTS.fs_14_medium, styles.userNicknameText]}>
                {item.nickname}
              </Text>
            </View>
            <View style={styles.userRatingContainer}>
              <Star width={14} height={14} />
              <Text style={[FONTS.fs_14_semibold, styles.userRatingText]}>
                {displayRating}
              </Text>
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
                contentContainerStyle={{
                  flexDirection: 'row',
                  marginBottom: 6,
                  gap: 4,
                }}>
                {item.imgUrls.map((imgUrl, i) => (
                  <TouchableOpacity
                    ref={node => {
                      const sourceKey = `review:${item.id}:${imgUrl ?? i}`;
                      if (node) {
                        imageSourceRefs.current.set(sourceKey, node);
                      } else {
                        imageSourceRefs.current.delete(sourceKey);
                      }
                    }}
                    activeOpacity={1}
                    key={i}
                    onPress={() => openImageModal(item.id, item.imgUrls, i)}>
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

          <Text style={[FONTS.fs_14_regular, styles.reviewText]}>
            {item.reviewDetail}
          </Text>
          {item.replies && item.replies.length > 0 && (
            <View style={styles.replyContainer}>
              <Text style={[FONTS.fs_12_medium, styles.replyTitle]}>
                {t('common.aWordFromTheBoss')}
              </Text>
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
    [imageModalVisible, modalIndex, modalSourceKeys, openImageModal, t],
  );

  return (
    <View style={styles.reviewRowContainer}>
      {reviews.map((item, index) => (
        <React.Fragment key={String(item.id ?? index)}>
          {renderItem({item, index})}
        </React.Fragment>
      ))}
      {loading && (
        <ReviewLoadingSkeleton
          title={t('common.loadingReviews')}
          count={reviews.length > 0 ? 1 : 2}
        />
      )}
      {!loading && reviews.length === 0 && (
        <View style={styles.emptyReviewContainer}>
          <NoReviewIcon />
          <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
            {t('common.thereAreNoReviewsRegisteredYet')}
            {'\n'}
            {t('common.leaveYourFirstReview')}
          </Text>
        </View>
      )}

      {/* 이미지 모달 */}
      {imageModalVisible && (
        <ImageModal
          visible={imageModalVisible}
          images={modalImages}
          selectedImageIndex={modalIndex}
          sourceRect={imageSourceRect}
          sourceBorderRadius={4}
          fallbackDismissMode="fade"
          onImageIndexChange={index => {
            setModalIndex(index);
            measureImageSource(modalSourceKeys[index], index);
          }}
          onClose={() => setImageModalVisible(false)}
        />
      )}
    </View>
  );
};

export default GuesthouseReview;
