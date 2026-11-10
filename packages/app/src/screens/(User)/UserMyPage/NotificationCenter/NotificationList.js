import {useTranslation} from 'react-i18next';
import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';

import {FONTS} from '@constants/fonts';

import GuesthouseCancelledIcon from '@assets/images/noti_guesthouse_cancelled.svg';
import GuesthouseConfirmedIcon from '@assets/images/noti_guesthouse_confirmed.svg';
import CommentIcon from '@assets/images/noti_comment.svg';
import ChatIcon from '@assets/images/chat_bubbles_blue.svg';
import ApplicationIcon from '@assets/images/person_orange.svg';
import AcceptedIcon from '@assets/images/chat_bubbles_orange.svg';
import CancelledIcon from '@assets/images/person20_gray.svg';
import NoticeIcon from '@assets/images/notice_bubble_orange.svg';
import SystemIcon from '@assets/images/chat_bubbles_gray400.svg';
import {
  SkeletonPulse,
  SkeletonBlock,
} from '../../../_components/ContentSkeleton';
import PartyCancelledIcon from '@assets/images/noti_party_cancelled.svg';
import PartyConfirmedIcon from '@assets/images/noti_party_confirmed.svg';

import styles from './NotificationCenter.styles';

const companionIcons = {
  COMPANION_APPLICATION_NEW: ApplicationIcon,
  COMPANION_APPLICATION_ACCEPTED: AcceptedIcon,
  COMPANION_APPLICATION_REJECTED: CancelledIcon,
  COMPANION_CLOSED: SystemIcon,
  COMPANION_CANCELLED: CancelledIcon,
  COMPANION_GROUP_READY: ChatIcon,
  COMPANION_CHAT_MESSAGE: ChatIcon,
  COMPANION_CHAT_NOTICE: NoticeIcon,
  COMPANION_CHAT_SYSTEM: SystemIcon,
};

const renderLeadingIcon = item => {
  const isCancelled = item.status === 'cancelled';
  const isParty = item.type === 'partyReservation';
  const isCommunity = item.type === 'community';
  const Icon =
    item.type === 'companion'
      ? companionIcons[String(item.rawItem?.type || '').toUpperCase()] ||
        SystemIcon
      : isCommunity
      ? CommentIcon
      : isParty
      ? isCancelled
        ? PartyCancelledIcon
        : PartyConfirmedIcon
      : isCancelled
      ? GuesthouseCancelledIcon
      : GuesthouseConfirmedIcon;

  return (
    <View style={styles.iconWrap}>
      <Icon
        width={Icon === NoticeIcon ? 29 : 24}
        height={Icon === NoticeIcon ? 29 : 24}
      />
    </View>
  );
};

export function NotificationListSkeleton() {
  const {t} = useTranslation();
  return (
    <SkeletonPulse title={t('companion.loading')} style={styles.listContainer}>
      {[0, 1, 2, 3].map(index => (
        <View key={index} style={styles.notificationItem}>
          <SkeletonBlock
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              marginRight: 16,
              marginTop: 2,
            }}
          />
          <View style={[styles.notificationContent, {gap: 8}]}>
            <SkeletonBlock
              style={{width: '75%', height: 22, borderRadius: 4}}
            />
            <SkeletonBlock
              style={{width: '95%', height: 16, borderRadius: 4}}
            />
            <SkeletonBlock
              style={{width: '65%', height: 16, borderRadius: 4}}
            />
            <SkeletonBlock
              style={{width: 72, height: 12, borderRadius: 4, marginTop: 6}}
            />
          </View>
        </View>
      ))}
    </SkeletonPulse>
  );
}

const NotificationList = ({items = [], onPressItem}) => {
  const {t} = useTranslation();
  if (!items.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={[FONTS.fs_16_medium, styles.emptyText]}>
          {t('notification.noNotificationsReceived')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.listScrollView}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}>
      {items.map(item => (
        <Pressable
          key={item.id}
          style={styles.notificationItem}
          onPress={() => onPressItem?.(item)}>
          {renderLeadingIcon(item)}

          <View style={styles.notificationContent}>
            <Text
              style={[
                FONTS.fs_16_semibold,
                styles.notificationTitle,
                item.isRead && styles.notificationTitleRead,
              ]}>
              {item.title}
            </Text>

            {item.lines.map((line, index) => (
              <Text
                key={`${item.id}-${index}-${line}`}
                style={[
                  FONTS.fs_14_medium,
                  styles.notificationLine,
                  item.type === 'notice' && styles.noticeLine,
                  item.status === 'pending' &&
                    index === item.lines.length - 1 &&
                    styles.pendingActionLine,
                  item.isRead && styles.notificationTextRead,
                ]}>
                {line}
              </Text>
            ))}

            <Text
              style={[
                FONTS.fs_12_medium,
                styles.notificationDate,
                item.isRead && styles.notificationTextRead,
              ]}>
              {item.date}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};

export default NotificationList;
