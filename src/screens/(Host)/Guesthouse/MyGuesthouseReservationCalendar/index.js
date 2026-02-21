import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseReservationCalendar.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import {
  formatLocalDateToDot,
  formatLocalDateToDotWithDay,
} from '@utils/formatDate';

const RESERVATION_STATUS_STYLE = {
  확정: {
    badgeBackground: COLORS.secondary_blue,
    badgeText: COLORS.semantic_blue,
    label: '예약 확정',
  },
  취소: {
    badgeBackground: COLORS.secondary_red,
    badgeText: COLORS.primary_orange,
    label: '예약 취소',
  },
  완료: {
    badgeBackground: COLORS.grayscale_300,
    badgeText: COLORS.grayscale_0,
    label: '이용 완료',
  },
};

const RESERVATION_MOCK = [
  {
    id: 1,
    status: '확정',
    roomName: '더블형 1인실',
    checkInDate: '2026-05-02',
    checkOutDate: '2026-05-03',
  },
  {
    id: 2,
    status: '취소',
    roomName: '여 6인 도미토리',
    checkInDate: '2026-05-02',
    checkOutDate: '2026-05-03',
  },
  {
    id: 3,
    status: '완료',
    roomName: '친구끼리 트윈룸',
    checkInDate: '2026-05-02',
    checkOutDate: '2026-05-04',
  },
];

const MyGuesthouseReservationCalendar = () => {
  const navigation = useNavigation();

  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNights = (checkInDate, checkOutDate) => {
    const diff = new Date(checkOutDate) - new Date(checkInDate);
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const formatSelectedDateTitle = (localDate) => {
    return formatLocalDateToDotWithDay(localDate).replace(' (', ' ').replace(')', '');
  };

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };
  
  return (
    <View style={styles.container}>
      <Header title="예약 캘린더"/>
      
      <View style={styles.body}>

        {/* 예약 달력 */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            {...CALENDAR_COMMON_PROPS}
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              ...CALENDAR_THEME,
              textMonthFontSize: 20,
              textDayFontSize: 18,
              textDayHeaderFontSize: 14,
              'stylesheet.day.basic': {
                base: {
                  height: 44,
                },
                selected: {
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
            }}
          />
        </View>

        {/* 예약 리스트 */}
        <View style={styles.listContainer}>
          <Text style={[FONTS.fs_16_medium, styles.listDateTitle]}>
            {formatSelectedDateTitle(selectedDate)}
          </Text>

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {RESERVATION_MOCK.map((reservation) => {
              const statusStyle =
                RESERVATION_STATUS_STYLE[reservation.status] || RESERVATION_STATUS_STYLE.완료;
              const nights = getNights(reservation.checkInDate, reservation.checkOutDate);

              return (
                <TouchableOpacity
                  key={reservation.id}
                  activeOpacity={0.85}
                  style={styles.reservationItem}
                  onPress={() =>
                    navigation.navigate('MyGuesthouseReservationDetail', {
                      reservation: {
                        ...reservation,
                        room: reservation.roomName,
                        period: `${formatLocalDateToDot(
                          reservation.checkInDate,
                        )} ~ ${formatLocalDateToDot(reservation.checkOutDate)} (${nights}박)`,
                      },
                    })
                  }
                >
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.badgeBackground },
                    ]}
                  >
                    <Text
                      style={[
                        FONTS.fs_14_semibold,
                        styles.statusBadgeText,
                        { color: statusStyle.badgeText },
                      ]}
                    >
                      {statusStyle.label}
                    </Text>
                  </View>

                  <View style={styles.reservationInfo}>
                    <Text style={[FONTS.fs_14_medium, styles.roomName]}>
                      {reservation.roomName}
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.periodText]}>
                      {`${formatLocalDateToDot(reservation.checkInDate)} ~ ${formatLocalDateToDot(
                        reservation.checkOutDate,
                      )} (${nights}박)`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default MyGuesthouseReservationCalendar;
