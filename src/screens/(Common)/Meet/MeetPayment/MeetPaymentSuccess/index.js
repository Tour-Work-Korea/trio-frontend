import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import Logo from '@assets/images/meet_reservation_success.svg';

const MeetPaymentSuccess = () => {
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
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
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
      <Text style={[FONTS.fs_20_semibold, styles.text]}>
        예약 완료되었어요! {'\n'}
        이제 이벤트을 즐기러 가볼까요?
      </Text>

      <View style={styles.bottomRow}>
        <View style={styles.infoCard}>
          {eventThumbnailSource ? (
            <Image
              source={eventThumbnailSource}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder} />
          )}
          <View style={styles.infoText}>
            <Text style={[FONTS.fs_16_medium, styles.titleText]}>
              {partyTitle || '이벤트'}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.timeText]}>
              {eventDateTimeText}
            </Text>
          </View>
        </View>

        <View style={styles.button}>
          <ButtonScarlet title={'예약내역 확인하기'} onPress={handleGoHome} />
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
