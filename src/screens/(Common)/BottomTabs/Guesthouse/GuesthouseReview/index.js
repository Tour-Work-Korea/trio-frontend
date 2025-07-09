import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

import styles from './GuesthouseReview.styles';
import {FONTS} from '@constants/fonts';
import { COLORS } from '@constants/colors';

import Star from '@assets/images/star_white.svg';
import NoReviewIcon from '@assets/images/wa_orange_noreview.svg';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';

const PAGE_SIZE = 10;
const SORT = 'id';

const GuesthouseReview = ({ guesthouseId, averageRating = 0, totalCount = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

      const newReviews = res.data.content || [];
      setLastPage(res.data.last);

      if (isRefresh || pageToLoad === 0) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setPage(pageToLoad);
    } catch (e) {
      // 오류 처리 (알림 등)
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

  const renderItem = useCallback(
    ({ item, index }) => (
      <View style={styles.reviewContainer}>
        <View style={styles.reviewHeaderContainer}>
          <View style={styles.userProfileContainer}>
            <View style={styles.userImage}>
              {/* 사용자 프로필 이미지 받아오는값 없음 */}
              {item.profileUrl ? (
                <Image
                  source={{ uri: item.profileUrl }}
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
        <View style={styles.reviewImageContainer}>
          {item.imgUrls && item.imgUrls.length > 0 && (
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {item.imgUrls.map((imgUrl, i) => (
                <Image
                  source={require('@assets/images/exphoto.jpeg')}
                  style={styles.reviewImage}
                />
              ))}
            </View>
          )}
        </View>
        <Text style={[FONTS.fs_14_regular, styles.reviewText]}>{item.reviewDetail}</Text>
        {/* 답글이 있으면 표시 */}
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
    ),
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
    </View>
  );
};

export default GuesthouseReview;
