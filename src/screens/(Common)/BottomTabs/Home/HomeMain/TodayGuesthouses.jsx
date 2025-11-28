import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, FlatList, Image, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import postApi from '@utils/api/postApi';
import {toggleFavorite} from '@utils/toggleFavorite';

import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import Loading from '@components/Loading';

const PAGE_SIZE = 6;

export default function TodayGuesthouses() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const fetchPage = useCallback(
    async (nextPage, isRefresh = false) => {
      // 이미 로딩 중이면 추가 요청 방지
      if (loading) return;

      setLoading(true);
      try {
        const {data} = await postApi.getIntroListPublic(nextPage, PAGE_SIZE);
        // data: { content, last, empty, ... } 형태 가정

        const noMore =
          data.last === true ||
          data.empty === true ||
          !Array.isArray(data.content) ||
          data.content.length === 0;

        setHasNext(!noMore);
        setPage(nextPage);

        setItems(prev =>
          isRefresh ? data.content ?? [] : [...prev, ...(data.content ?? [])],
        );
      } catch (e) {
        console.warn(
          'today intros fetch fail',
          e?.response?.data || e?.message,
        );
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [loading],
  );

  // 최초 1회 로드
  useEffect(() => {
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(() => {
    // 로딩 중이면 새로고침도 막기
    if (loading) return;
    setRefreshing(true);
    setHasNext(true);
    fetchPage(0, true);
  }, [fetchPage, loading]);

  const onEndReached = useCallback(() => {
    // 더 이상 없거나, 데이터가 아예 없거나, 로딩 중이면 추가 요청 X
    if (loading || !hasNext || items.length === 0) return;
    fetchPage(page + 1);
  }, [fetchPage, page, loading, hasNext, items.length]);

  const keyExtractor = useCallback(item => String(item.introId), []);

  const handleToggleFavorite = useCallback(async item => {
    try {
      await toggleFavorite({
        type: 'post',
        id: item.introId,
        isLiked: item.isLiked,
        setList: setItems,
      });
    } catch (e) {}
  }, []);

  const renderItem = useCallback(
    ({item}) => {
      const isFav = !!item.isLiked;

      return (
        <Pressable
          style={styles.card}
          android_ripple={{color: COLORS.grayscale_100}}
          onPress={() =>
            navigation.navigate('GuesthousePost', {
              guesthouseId: item.guesthouseId,
            })
          }>
          <Image source={{uri: item.thumbnailUrl}} style={styles.thumb} />

          <View style={styles.cardBody}>
            {/* 제목 */}
            <Text
              style={styles.cardTitle}
              numberOfLines={2}
              ellipsizeMode="tail">
              {item.title}
            </Text>

            {/* 게하이름 + 좋아요 */}
            <View style={styles.bottomRow}>
              <Image
                source={{uri: item.hostProfileImageUrl}}
                style={styles.profileThumb}
              />
              <Text
                style={styles.cardGhName}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.guesthouseName}
              </Text>

              <View style={styles.likeBox}>
                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    handleToggleFavorite(item);
                  }}
                  hitSlop={8}
                  style={styles.heartBtn}>
                  {isFav ? (
                    <HeartFilled width={18} height={18} />
                  ) : (
                    <HeartEmpty width={18} height={18} />
                  )}
                </Pressable>

                <Text style={styles.likeCountText}>{item.likeCount}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [handleToggleFavorite, navigation],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>
          제주 곳곳의 감각적인 게스트하우스
        </Text>
      </View>
    ),
    [],
  );

  const ListFooter = useMemo(() => {
    if (loading) {
      return <Loading title="로딩 중..." />;
    }
  }, [loading]);

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.colWrap}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.6}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 6,
    paddingBottom: 30,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 10,
  },
  headerWrap: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  headerTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_900,
  },

  colWrap: {
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.grayscale_200,
    borderRadius: 12,
  },
  profileThumb: {
    width: 30,
    height: 30,
    borderRadius: 100,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },

  cardTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },

  cardGhName: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
    flex: 1,
    flexShrink: 1,
  },

  likeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    justifyContent: 'flex-end',
  },

  likeCountText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    marginLeft: 2,
  },

  footer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
});
