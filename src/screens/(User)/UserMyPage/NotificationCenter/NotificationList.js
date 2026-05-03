import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';

import {FONTS} from '@constants/fonts';

import GuesthouseCancelledIcon from '@assets/images/noti_guesthouse_cancelled.svg';
import GuesthouseConfirmedIcon from '@assets/images/noti_guesthouse_confirmed.svg';
import PartyCancelledIcon from '@assets/images/noti_party_cancelled.svg';
import PartyConfirmedIcon from '@assets/images/noti_party_confirmed.svg';

import styles from './NotificationCenter.styles';

const renderLeadingIcon = item => {
  const isCancelled = item.status === 'cancelled';
  const isParty = item.type === 'partyReservation';
  const Icon = isParty
    ? isCancelled
      ? PartyCancelledIcon
      : PartyConfirmedIcon
    : isCancelled
    ? GuesthouseCancelledIcon
    : GuesthouseConfirmedIcon;

  return (
    <View style={styles.iconWrap}>
      <Icon width={24} height={24} />
    </View>
  );
};

const NotificationList = ({items = [], onPressItem}) => {
  if (!items.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={[FONTS.fs_16_medium, styles.emptyText]}>
          받은 알림이 없습니다.
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
