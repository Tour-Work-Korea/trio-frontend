import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {COLORS as C} from '@constants/colors';
import CalendarIcon from '@assets/images/calendar_400gray.svg';
import PeopleIcon from '@assets/images/people_gray.svg';
import {countText, schedule} from './model';
import {ChatSchedule} from './participantChatUi';
import {Action, Txt, styles as s} from './ui';

export function OrganizerRequestCard({item, person, busy, onAccept, onReject}) {
  const {t} = useTranslation();
  if (!person || !['PENDING', 'REJECTED', 'ACCEPTED'].includes(person.status)) {
    return null;
  }
  const rejected = person.status === 'REJECTED';
  const pending = person.status === 'PENDING';
  return (
    <View
      style={{
        backgroundColor: C.secondary_blue,
        borderRadius: 14,
        padding: 16,
        gap: 12,
      }}>
      <Txt style={[s.blue, {fontWeight: '600'}]}>
        {pending
          ? t('companion.chat.organizerRequest', {
              name:
                person.userName || t('companion.memberId', {id: person.userId}),
            })
          : t(
              rejected
                ? 'companion.rejectedOrganizerTitle'
                : 'companion.acceptedOrganizerTitle',
            )}
      </Txt>
      {pending ? (
        <View style={{gap: 2}}>
          <ChatSchedule item={item} includePlace={false} />
          <Txt style={s.small}>
            {countText(
              t,
              'companion.chat.confirmedNow',
              item.confirmedCount + 1,
            )}
          </Txt>
        </View>
      ) : (
        <Txt style={s.small}>
          {t(
            rejected
              ? 'companion.rejectedOrganizerBody'
              : 'companion.acceptedBody',
          )}
        </Txt>
      )}
      {pending && item.status === 'OPEN' && (
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{disabled: busy}}
            disabled={busy}
            onPress={onReject}
            style={{
              flex: 1,
              backgroundColor: C.grayscale_0,
              borderRadius: 6,
              minHeight: 40,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              opacity: busy ? 0.5 : 1,
            }}>
            <Txt>{t('companion.reject')}</Txt>
          </TouchableOpacity>
          <Action
            style={{flex: 2}}
            label={t('companion.accept')}
            disabled={busy}
            onPress={onAccept}
          />
        </View>
      )}
      {!pending && (
        <View style={{gap: 8}}>
          <View style={s.row}>
            <CalendarIcon width={16} height={16} />
            <Txt style={[s.small, {width: 52}]}>{t('common.date')}</Txt>
            <Txt style={[s.small, s.grow, {color: C.grayscale_800}]}>
              {schedule(item, t)}
            </Txt>
          </View>
          <View style={s.row}>
            <PeopleIcon width={16} height={16} />
            <Txt style={[s.small, {width: 52}]}>
              {t('companion.totalLabel')}
            </Txt>
            <Txt style={[s.small, s.grow, {color: C.grayscale_800}]}>
              {countText(t, 'companion.people', item.confirmedCount + 1)}
            </Txt>
          </View>
        </View>
      )}
    </View>
  );
}
