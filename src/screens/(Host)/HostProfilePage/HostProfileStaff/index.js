import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, Image, FlatList, StyleSheet, ActivityIndicator} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useUserStore from '@stores/userStore';
import guesthouseProfileApi from '@utils/api/guesthouseProfileApi';

const FORCE_EMPTY_STAFF = true;
// 임시로 빈 화면 처리

const toPriceText = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  if (amount === 0) return '급여 협의';
  return `${amount.toLocaleString()}원`;
};

const formatDateText = dateTime => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const normalizeRecruitItem = (item, fallbackId) => ({
  id: String(item?.itemId ?? item?.recruitId ?? item?.postId ?? item?.id ?? fallbackId),
  title: item?.title ?? item?.recruitTitle ?? item?.postTitle ?? '제목 없음',
  locationText:
    item?.location ??
    item?.address ??
    item?.recruitAddress ??
    item?.regionType ??
    '',
  createdAtText: formatDateText(
    item?.createdAt ?? item?.postCreatedAt ?? item?.recruitCreatedAt,
  ),
  priceText:
    item?.recruitPayText ??
    item?.priceText ??
    toPriceText(item?.recruitPay ?? item?.price ?? item?.amount),
  imageUrl:
    item?.thumbnailImageUrl ??
    item?.thumbnailImgUrl ??
    item?.thumbnailUrl ??
    item?.recruitImageUrl ??
    item?.imageUrl ??
    null,
});

const HostProfileStaff = ({guesthouseId}) => {
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedHostGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );

  const [recruits, setRecruits] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const fetchPage = useCallback(
    async ({pageToFetch, append}) => {
      if (!selectedGuesthouseId || inFlight.current) return;

      inFlight.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await guesthouseProfileApi.getGuesthouseProfileFeed({
          guesthouseId: selectedGuesthouseId,
          tab: 'POSTS',
          postType: 'RECRUIT',
          page: pageToFetch,
        });

        const payload = res?.data ?? {};
        const content = Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

        const normalized = content.map((item, index) =>
          normalizeRecruitItem(item, `${pageToFetch}-${index}`),
        );
        const last =
          typeof payload?.last === 'boolean' ? payload.last : normalized.length < 10;
        const currentPage = Number(payload?.number);

        setRecruits(prev => (append ? [...prev, ...normalized] : normalized));
        setPage(Number.isFinite(currentPage) ? currentPage : pageToFetch);
        setHasNext(!last);
      } catch (error) {
        if (!append) setRecruits([]);
        setHasNext(false);
      } finally {
        inFlight.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedGuesthouseId],
  );

  useEffect(() => {
    if (FORCE_EMPTY_STAFF) {
      setRecruits([]);
      setPage(0);
      setHasNext(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    setRecruits([]);
    setPage(0);
    setHasNext(true);

    if (!selectedGuesthouseId) return;
    fetchPage({pageToFetch: 0, append: false});
  }, [selectedGuesthouseId, fetchPage]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || !hasNext) return;
    fetchPage({pageToFetch: page + 1, append: true});
  }, [fetchPage, hasNext, loading, loadingMore, page]);

  const renderItem = ({item}) => {
    const subtitle = [item.createdAtText, item.locationText].filter(Boolean).join(' • ');

    return (
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{uri: item.imageUrl}} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]} />
        )}

        <View style={styles.info}>
          <Text style={[FONTS.fs_14_bold, styles.title]} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={[FONTS.fs_12_regular, styles.sub]} numberOfLines={1}>
            {subtitle}
          </Text>

          <Text style={[FONTS.fs_14_bold, styles.price]}>{item.priceText}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={FORCE_EMPTY_STAFF ? [] : recruits}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={COLORS.grayscale_500} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading && !FORCE_EMPTY_STAFF ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="small" color={COLORS.grayscale_500} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
                표시할 스탭 공고가 없습니다.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default HostProfileStaff;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },

  card: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
  },

  thumb: {
    width: 78,
    height: 78,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_100,
  },
  thumbFallback: {
    backgroundColor: COLORS.grayscale_200,
  },

  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  title: {
    color: COLORS.grayscale_900,
  },

  sub: {
    marginTop: 6,
    color: COLORS.grayscale_600,
  },

  price: {
    marginTop: 10,
    color: COLORS.grayscale_900,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
