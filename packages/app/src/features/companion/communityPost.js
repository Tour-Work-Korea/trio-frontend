import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Avatar from '@components/Avatar';
import AdaptiveText from '@components/AdaptiveText';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';
import {formatDate, formatNumber} from '@utils/localeFormat';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import DetailCalendarIcon from '@assets/images/calendar_400gray.svg';
import LocationIcon from '@assets/images/map_pin_fill_gray.svg';
import PeopleIcon from '@assets/images/people_gray.svg';
import {countText, kstDate} from './model';
import communityStyles from '../../screens/(Common)/BottomTabs/Community/Community.styles';

export const postSchedule = (item, t) => {
  const date = value =>
    formatDate(kstDate(value), {
      timeZone: 'Asia/Seoul',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    })
      .replace(/\.\s+/g, '.')
      .replace(/\.\(/, ' (');
  return item.startDate === item.endDate
    ? date(item.startDate)
    : t('companion.dateRange', {
        start: date(item.startDate),
        end: date(item.endDate),
      });
};
const locationText = (item, t) => {
  const region = t(`companion.region.${item.regionCode}`, {
    defaultValue: item.regionCode || '',
  });
  return item.meetingPlace
    ? t('companion.locationValue', {
        region,
        place: trimJejuPrefix(item.meetingPlace),
      })
    : region;
};
const relativeTime = (value, t) => {
  if (!value) {
    return '';
  }
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - +kstDate(value)) / 60000),
  );
  if (minutes < 1) {
    return t('common.justNow');
  }
  if (minutes < 60) {
    return t('common.valueMinutes', {diffMinutes: formatNumber(minutes)});
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t('common.valueHours', {diffHours: formatNumber(hours)});
  }
  const days = Math.floor(hours / 24);
  return days < 7
    ? t('common.valueDays', {diffDays: formatNumber(days)})
    : formatDate(kstDate(value), {month: '2-digit', day: '2-digit'});
};
export function CompanionPost({item, onPress}) {
  const {t} = useTranslation();
  const closed = item.status !== 'OPEN';
  const post = item.post;
  const muted = closed && styles.closedText;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={communityStyles.postContainer}>
      <View style={communityStyles.postHeader}>
        <Avatar
          uri={post.author?.profileImageUrl}
          size={30}
          iconSize={16}
          style={communityStyles.avatar}
        />
        <AdaptiveText
          style={[FONTS.fs_16_medium, communityStyles.nickname, muted]}>
          {post.author?.nickname}
        </AdaptiveText>
        <AdaptiveText style={[FONTS.fs_14_regular, communityStyles.time]}>
          {relativeTime(post.createdAt, t)}
        </AdaptiveText>
      </View>
      <View style={styles.titleRow}>
        <AdaptiveText
          style={[
            FONTS.fs_16_medium,
            communityStyles.postTitle,
            styles.title,
            muted,
          ]}
          numberOfLines={2}>
          {item.title}
        </AdaptiveText>
        {closed && (
          <View style={styles.closedBadge}>
            <AdaptiveText style={[FONTS.fs_12_regular, styles.closedText]}>
              {t(`companion.status.${item.status}`)}
            </AdaptiveText>
          </View>
        )}
      </View>
      <AdaptiveText
        style={[FONTS.fs_16_regular, communityStyles.postContent, muted]}
        numberOfLines={2}>
        {item.description}
      </AdaptiveText>
      <View style={styles.listMeta}>
        <View style={styles.row}>
          <CalendarIcon width={14} height={14} />
          <AdaptiveText style={[FONTS.fs_12_regular, styles.metaText, muted]}>
            {postSchedule(item, t)}
          </AdaptiveText>
        </View>
        <View style={styles.row}>
          <LocationIcon width={14} height={14} />
          <AdaptiveText style={[FONTS.fs_12_regular, styles.metaText, muted]}>
            {locationText(item, t)}
          </AdaptiveText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
export function CompanionPostInfo({item, children}) {
  const {t} = useTranslation();
  const total =
    Number(item.status === 'CLOSED' ? item.confirmedCount : item.capacity) + 1;
  return (
    <View style={styles.addon}>
      <View style={styles.info}>
        <AdaptiveText style={[FONTS.fs_14_semibold, styles.infoTitle]}>
          {t('companion.info')}
        </AdaptiveText>
        <View style={styles.row}>
          <LocationIcon width={16} height={16} />
          <AdaptiveText style={[FONTS.fs_12_regular, styles.label]}>
            {t('companion.place')}
          </AdaptiveText>
          <AdaptiveText style={[FONTS.fs_14_regular, styles.value]}>
            {locationText(item, t)}
          </AdaptiveText>
        </View>
        <View style={styles.row}>
          <DetailCalendarIcon width={16} height={16} />
          <AdaptiveText style={[FONTS.fs_12_regular, styles.label]}>
            {t('common.date')}
          </AdaptiveText>
          <AdaptiveText style={[FONTS.fs_14_regular, styles.value]}>
            {postSchedule(item, t)}
          </AdaptiveText>
        </View>
        <View style={styles.row}>
          <PeopleIcon width={16} height={16} />
          <AdaptiveText style={[FONTS.fs_12_regular, styles.label]}>
            {t('companion.totalLabel')}
          </AdaptiveText>
          <AdaptiveText
            style={[FONTS.fs_14_regular, styles.value, styles.total]}>
            {countText(t, 'companion.detailTotal', total)}
          </AdaptiveText>
        </View>
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  title: {flexShrink: 1},
  closedText: {color: COLORS.grayscale_400},
  closedBadge: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  listMeta: {gap: 6, marginTop: 12},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  metaText: {color: COLORS.grayscale_500, flex: 1, lineHeight: 18},
  addon: {marginTop: 16, gap: 10},
  info: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  infoTitle: {color: COLORS.grayscale_800, marginBottom: 2},
  label: {color: COLORS.grayscale_500, width: 58},
  value: {color: COLORS.grayscale_800, flex: 1, minWidth: 0, lineHeight: 20},
  total: {color: COLORS.primary_orange},
});
