import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Header from '@components/Header';
import notificationApi from '@utils/api/notificationApi';
import {isUserNotification, openNotificationTarget} from '@utils/notifications';
import SettingIcon from '@assets/images/settings_gray.svg';

import NotificationList from './NotificationList';
import styles from './NotificationCenter.styles';

const FILTER_CHIPS = [
  {key: 'all', label: i18n.t('common.all')},
  {key: 'roomReservation', label: i18n.t('common.accommodation_fe9320')},
  {key: 'partyReservation', label: i18n.t('common.activity')},
  {key: 'community', label: i18n.t('common.community')},
];

const extractItems = data =>
  Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];

const formatDate = value => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return i18n.t('notification.justNow');
  }

  if (diffMinutes < 60) {
    return i18n.t('notification.valueMinutesAgo', {diffMinutes: diffMinutes});
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return i18n.t('notification.valueHoursAgo', {diffHours: diffHours});
  }

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const normalizeType = type => {
  const rawType = String(type || '').toUpperCase();

  if (rawType === 'ALL_NOTICE' || rawType === 'ALL_EVENT') {
    return 'notice';
  }

  if (
    rawType.startsWith('PARTY_') ||
    rawType.includes('PARTY') ||
    rawType.includes('MEET')
  ) {
    return 'partyReservation';
  }

  if (rawType.startsWith('COMMUNITY_')) {
    return 'community';
  }

  return 'roomReservation';
};

const normalizeStatus = type => {
  const rawType = String(type || '').toUpperCase();

  if (rawType.includes('CANCELLED') || rawType.includes('REFUND')) {
    return 'cancelled';
  }

  if (rawType.startsWith('COMMUNITY_') || rawType.startsWith('REVIEW_')) {
    return 'confirmed';
  }

  if (rawType.includes('NEW') || rawType.includes('PENDING')) {
    return 'pending';
  }

  return 'confirmed';
};

const buildLines = item => {
  const candidates = [
    item?.content,
    item?.body,
    item?.message,
    item?.description,
    item?.subtitle,
  ].filter(Boolean);

  const first = candidates[0];
  if (!first) {
    return [i18n.t('notification.pleaseCheckTheNotificationDetails')];
  }

  return String(first)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 2);
};

const mapNotificationItem = item => ({
  id: String(item?.id ?? `${Date.now()}-${Math.random()}`),
  notificationId: item?.id ?? null,
  type: normalizeType(item?.type),
  status: normalizeStatus(item?.type),
  title: item?.title || i18n.t('common.newNotifications'),
  lines: buildLines(item),
  date: formatDate(item?.createdAt),
  isRead: Boolean(item?.isRead),
  rawItem: item,
});

const NotificationCenter = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState(FILTER_CHIPS[0].key);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const {data} = await notificationApi.getMyNotifications(0, 100);
      const items = extractItems(data);
      setNotifications(
        items.filter(isUserNotification).map(mapNotificationItem),
      );
    } catch (error) {
      console.warn(
        '[NotificationCenter] failed to fetch notifications:',
        error?.message,
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') {
      return notifications;
    }

    return notifications.filter(item => item.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const handleReadAll = async () => {
    if (markingAllRead) {
      return;
    }

    try {
      setMarkingAllRead(true);
      await notificationApi.readAll();
      setNotifications(prev => prev.map(item => ({...item, isRead: true})));
    } catch (error) {
      console.warn(
        '[NotificationCenter] failed to mark all as read:',
        error?.message,
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handlePressItem = async item => {
    let notificationDetail = null;

    if (item.notificationId) {
      try {
        const {data} = await notificationApi.getDetail(item.notificationId);
        notificationDetail = data;
      } catch (error) {
        console.warn(
          '[NotificationCenter] failed to fetch notification detail:',
          error?.message,
        );
      }
    }

    setNotifications(prev =>
      prev.map(notification =>
        notification.notificationId === item.notificationId
          ? {...notification, isRead: true}
          : notification,
      ),
    );

    await openNotificationTarget(
      {
        ...(item.rawItem ?? {}),
        ...(notificationDetail ?? {}),
      },
      navigation,
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('common.notificationBox')}
        rightComponent={
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={1}
            onPress={() => navigation.navigate('NotificationSettings')}>
            <SettingIcon width={22} height={22} />
          </TouchableOpacity>
        }
      />

      <View style={styles.chipRow}>
        {FILTER_CHIPS.map(chip => {
          const isSelected = chip.key === selectedFilter;

          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={1}
              onPress={() => setSelectedFilter(chip.key)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.chipText,
                  isSelected && styles.chipTextActive,
                ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={1}
          onPress={handleReadAll}>
          <Text style={[FONTS.fs_12_medium, styles.actionButtonText]}>
            {markingAllRead
              ? t('notification.processing')
              : t('notification.readAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={COLORS.grayscale_500} />
        </View>
      ) : (
        <NotificationList
          items={filteredNotifications}
          onPressItem={handlePressItem}
        />
      )}
    </View>
  );
};

export default NotificationCenter;
