import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Avatar from '@components/Avatar';
import {COLORS as C} from '@constants/colors';
import {formatNumber} from '@utils/localeFormat';
import {Meta, Status, Title, Txt, styles as s} from './ui';
import {countText} from './model';

export function MyCompanionCard({item, organizer, onPress}) {
  const {t} = useTranslation();
  const pending =
    !organizer &&
    item.status === 'OPEN' &&
    item.myParticipationStatus === 'PENDING';
  return (
    <TouchableOpacity onPress={onPress} style={[s.card, {gap: 16}]}>
      <View style={[s.row, {flexWrap: 'wrap'}]}>
        {pending ? (
          <View style={s.badge}>
            <Txt style={[s.small, s.blue]}>
              {t('companion.participation.PENDING')}
            </Txt>
          </View>
        ) : (
          <Status item={item} />
        )}
        <Txt style={s.small}>
          {t(`companion.activity.${item.activityType}`, {
            defaultValue: item.activityType,
          })}
        </Txt>
      </View>
      <Title>{item.title}</Title>
      <Meta item={{...item, meetingPlace: ''}} />
      <View style={s.divider} />
      <View style={s.row}>
        <Avatar size={26} uri={item.author?.profileImageUrl} />
        <Txt style={[s.small, s.grow]}>
          {item.author?.nickname ||
            item.author?.name ||
            item.author?.userName ||
            t('companion.organizer')}
        </Txt>
        <Txt style={[s.small, s.orange]}>
          {organizer
            ? item.status === 'CLOSED'
              ? countText(
                  t,
                  'companion.myUi.totalConfirmed',
                  Number(item.confirmedCount) + 1,
                )
              : t('companion.myUi.confirmedRatio', {
                  confirmed: formatNumber(item.confirmedCount),
                  capacity: formatNumber(item.capacity),
                })
            : t(`companion.participation.${item.myParticipationStatus}`, {
                defaultValue: '',
              })}
        </Txt>
      </View>
    </TouchableOpacity>
  );
}
