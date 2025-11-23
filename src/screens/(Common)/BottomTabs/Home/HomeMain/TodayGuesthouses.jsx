import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

// 더미 fetch
import {mockFetchIntroPage} from './dummyIntroList';

// 좋아요 토글 유틸
import {toggleFavorite} from '@utils/toggleFavorite';

// 하트 아이콘
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import {useNavigation} from '@react-navigation/native';

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
      if (loading) return;
      if (!hasNext && !isRefresh) return;

      setLoading(true);
      try {
        const data = await mockFetchIntroPage({
          page: nextPage,
          size: PAGE_SIZE,
        });

        setHasNext(!data.last);
        setPage(nextPage);

        setItems(prev =>
          isRefresh ? data.content : [...prev, ...data.content],
        );
      } catch (e) {
        console.warn('today intros fetch fail', e);
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [loading, hasNext],
  );

  useEffect(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasNext(true);
    fetchPage(0, true);
  }, [fetchPage]);

  const onEndReached = useCallback(() => {
    if (loading || !hasNext) return;
    fetchPage(page + 1);
  }, [fetchPage, page, loading, hasNext]);

  const keyExtractor = useCallback(item => String(item.introId), []);

  const handleToggleFavorite = useCallback(async item => {
    try {
      await toggleFavorite({
        type: 'post',
        id: item.introId,
        isLiked: item.isLiked,
        setList: setItems,
      });
    } catch (e) {
      console.warn('intro favorite toggle fail', e);
    }
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
              guesthouseId: item.guesthouseId, // ✅ items 말고 item!
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

            {/* 게하이름 + 좋아요(고정) */}
            <View style={styles.bottomRow}>
              <Text
                style={styles.cardGhName}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.guesthouseName}
              </Text>

              <View style={styles.likeBox}>
                {/* ✅ 하트 누르면 부모 클릭 막기 */}
                <Pressable
                  onPress={e => {
                    e.stopPropagation(); // ✅ 부모 onPress 전파 차단
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
    if (!loading) return <View style={{height: 24}} />;
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>불러오는 중...</Text>
      </View>
    );
  }, [loading]);

  return (
    <View style={{flex: 1}}>
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
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },

  cardTitle: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_900,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  cardGhName: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
    flex: 1, // ✅ 왼쪽이 남은 공간 다 먹고
    flexShrink: 1, // ✅ 길면 줄어들며 ... 처리
  },

  likeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0, // ✅ 오른쪽은 절대 안 줄어듦
    minWidth: 48, // ✅ 최소 폭 확보해서 안 밀림
    justifyContent: 'flex-end',
  },

  likeCountText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    marginLeft: 2,
  },
});
