import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';

import styles from './GuesthouseReview.styles';
import {FONTS} from '@constants/fonts';
import { COLORS } from '@constants/colors';

import Star from '@assets/images/star_white.svg';
import NoReviewIcon from '@assets/images/wa_orange_noreview.svg';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import ImageModal from '@components/modals/ImageModal';

const PAGE_SIZE = 10;
const SORT = 'id';

const GuesthouseReview = ({ guesthouseId, averageRating = 0, totalCount = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);

  // guesthouseId, 컴포넌트 mount 될 때마다 state 초기화 & 첫 fetch
  useEffect(() => {
    // 모든 상태를 0/초기값으로 리셋
    setReviews([]);
    setPage(0);
    setLastPage(false);
    setLoading(false);
    setRefreshing(false);
    // 무조건 첫 페이지부터 다시 가져오기
    if (!lastPage) {
      fetchReviews(0, true);
    }
  }, [guesthouseId]);

  // 첫 로드 or 새로고침
  const fetchReviews = async (pageToLoad = 0, isRefresh = false) => {
    if (loading || lastPage) return;
    setLoading(true);

    try {
      const res = await userGuesthouseApi.getGuesthouseReviews({
        guesthouseId,
        page: pageToLoad,
        size: PAGE_SIZE,
        sort: SORT,
      });

      const newReviews = (res.data.content || []).filter(r => r.isJobReview === false);
      setLastPage(res.data.last);

      if (isRefresh || pageToLoad === 0) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setPage(pageToLoad);
    } catch (e) {
      setLastPage(true);
      if (pageToLoad === 0) {
      setReviews([]);
    }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 무한스크롤 핸들러
  const handleEndReached = () => {
    if (!loading && !lastPage) {
      fetchReviews(page + 1);
    }
  };

  // 새로고침 핸들러
  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews(0, true);
  };

  // 이미지 모달
  const openImageModal = (images, index) => {
    setModalImages(images.map((url, i) => ({ id: i.toString(), imageUrl: url })));
    setModalIndex(index);
    setImageModalVisible(true);
  };

  const renderItem = useCallback(
    ({ item, index }) => {
      const hasImages = item.imgUrls && item.imgUrls.length > 0;

      return (
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeaderContainer}>
            <View style={styles.userProfileContainer}>
              <View style={styles.userImage}>
                {item.userImgUrl ? (
                  <Image
                    source={{ uri: item.userImgUrl }}
                    style={[styles.userImage, { position: 'absolute' }]}
                  />
                ) : null}
              </View>
              <Text style={[FONTS.fs_14_medium, styles.userNicknameText]}>{item.nickname}</Text>
            </View>
            <View style={styles.userRatingContainer}>
              <Star width={14} height={14} />
              <Text style={[FONTS.fs_14_semibold, styles.userRatingText]}>{item.reviewRating}</Text>
            </View>
          </View>

          {/* 리뷰 이미지 */}
          {hasImages && (
            <View style={styles.reviewImageContainer}>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                {item.imgUrls.map((imgUrl, i) => (
                  <TouchableOpacity key={i} onPress={() => openImageModal(item.imgUrls, i)}>
                    <Image source={{ uri: imgUrl }} style={styles.reviewImage} />
                  </TouchableOpacity>
                ))}
              </View>
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
    []
  );

  return (
    <View style={styles.reviewRowContainer}>
      <FlatList
        data={reviews}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
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
          title="리뷰 사진"
          images={modalImages}
          selectedImageIndex={modalIndex}
          onClose={() => setImageModalVisible(false)}
        />
      )}
    </View>
  );
};

export default GuesthouseReview;
