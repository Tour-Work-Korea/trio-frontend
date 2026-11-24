import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ChatIcon from '@assets/images/chat_bubbles_orange.svg';
import CommentIcon from '@assets/images/noti_comment.svg';
import GuesthouseCancelledIcon from '@assets/images/noti_guesthouse_cancelled.svg';
import GuesthouseConfirmedIcon from '@assets/images/noti_guesthouse_confirmed.svg';
import NoticeIcon from '@assets/images/notice_bubble_orange.svg';
import PartyCancelledIcon from '@assets/images/noti_party_cancelled.svg';
import PartyConfirmedIcon from '@assets/images/noti_party_confirmed.svg';
import {
  isCompanionNotification,
  companionNotificationValue,
} from '../features/companion/notificationRouting';
import {navigationRef} from '@utils/navigationService';
import {
  openNotificationTarget,
  subscribeForegroundNotification,
} from '@utils/notifications';

const AUTO_HIDE_MS = 4500;

const normalizeType = data => {
  if (isCompanionNotification(data)) {
    return 'companion';
  }
  const rawType = String(data?.type || data?.targetType || '').toUpperCase();

  if (rawType.includes('NOTICE')) {
    return 'notice';
  }

  if (rawType.startsWith('COMMUNITY_')) {
    return 'community';
  }

  if (rawType.includes('PARTY') || rawType.includes('MEET')) {
    return 'partyReservation';
  }

  return 'roomReservation';
};

const normalizeStatus = data => {
  const rawStatus = String(
    data?.status ||
      companionNotificationValue(data, 'type') ||
      data?.eventType ||
      '',
  ).toUpperCase();

  if (rawStatus.includes('CANCEL') || rawStatus.includes('REJECT')) {
    return 'cancelled';
  }

  return 'confirmed';
};

export const mapRemoteMessage = remoteMessage => {
  const data = remoteMessage?.data ?? {};
  const type = normalizeType(data);
  const rawType = String(
    companionNotificationValue(data, 'type') ||
      data.type ||
      data.targetType ||
      '',
  ).toUpperCase();
  const title =
    remoteMessage?.notification?.title ||
    data.title ||
    i18n.t('common.newNotifications');
  const body =
    remoteMessage?.notification?.body ||
    data.body ||
    data.message ||
    i18n.t('notification.pleaseCheckTheNotificationCenterForMoreDetails');

  const lines = String(body)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 2);

  return {
    title,
    lines: lines.length
      ? lines
      : [i18n.t('notification.pleaseCheckTheNotificationCenterForMoreDetails')],
    type,
    rawType,
    status: normalizeStatus(data),
    timestamp:
      data.sentAt || data.createdAt || i18n.t('notification.justArrived'),
  };
};

const BannerMeta = ({type, status}) => {
  const {t} = useTranslation();
  const isNotice = type === 'notice';
  const isCancelled = status === 'cancelled';

  const label =
    type === 'companion'
      ? t('companion.title')
      : isNotice
      ? t('notification.notice')
      : type === 'community'
      ? t('common.community')
      : type === 'partyReservation'
      ? isCancelled
        ? t('common.cancel')
        : t('common.accompany')
      : isCancelled
      ? t('common.cancel')
      : t('common.reservation');

  return (
    <Text style={[FONTS.fs_12_semibold, styles.metaLabel]} numberOfLines={1}>
      {label}
    </Text>
  );
};

const BannerIcon = ({type, rawType, status}) => {
  const isCancelled = status === 'cancelled';
  const Icon =
    type === 'companion'
      ? rawType === 'COMPANION_CHAT_NOTICE'
        ? NoticeIcon
        : ChatIcon
      : type === 'notice'
      ? NoticeIcon
      : type === 'community'
      ? CommentIcon
      : type === 'partyReservation'
      ? isCancelled
        ? PartyCancelledIcon
        : PartyConfirmedIcon
      : isCancelled
      ? GuesthouseCancelledIcon
      : GuesthouseConfirmedIcon;

  return (
    <View style={styles.iconWrap}>
      <Icon
        width={Icon === NoticeIcon ? 20 : 18}
        height={Icon === NoticeIcon ? 20 : 18}
      />
    </View>
  );
};

export default function InAppNotificationBanner() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState(null);
  const translateY = useRef(new Animated.Value(-140)).current;
  const hideTimerRef = useRef(null);
  const topOffset = Math.max(insets.top + 8, 16);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideBanner = useCallback(() => {
    clearHideTimer();
    Animated.timing(translateY, {
      toValue: -140,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setMessage(null);
    });
  }, [clearHideTimer, translateY]);

  useEffect(() => {
    const unsubscribe = subscribeForegroundNotification(remoteMessage => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (
        String(
          companionNotificationValue(remoteMessage?.data, 'type') || '',
        ).toUpperCase() === 'COMPANION_CHAT_MESSAGE' &&
        currentRoute?.name === 'CompanionChat' &&
        String(currentRoute.params?.roomId) ===
          String(companionNotificationValue(remoteMessage.data, 'roomId'))
      ) {
        return;
      }
      clearHideTimer();
      setMessage({
        remoteMessage,
        viewModel: mapRemoteMessage(remoteMessage),
      });

      translateY.setValue(-140);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      hideTimerRef.current = setTimeout(() => {
        hideBanner();
      }, AUTO_HIDE_MS);
    });

    return () => {
      clearHideTimer();
      unsubscribe();
    };
  }, [clearHideTimer, hideBanner, translateY]);

  const content = useMemo(() => message?.viewModel ?? null, [message]);

  if (!content) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.overlay, {top: topOffset, transform: [{translateY}]}]}>
      <Pressable
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${content.title}. ${content.lines.join(' ')}`}
        onPress={() => {
          const remoteMessage = message?.remoteMessage;
          hideBanner();
          requestAnimationFrame(() => {
            openNotificationTarget(remoteMessage?.data || {}).catch(error => {
              console.warn('foreground notification tap failed:', error);
            });
          });
        }}>
        <BannerIcon
          type={content.type}
          rawType={content.rawType}
          status={content.status}
        />

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <BannerMeta type={content.type} status={content.status} />
            <View style={styles.metaDot} />
            <Text style={[FONTS.fs_12_medium, styles.date]} numberOfLines={1}>
              {content.timestamp}
            </Text>
          </View>

          <Text style={[FONTS.fs_16_semibold, styles.title]} numberOfLines={2}>
            {content.title}
          </Text>

          {content.lines.map(line => (
            <Text
              key={`${content.title}-${line}`}
              style={[
                content.type === 'notice'
                  ? FONTS.fs_12_medium
                  : FONTS.fs_14_medium,
                styles.line,
                content.type === 'notice' && styles.noticeLine,
              ]}
              numberOfLines={2}>
              {line}
            </Text>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
  },
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_100,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    minHeight: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  metaLabel: {
    flexShrink: 1,
    color: COLORS.primary_orange,
    lineHeight: 16,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 7,
    backgroundColor: COLORS.grayscale_300,
  },
  title: {
    color: COLORS.grayscale_800,
    lineHeight: 22,
    marginBottom: 3,
  },
  line: {
    color: COLORS.grayscale_600,
    lineHeight: 20,
  },
  noticeLine: {
    color: COLORS.grayscale_600,
    lineHeight: 18,
  },
  date: {
    flexShrink: 1,
    color: COLORS.grayscale_500,
    lineHeight: 16,
  },
});
