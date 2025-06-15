import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

import styles from './GuesthouseReview.styles';
import {FONTS} from '@constants/fonts';
import { COLORS } from '@constants/colors';

import Star from '@assets/images/star_white.svg';

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
      <View style={{ marginBottom: 24 }}>
        {/* 프로필, 닉네임, 별점 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
          />
          <View>
            <Text style={FONTS.fs_body_bold}>{item.nickname}</Text>
            <View style={{ flexDirection: 'row', marginTop: 2 }}>
              {Array(item.reviewRating)
                .fill()
                .map((_, i) => (
                  <YellowStar key={i} width={16} height={16} />
                ))}
            </View>
          </View>
        </View>
        {item.imgUrls && item.imgUrls.length > 0 && (
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            {item.imgUrls.map((imgUrl, i) => (
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={{ width: 48, height: 48, borderRadius: 6, marginRight: 4 }}
              />
            ))}
          </View>
        )}
        {/* 리뷰 내용 */}
        <Text style={FONTS.fs_body}>{item.reviewDetail}</Text>
        {/* 답글이 있으면 표시 */}
        {item.replies && item.replies.length > 0 && (
          <View style={{ backgroundColor: '#F6F6F6', marginTop: 10, borderRadius: 6, padding: 8 }}>
            {item.replies.map((reply, ri) => (
              <Text key={ri} style={[FONTS.fs_body, { color: '#888' }]}>
                답글: {reply}
              </Text>
            ))}
          </View>
        )}
        {/* 구분선 */}
        <View style={{ height: 1, backgroundColor: '#EEE', marginTop: 16 }} />
      </View>
    ),
    []
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}>
      {/* 리뷰 수 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Star width={20} height={20} />
        <Text style={[FONTS.fs_h2_bold, { marginLeft: 6 }]}>
          {averageRating ? averageRating.toFixed(1) : '0.0'}
        </Text>
        <Text style={[FONTS.fs_h2, { marginLeft: 12 }]}>
          {totalCount}개 리뷰
        </Text>
      </View>
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
          !loading && <Text style={{ textAlign: 'center', color: '#888' }}>아직 등록된 리뷰가 없습니다.</Text>
        }
      />
    </View>
  );
};

export default GuesthouseReview;
