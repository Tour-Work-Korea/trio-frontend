import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useUserStore from '@stores/userStore';
import guesthouseProfileApi from '@utils/api/guesthouseProfileApi';
import PeopleIcon from '@assets/images/people_gray.svg';

const normalizeFeedItem = (item, fallbackId) => ({
  id: String(item?.itemId ?? item?.partyId ?? item?.postId ?? item?.id ?? fallbackId),
  itemType: item?.itemType ?? 'PARTY',
  title: item?.partyTitle ?? item?.postTitle ?? item?.title ?? '제목 없음',
  dateTimeText:
    item?.partyStartDateTime ??
    item?.postCreatedAt ??
    item?.createdAt ??
    item?.dateTimeText ??
    '',
  imageUrl:
    item?.thumbnailImageUrl ??
    item?.partyImageUrl ??
    item?.thumbnailImgUrl ??
    item?.thumbnailUrl ??
    item?.imageUrl ??
    null,
  maxAttendance: Number(item?.maxAttendance ?? item?.partyMaxAttendance ?? 0),
});

const formatPartyDateText = dateTimeStr => {
  if (!dateTimeStr) return '';

  const date = new Date(dateTimeStr);
  if (Number.isNaN(date.getTime())) return '';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const meridiem = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 || 12;
  const minuteText = String(minute).padStart(2, '0');

  return `${month}/${day}, ${meridiem} ${hour12}:${minuteText}`;
};

const EventCard = ({item}) => {
  const dateText = formatPartyDateText(item.dateTimeText);

  return (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{uri: item.imageUrl}} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]} />
      )}

      <View style={styles.info}>
        <Text style={[FONTS.fs_16_semibold, styles.title]} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.capacityRow}>
          <PeopleIcon width={16} height={16} />
          <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
            최대인원 {item.maxAttendance}명
          </Text>
        </View>

        <Text style={[FONTS.fs_14_medium, styles.dateText]}>{dateText}</Text>
      </View>
    </View>
  );
};

const HostProfileEvents = ({guesthouseId}) => {
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedHostGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );

  const [events, setEvents] = useState([]);
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
          postType: 'PARTY',
          page: pageToFetch,
        });

        const payload = res?.data ?? {};
        const content = Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        const normalized = content.map((item, index) =>
          normalizeFeedItem(item, `${pageToFetch}-${index}`),
        );
        const last =
          typeof payload?.last === 'boolean' ? payload.last : normalized.length < 10;
        const currentPage = Number(payload?.number);

        setEvents(prev => (append ? [...prev, ...normalized] : normalized));
        setPage(Number.isFinite(currentPage) ? currentPage : pageToFetch);
        setHasNext(!last);
      } catch (error) {
        if (!append) setEvents([]);
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
    setEvents([]);
    setPage(0);
    setHasNext(true);

    if (!selectedGuesthouseId) return;
    fetchPage({pageToFetch: 0, append: false});
  }, [selectedGuesthouseId, fetchPage]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMore || !hasNext) return;
    fetchPage({pageToFetch: page + 1, append: true});
  }, [fetchPage, hasNext, loading, loadingMore, page]);

  const partyItems = useMemo(
    () => events.filter(item => item.itemType === 'PARTY'),
    [events],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={partyItems}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <View>
            <EventCard item={item} />
            {index < partyItems.length - 1 ? <View style={styles.separator} /> : null}
          </View>
        )}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text style={[FONTS.fs_14_semibold, styles.sectionTitle]}>게하 파티</Text>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="small" color={COLORS.grayscale_500} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
                표시할 게하 파티가 없습니다.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View>
            {loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={COLORS.grayscale_500} />
              </View>
            ) : null}

            <View style={styles.eventSection}>
              <Text style={[FONTS.fs_14_semibold, styles.sectionTitle, {marginTop: 20}]}>이벤트</Text>
              <View style={styles.emptyWrap}>
                <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
                  표시할 이벤트가 없습니다.
                </Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default HostProfileEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },

  sectionTitle: {
    color: COLORS.grayscale_500,
    marginBottom: 14,
  },

  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  thumb: {
    width: 88,
    height: 88,
    borderRadius: 4,
  },
  thumbFallback: {
    backgroundColor: COLORS.grayscale_200,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: COLORS.grayscale_900,
  },

  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  capacityText: {
    color: COLORS.grayscale_500,
  },
  dateText: {
    marginTop: 'auto',
    color: COLORS.primary_orange,
    alignSelf: 'flex-end',
  },

  separator: {
    height: 14,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
  eventSection: {
    marginTop: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
