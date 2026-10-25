import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import AppImage from '@components/AppImage';

import Logo from '@assets/images/meet_reservation_success.svg';

const MeetPaymentSuccess = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {
    thumbnailUrl,
    partyTitle,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
  } = route.params ?? {};

  const formatTime = timeStr => {
    if (!timeStr) return '-';
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };

  const formatDateWithDay = dateStr => {
    if (!dateStr) return '-';
    const date = dayjs(dateStr);
    if (!date.isValid()) return '-';
    return `${date.format('YY.MM.DD')} (${date.format('ddd')})`;
  };

  const eventDateText = formatDateWithDay(partyStartDateTime || partyStartTime);
  const startTimeText = formatTime(partyStartTime);
  const endTimeText = formatTime(partyEndTime);
  const hasTimes = startTimeText !== '-' || endTimeText !== '-';
  const eventTimeText = hasTimes ? `${startTimeText}~${endTimeText}` : '-';
  const eventDateTimeText =
    eventDateText === '-'
      ? eventTimeText
      : eventTimeText === '-'
      ? eventDateText
      : `${eventDateText} ${eventTimeText}`;
  const eventThumbnailSource = thumbnailUrl ? {uri: thumbnailUrl} : null;

  const handleGoHome = () => {
    navigation.navigate('UserMeetReservationCheck', {
      fromPaymentSuccess: true,
    });
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Text style={[FONTS.fs_20_semibold, styles.commentTitle]}>
        {t('meet.applicationAccepted')}
      </Text>
      <Text style={[FONTS.fs_16_medium, styles.text]}>
        {t('meet.afterTheBossConfirmed')}
        <Text style={{color: COLORS.semantic_red}}>
          {t('meet.finalConfirmationNotification')}
        </Text>
        {t('meet.to')}
        {'\n'}
        {t('meet.iMPlanningToSendItToYou')}
      </Text>

      <View style={styles.bottomRow}>
        <View style={styles.infoCard}>
          {eventThumbnailSource ? (
            <AppImage
              source={eventThumbnailSource}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder} />
          )}
          <View style={styles.infoText}>
            <Text style={[FONTS.fs_16_medium, styles.titleText]}>
              {partyTitle || t('common.activity')}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.timeText]}>
              {eventDateTimeText}
            </Text>
          </View>
        </View>

        <View style={styles.button}>
          <ButtonScarlet
            title={t('meet.checkApplicationDetails')}
            onPress={handleGoHome}
          />
        </View>
      </View>
    </View>
  );
};

export default MeetPaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.grayscale_100,
  },
  commentTitle: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.grayscale_700,
  },
  text: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.grayscale_700,
    paddingBottom: 80,
  },

  bottomRow: {
    position: 'absolute',
    width: '100%',
    bottom: 40,
  },
  button: {
    marginTop: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_0,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
  },
  infoText: {
    marginLeft: 12,
  },
  titleText: {
    color: COLORS.grayscale_900,
  },
  timeText: {
    color: COLORS.grayscale_700,
    marginTop: 8,
  },
});
