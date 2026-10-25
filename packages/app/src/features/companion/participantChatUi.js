import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {COLORS as C} from '@constants/colors';
import CloseIcon from '@assets/images/x_gray.svg';
import CalendarIcon from '@assets/images/calendar_400gray.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';
import {countText, schedule} from './model';
import {Txt, styles as s} from './ui';

export function ChatSchedule({item, includePlace = true}) {
  const {t} = useTranslation();
  const region = t(`companion.region.${item.regionCode}`, {
    defaultValue: item.regionCode || '',
  });
  const place = includePlace ? trimJejuPrefix(item.meetingPlace || '') : '';
  return (
    <Txt style={[s.small, {fontSize: 11, lineHeight: 17}]}>
      {t('companion.chat.schedule', {
        dates: schedule(item, t),
        location: place
          ? t('companion.locationValue', {region, place})
          : region,
      })}
    </Txt>
  );
}
export function ChatRecruitmentSummary({item, onPress}) {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: C.grayscale_100,
        borderRadius: 14,
        padding: 12,
        gap: 6,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}>
        <View
          style={{
            backgroundColor: C.secondary_blue,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 16,
          }}>
          <Txt style={[s.small, s.blue]}>
            {t(`companion.status.${item.status}`)}
          </Txt>
        </View>
        {item.status === 'OPEN' && (
          <Txt style={s.small}>
            {countText(
              t,
              'companion.chat.remaining',
              Math.max(0, item.capacity - item.confirmedCount),
            )}
          </Txt>
        )}
      </View>
      <Txt style={{fontWeight: '600'}}>{item.title}</Txt>
      <ChatSchedule item={item} />
    </TouchableOpacity>
  );
}
export function ParticipantRequestCard({item, busy, onWithdraw, onFind}) {
  const {t} = useTranslation();
  if (item.myParticipationStatus === 'PENDING') {
    return (
      <View
        style={{
          backgroundColor: C.secondary_blue,
          borderRadius: 14,
          padding: 16,
          gap: 12,
        }}>
        <Txt style={[s.blue, {fontWeight: '600'}]}>
          {t('companion.chat.requestSent')}
        </Txt>
        <Txt style={s.small}>{t('companion.chat.waitingBody')}</Txt>
        <ChatSchedule item={item} includePlace={false} />
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busy}
          onPress={onWithdraw}
          style={{
            backgroundColor: C.grayscale_0,
            borderRadius: 6,
            padding: 10,
            alignItems: 'center',
            opacity: busy ? 0.5 : 1,
          }}>
          <Txt>{t('companion.withdraw')}</Txt>
        </TouchableOpacity>
      </View>
    );
  }
  if (item.myParticipationStatus !== 'REJECTED') {
    return null;
  }
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: C.grayscale_200,
        borderRadius: 16,
        padding: 16,
        gap: 12,
      }}>
      <View style={s.row}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: C.grayscale_100,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CloseIcon width={16} height={16} />
        </View>
        <Txt style={[s.grow, {fontSize: 13}]}>
          {t('companion.chat.rejectedHeading')}
        </Txt>
        <Txt
          style={[
            s.small,
            {
              backgroundColor: C.grayscale_100,
              paddingHorizontal: 6,
              borderRadius: 4,
              fontSize: 10,
            },
          ]}>
          {t('companion.chat.rejectedBadge')}
        </Txt>
      </View>
      <View style={s.divider} />
      <Txt style={{fontSize: 12, lineHeight: 19}}>
        {t('companion.chat.rejectedDescription')}
      </Txt>
      <View
        style={[
          s.row,
          {backgroundColor: C.grayscale_100, borderRadius: 12, padding: 10},
        ]}>
        <CalendarIcon width={16} height={16} />
        <View style={s.grow}>
          <ChatSchedule item={item} />
        </View>
      </View>
      <View style={s.divider} />
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onFind}
        style={{
          backgroundColor: C.grayscale_100,
          borderRadius: 12,
          padding: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}>
        <Txt style={s.small}>{t('companion.chat.findOthers')}</Txt>
        <ChevronRight width={14} height={14} />
      </TouchableOpacity>
    </View>
  );
}
