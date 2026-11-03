import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Avatar from '@components/Avatar';
import {COLORS as C} from '@constants/colors';
import {formatDate, formatNumber} from '@utils/localeFormat';
import {dateKey, displayTime, kstDate} from './model';
import {Txt, styles as s} from './ui';

export function InboxRoom({room, onPress}) {
  const {t} = useTranslation();
  const group = room.roomType === 'COMPANION_GROUP';
  const sentAt = room.lastMessageAt;
  let time = '';
  if (sentAt) {
    const day = dateKey(kstDate(sentAt));
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    time =
      day === dateKey(new Date())
        ? displayTime(sentAt)
        : day === dateKey(yesterday)
        ? t('companion.inbox.yesterday')
        : formatDate(kstDate(sentAt), {
            timeZone: 'Asia/Seoul',
            month: 'numeric',
            day: 'numeric',
          });
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 20,
      }}>
      <View style={{width: 52, height: 52, justifyContent: 'center'}}>
        <Avatar
          size={group ? 36 : 48}
          style={
            group && {
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: C.secondary_blue,
            }
          }
        />
        {group && (
          <Avatar
            size={34}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              backgroundColor: C.secondary_orange,
              borderWidth: 2,
              borderColor: C.grayscale_0,
            }}
          />
        )}
      </View>
      <View style={{flex: 1, minWidth: 0, gap: 6}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          {room.myMemberRole && (
            <View
              style={{
                backgroundColor: C.grayscale_100,
                borderRadius: 3,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}>
              <Txt
                style={{fontSize: 10, lineHeight: 15, color: C.grayscale_500}}>
                {t(
                  room.myMemberRole === 'OWNER'
                    ? 'companion.role.ORGANIZER'
                    : 'companion.role.PARTICIPANT',
                )}
              </Txt>
            </View>
          )}
          <Txt numberOfLines={1} style={{fontWeight: '600', flexShrink: 1}}>
            {room.title}
          </Txt>
          {group && room.activeMemberCount != null && (
            <Txt style={s.small}>{formatNumber(room.activeMemberCount)}</Txt>
          )}
        </View>
        <Txt
          numberOfLines={1}
          style={{fontSize: 13, lineHeight: 20, color: C.grayscale_500}}>
          {room.lastMessagePreview || ''}
        </Txt>
        {!group && !!room.noticePreview && (
          <Txt numberOfLines={1} style={s.small}>
            {room.noticePreview}
          </Txt>
        )}
      </View>
      <View
        style={{
          minWidth: 38,
          alignItems: 'flex-end',
          alignSelf: 'stretch',
          justifyContent: 'space-between',
          paddingVertical: 3,
        }}>
        <Txt style={{fontSize: 11, lineHeight: 17, color: C.grayscale_500}}>
          {time}
        </Txt>
        {room.unreadCount > 0 && (
          <View
            style={{
              minWidth: 24,
              height: 24,
              paddingHorizontal: 6,
              borderRadius: 12,
              backgroundColor: C.primary_orange,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Txt style={{fontSize: 12, lineHeight: 18, color: C.grayscale_0}}>
              {formatNumber(room.unreadCount)}
            </Txt>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
