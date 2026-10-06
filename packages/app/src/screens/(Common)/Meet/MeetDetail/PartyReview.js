import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import AppImage from '@components/AppImage';
import Avatar from '@components/Avatar';
import ImageModal from '@components/modals/ImageModal';
import userMeetApi from '@utils/api/userMeetApi';

import Star from '@assets/images/star_white.svg';
import NoReviewIcon from '@assets/images/wa_orange_noreview.svg';

import reviewStyles from '../../BottomTabs/Guesthouse/GuesthouseReview/GuesthouseReview.styles';
import styles from './PartyReview.styles';

const PAGE_SIZE = 10;

const getDisplayRating = rating => {
  const ratingNumber = Number(rating);
  return Number.isFinite(ratingNumber) ? ratingNumber.toFixed(1) : '0.0';
};

const PartyReview = ({templateId, averageRating = 0, totalCount = 0}) => {
  const loadingRef = useRef(false);
  const imageSourceRefs = useRef(new Map());
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalSourceKeys, setModalSourceKeys] = useState([]);
  const [imageSourceRect, setImageSourceRect] = useState(null);

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

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      if (templateId == null || loadingRef.current) {
        if (templateId == null && Number(totalCount) > 0) {
          console.warn(
            '콘텐츠 리뷰 조회에 필요한 templateId가 상세 응답에 없습니다.',
          );
        }
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      try {
        const {data} = await userMeetApi.getPartyReviews({
          templateId,
          page: 0,
          size: Math.max(PAGE_SIZE, Number(totalCount) || 0),
          sort: 'id',
        });
        if (mounted) {
          setReviews(Array.isArray(data?.content) ? data.content : []);
        }
      } catch (error) {
        console.warn(
          '콘텐츠 리뷰 조회 실패',
          error?.response?.data ?? error?.message,
        );
        if (mounted) {
          setReviews([]);
        }
      } finally {
        loadingRef.current = false;
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setReviews([]);
    fetchReviews();

    return () => {
      mounted = false;
      loadingRef.current = false;
    };
  }, [templateId, totalCount]);

  const openImageModal = useCallback(
    (reviewId, images, index) => {
      const sourceKeys = images.map(
        (url, imageIndex) => `party-review:${reviewId}:${url ?? imageIndex}`,
      );
      setModalImages(
        images.map((url, imageIndex) => ({
          id: imageIndex.toString(),
          imageUrl: url,
        })),
      );
      setModalSourceKeys(sourceKeys);
      setModalIndex(index);
      setImageSourceRect(null);
      setImageModalVisible(true);
      requestAnimationFrame(() => measureImageSource(sourceKeys[index], index));
    },
    [measureImageSource],
  );

  return (
    <View>
      <View style={styles.header}>
        <Text style={FONTS.fs_18_semibold}>리뷰</Text>
        {Number(totalCount) > 0 && (
          <View style={styles.ratingBadge}>
            <Star width={14} height={14} />
            <Text style={[FONTS.fs_12_medium, styles.rating]}>
              {getDisplayRating(averageRating)}
            </Text>
            <Text style={styles.divider}>·</Text>
            <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
              {totalCount} 리뷰
            </Text>
          </View>
        )}
      </View>

      {reviews.map((review, index) => {
        const images = Array.isArray(review.imageUrls)
          ? review.imageUrls
          : [];
        return (
          <View
            key={String(review.reviewId ?? index)}
            style={reviewStyles.reviewContainer}>
            <View style={reviewStyles.reviewHeaderContainer}>
              <View style={reviewStyles.userProfileContainer}>
                <Avatar
                  uri={review.reviewerProfileImageUrl}
                  size={44}
                  iconSize={18}
                  style={reviewStyles.userImage}
                />
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    reviewStyles.userNicknameText,
                  ]}>
                  {review.nickname}
                </Text>
              </View>
              <View style={reviewStyles.userRatingContainer}>
                <Star width={14} height={14} />
                <Text
                  style={[
                    FONTS.fs_14_semibold,
                    reviewStyles.userRatingText,
                  ]}>
                  {getDisplayRating(review.reviewRating)}
                </Text>
              </View>
            </View>

            {images.length > 0 && (
              <View style={reviewStyles.reviewImageContainer}>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  directionalLockEnabled
                  showsHorizontalScrollIndicator={false}
                  onStartShouldSetResponderCapture={() => true}
                  onMoveShouldSetResponderCapture={() => true}
                  contentContainerStyle={styles.imageRow}>
                  {images.map((imageUrl, imageIndex) => {
                    const sourceKey = `party-review:${
                      review.reviewId
                    }:${imageUrl ?? imageIndex}`;
                    return (
                      <TouchableOpacity
                        ref={node => {
                          if (node) {
                            imageSourceRefs.current.set(sourceKey, node);
                          } else {
                            imageSourceRefs.current.delete(sourceKey);
                          }
                        }}
                        activeOpacity={1}
                        key={sourceKey}
                        onPress={() =>
                          openImageModal(
                            review.reviewId,
                            images,
                            imageIndex,
                          )
                        }>
                        <AppImage
                          uri={imageUrl}
                          style={[
                            reviewStyles.reviewImage,
                            imageModalVisible &&
                              modalSourceKeys[modalIndex] === sourceKey &&
                              styles.hiddenImage,
                          ]}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text style={[FONTS.fs_14_regular, reviewStyles.reviewText]}>
              {review.reviewDetail}
            </Text>
          </View>
        );
      })}

      {loading && <ActivityIndicator />}
      {!loading && templateId == null && Number(totalCount) > 0 && (
        <View style={reviewStyles.emptyReviewContainer}>
          <Text style={[FONTS.fs_14_medium, reviewStyles.emptyText]}>
            리뷰 정보를 불러오지 못했어요.{'\n'}
            잠시 후 다시 시도해주세요.
          </Text>
        </View>
      )}
      {!loading &&
        !(templateId == null && Number(totalCount) > 0) &&
        reviews.length === 0 && (
        <View style={reviewStyles.emptyReviewContainer}>
          <NoReviewIcon />
          <Text style={[FONTS.fs_14_medium, reviewStyles.emptyText]}>
            아직 등록된 리뷰가 없어요.{'\n'}
            당신의 첫 리뷰를 남겨주세요!
          </Text>
        </View>
        )}

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

export default PartyReview;
