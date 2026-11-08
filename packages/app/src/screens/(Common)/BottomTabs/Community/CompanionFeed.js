import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AdaptiveText from '@components/AdaptiveText';
import AppImage from '@components/AppImage';
import Avatar from '@components/Avatar';
import {COLORS as C} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {
  SkeletonBlock,
  SkeletonPulse,
} from '@screens/_components/ContentSkeleton';
import Calendar from '@assets/images/calendar_fill_orange.svg';
import Pin from '@assets/images/map_pin_fill_orange.svg';
import CompanionPostActions from '../../../../features/companion/CompanionPostActions';
import {loadCompanionFeedPage} from '../../../../features/companion/communityFeed';
import {kstDate} from '../../../../features/companion/model';
import {postSchedule} from '../../../../features/companion/communityPost';
import {formatDate, formatNumber} from '@utils/localeFormat';
import {trimJejuPrefix} from '@utils/formatAddress';

const postTime = (value, t) => {
  if (!value) {return '';}
  const date = kstDate(value);
  if (!Number.isFinite(+date)) {return '';}
  const minutes = Math.max(0, Math.floor((Date.now() - +date) / 60000));
  if (minutes < 1) {return t('common.justNow');}
  if (minutes < 60)
    {return t('community.feed.minutesShort', {value: formatNumber(minutes)});}
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    {return t('community.feed.hoursShort', {value: formatNumber(hours)});}
  const days = Math.floor(hours / 24);
  if (days < 7)
    {return t('community.feed.daysShort', {value: formatNumber(days)});}
  return formatDate(date, {
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  });
};

const locationLabel = (item, t) => {
  const region = t(`companion.region.${item.regionCode}`, {
    defaultValue: item.regionCode || '',
  });
  const place = trimJejuPrefix(item.meetingPlace || '').trim();
  return place ? t('companion.locationValue', {region, place}) : region;
};

export const FeedProfile = React.memo(function FeedProfile({uri}) {
  const {t} = useTranslation();
  const imageUri =
    typeof uri === 'string' && uri.trim() && uri !== t('common.pleaseAddAPhoto')
      ? uri
      : null;
  // Track completion by URL so cached images cannot leave the skeleton visible.
  const [settledUri, setSettledUri] = useState(null);
  const [failedUri, setFailedUri] = useState(null);
  const loading = Boolean(imageUri) && settledUri !== imageUri;
  if (!imageUri || failedUri === imageUri) {
    return <Avatar size={30} iconSize={16} style={s.avatar} />;
  }
  return (
    <View style={s.avatar}>
      <AppImage
        key={imageUri}
        uri={imageUri}
        style={[s.image, loading && {opacity: 0}]}
        onLoad={() => setSettledUri(imageUri)}
        onLoadEnd={() => setSettledUri(imageUri)}
        onError={() => {
          setSettledUri(imageUri);
          setFailedUri(imageUri);
        }}
      />
      {loading && (
        <SkeletonPulse decorative style={s.cover}>
          <SkeletonBlock style={{width: 30, height: 30, borderRadius: 15}} />
        </SkeletonPulse>
      )}
    </View>
  );
});

export default function CompanionFeed({
  preview = false,
  region = 'ALL',
  sort = 'LATEST',
}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const previewWidth = Math.max(240, Math.min(width * 0.75, 336));
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const busy = useRef(true);
  const currentPage = useRef(page);
  currentPage.current = page;
  const firstPageIds = useRef(new Set());
  const hasFocused = useRef(false);
  useEffect(() => {
    let current = true;
    busy.current = true;
    setLoading(true);
    setError(false);
    loadCompanionFeedPage(page, () => current)
      .then(result => {
        if (!current) {return;}
        if (page === 0)
          {firstPageIds.current = new Set(
            result.content.map(item => item.companionId),
          );}
        setItems(previous =>
          page === 0
            ? result.content
            : [
                ...new Map(
                  [...previous, ...result.content].map(item => [
                    item.companionId,
                    item,
                  ]),
                ).values(),
              ],
        );
        setLast(result.last);
      })
      .catch(() => {
        if (current) {setError(true);}
      })
      .finally(() => {
        if (current) {
          setLoading(false);
          busy.current = false;
        }
      });
    return () => {
      current = false;
    };
  }, [page, revision]);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      if (busy.current) {return;}
      let current = true;
      busy.current = true;
      setLoading(true);
      loadCompanionFeedPage(0, () => current)
        .then(result => {
          if (!current) {return;}
          const previousFirstPage = firstPageIds.current;
          firstPageIds.current = new Set(
            result.content.map(item => item.companionId),
          );
          setItems(previous => [
            ...new Map(
              [
                ...previous.filter(
                  item => !previousFirstPage.has(item.companionId),
                ),
                ...result.content,
              ].map(item => [item.companionId, item]),
            ).values(),
          ]);
          setError(false);
          if (currentPage.current === 0) {setLast(result.last);}
        })
        .catch(() => {
          if (current) {setError(true);}
        })
        .finally(() => {
          if (current) {
            busy.current = false;
            setLoading(false);
          }
        });
      return () => {
        current = false;
        busy.current = false;
      };
    }, []),
  );
  const data = items
    .filter(
      item =>
        region === 'ALL' ||
        item.regionCode === region ||
        item.regionCode?.startsWith(`${region}_`),
    )
    .sort((a, b) => {
      const difference = String(b.post.createdAt || '').localeCompare(
        String(a.post.createdAt || ''),
      );
      return sort === 'OLDEST' ? -difference : difference;
    });
  const more = () => {
    if (!busy.current && !last && !error) {
      busy.current = true;
      setPage(value => value + 1);
    }
  };
  // Fill region-filtered previews, and read all pages for global oldest order.
  useEffect(() => {
    if (!loading && !last && !error && !busy.current && (sort === 'OLDEST' || data.length < (preview ? 5 : 1))) {
      busy.current = true;
      setPage(value => value + 1);
    }
  }, [loading, last, error, data.length, preview, sort]);
  const card = item => (
    <TouchableOpacity
      key={item.companionId}
      activeOpacity={0.8}
      style={[s.card, preview && {width: previewWidth}]}
      onPress={() =>
        navigation.navigate('CompanionDetail', {companionId: item.companionId})
      }>
      <View style={s.row}>
        <FeedProfile uri={item.post.author?.profileImageUrl} />
        <AdaptiveText style={[FONTS.fs_12_medium, s.name]} numberOfLines={1}>
          {item.post.author?.nickname}
        </AdaptiveText>
        <AdaptiveText style={[s.muted, s.time]}>
          {postTime(item.post.createdAt, t)}
        </AdaptiveText>
      </View>
      <AdaptiveText
        style={[FONTS.fs_16_medium, s.title]}
        numberOfLines={2}
        ellipsizeMode="tail"
        lineBreakStrategyIOS="standard">
        {item.title}
      </AdaptiveText>
      <View style={s.meta}>
        <View style={s.row}>
          <Calendar width={16} height={16} />
          <AdaptiveText style={s.metaText}>
            {postSchedule(item, t)}
          </AdaptiveText>
        </View>
        <View style={s.row}>
          <Pin width={16} height={16} />
          <AdaptiveText style={s.metaText} numberOfLines={1}>
            {locationLabel(item, t)}
          </AdaptiveText>
        </View>
      </View>
      <View style={s.tags}>
        <View style={s.tag}>
          <AdaptiveText style={s.tagText}>
            {t(`companion.activity.${item.activityType}`, {
              defaultValue: item.activityType || '',
            })}
          </AdaptiveText>
        </View>
        {item.status !== 'OPEN' && (
          <AdaptiveText style={s.muted}>
            {t(`companion.status.${item.status}`)}
          </AdaptiveText>
        )}
      </View>
      <View style={[s.row, s.footer]}>
        <AdaptiveText style={[s.muted, {flex: 1}]}>
          {t('community.feed.capacity', {count: Number(item.capacity) || 0})}
        </AdaptiveText>
        <CompanionPostActions item={item} />
      </View>
    </TouchableOpacity>
  );
  const placeholder = (
    <SkeletonPulse>
      <View style={[s.card, preview && {width: previewWidth}]}>
        <View style={s.row}>
          <SkeletonBlock style={s.avatar} />
          <SkeletonBlock style={{width: 100, height: 12}} />
        </View>
        <SkeletonBlock style={{height: 22, marginVertical: 10}} />
        <SkeletonBlock style={{height: 60, borderRadius: 10}} />
        <SkeletonBlock style={{height: 22, width: 100, marginVertical: 10}} />
        <SkeletonBlock style={{height: 16}} />
      </View>
    </SkeletonPulse>
  );
  const empty = (
    <View style={s.empty}>
      <AdaptiveText style={s.muted}>
        {t(error ? 'community.feed.loadError' : 'companion.listEmpty')}
      </AdaptiveText>
      {error && (
        <TouchableOpacity onPress={() => setRevision(value => value + 1)}>
          <AdaptiveText style={s.tagText}>
            {t('community.tryAgain')}
          </AdaptiveText>
        </TouchableOpacity>
      )}
    </View>
  );
  if (preview)
    {return (
      <View>
        {loading && !items.length ? (
          placeholder
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.horizontal}>
            {data.slice(0, 5).map(card)}
            {!data.length && !loading && empty}
            {loading && items.length > 0 && data.length < 5 && placeholder}
            {error && data.length > 0 && empty}
          </ScrollView>
        )}
      </View>
    );}
  return (
    <FlatList
      data={data}
      renderItem={({item}) => card(item)}
      keyExtractor={item => String(item.companionId)}
      contentContainerStyle={s.list}
      onEndReached={more}
      onEndReachedThreshold={0.4}
      refreshing={loading && items.length > 0 && page === 0}
      onRefresh={() => {
        setPage(0);
        setRevision(value => value + 1);
      }}
      ListEmptyComponent={loading ? placeholder : empty}
      ListFooterComponent={
        loading && items.length
          ? placeholder
          : error && items.length
          ? empty
          : null
      }
    />
  );
}
const s = StyleSheet.create({
  horizontal: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  list: {paddingHorizontal: 20, paddingBottom: 96, gap: 16},
  card: {
    padding: 14,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: C.grayscale_200,
    borderRadius: 18,
    backgroundColor: C.grayscale_0,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 6},
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: C.grayscale_100,
  },
  image: {width: '100%', height: '100%'},
  cover: {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0},
  name: {flexShrink: 1, color: C.grayscale_900},
  time: {fontSize: 10},
  muted: {...FONTS.fs_14_regular, fontSize: 12, color: C.grayscale_400},
  title: {color: C.grayscale_900, marginVertical: 10, lineHeight: 22},
  meta: {
    backgroundColor: C.grayscale_100,
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  metaText: {
    ...FONTS.fs_14_regular,
    fontSize: 12,
    color: C.grayscale_700,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 10,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: C.secondary_orange,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  tagText: {...FONTS.fs_12_medium, color: C.primary_orange},
  footer: {borderTopWidth: 1, borderColor: C.grayscale_100, paddingTop: 10},
  empty: {padding: 24, gap: 12},
});
