import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import {CALENDAR_COMMON_PROPS, CALENDAR_THEME} from '@constants/calendarConfig';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import styles from './GuesthouseReservationEntry.styles';

import CalendarIcon from '@assets/images/calendar_gray.svg';
import LeftChevron from '@assets/images/chevron_left_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import RightChevron from '@assets/images/chevron_right_gray.svg';

dayjs.locale('ko');

const formatCurrency = value => `${Number(value || 0).toLocaleString()}원`;
const toDateKey = value => dayjs(value).format('YYYY-MM-DD');
const getTimePart = value => {
  if (!value || typeof value !== 'string' || !value.includes('T')) {
    return null;
  }

  return value.split('T')[1];
};
const joinDateTime = (dateKey, timeValue) => {
  const timePart = getTimePart(timeValue) || timeValue;

  return timePart ? `${dateKey}T${timePart}` : dateKey;
};

const getNightCount = (checkIn, checkOut) => {
  const checkInDate = dayjs(checkIn);
  const checkOutDate = dayjs(checkOut);

  if (!checkInDate.isValid() || !checkOutDate.isValid()) {
    return 1;
  }

  const diff = checkOutDate.startOf('day').diff(checkInDate.startOf('day'), 'day');
  return Math.max(diff, 1);
};

const GuesthouseReservationEntry = ({route}) => {
  const navigation = useNavigation();
  const params = route.params || {};
  const {
    roomId,
    checkIn,
    checkOut,
    guestCount: initialGuestCount = 1,
    guesthouseId,
    roomPrice,
    totalPrice,
    roomType,
    roomCapacity,
    roomMaxCapacity,
    checkInTime,
    checkOutTime,
    guesthouseName,
  } = params;

  const isDormitory = roomType === 'DORMITORY';
  const baseCapacity = Number(roomCapacity || 1);
  const maxCapacity = Number(roomMaxCapacity || baseCapacity);
  const maxExtraGuestCount = Math.max(maxCapacity - baseCapacity, 0);
  const initialPrivateGuestCount = Math.min(
    Math.max(Number(initialGuestCount || 1), 1),
    maxCapacity,
  );
  const [guestCount, setGuestCount] = useState(
    isDormitory ? Number(initialGuestCount || 1) : initialPrivateGuestCount,
  );
  const [selectedCheckIn, setSelectedCheckIn] = useState(toDateKey(checkIn));
  const [selectedCheckOut, setSelectedCheckOut] = useState(toDateKey(checkOut));
  const [currentMonth, setCurrentMonth] = useState(dayjs(checkIn).format('YYYY-MM'));
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [roomInfo, setRoomInfo] = useState({
    ...params,
    extraPersonPrice:
      params.extraPersonPrice ??
      params.additionalGuestPrice ??
      params.extraGuestPrice ??
      params.additionalPersonPrice ??
      0,
    extraPersonCount: params.extraPersonCount,
    extraPersonTotalPrice: params.extraPersonTotalPrice,
  });
  const nights = getNightCount(selectedCheckIn, selectedCheckOut);
  const calendarCurrentDate = `${currentMonth}-01`;
  const extraGuestUnitPrice = Number(roomInfo.extraPersonPrice || 0);
  const extraGuestCount = Math.max(guestCount - baseCapacity, 0);
  const selectedNightAvailability = availabilityDays.filter(day => {
    if (!day?.date || !selectedCheckIn || !selectedCheckOut) {
      return false;
    }

    const date = dayjs(day.date);

    return (
      (date.isSame(dayjs(selectedCheckIn), 'day') ||
        date.isAfter(dayjs(selectedCheckIn), 'day')) &&
      date.isBefore(dayjs(selectedCheckOut), 'day')
    );
  });
  const availableBedLimit = isDormitory
    ? selectedNightAvailability.reduce((min, day) => {
        const remaining = Number(day.remaining);

        if (!Number.isFinite(remaining)) {
          return min;
        }

        return min == null ? remaining : Math.min(min, remaining);
      }, Number.isFinite(Number(roomInfo.remaining)) ? Number(roomInfo.remaining) : null)
    : null;
  const baseRoomPrice = Number(roomInfo.roomPrice || roomPrice || 0) * nights;
  const extraGuestTotalPrice =
    Number(roomInfo.extraPersonCount) === extraGuestCount &&
    roomInfo.extraPersonTotalPrice != null
      ? Number(roomInfo.extraPersonTotalPrice || 0)
      : extraGuestUnitPrice * extraGuestCount * nights;
  const isServerPriceForCurrentGuestCount =
    isDormitory || Number(roomInfo.extraPersonCount) === extraGuestCount;

  const displayTotalPrice = useMemo(() => {
    if (isDormitory) {
      return Number(roomInfo.totalPrice ?? totalPrice ?? 0)
      || Number(roomInfo.roomPrice || roomPrice || 0) * guestCount * nights;
    }

    return Number(isServerPriceForCurrentGuestCount ? roomInfo.totalPrice : 0)
      || baseRoomPrice + extraGuestTotalPrice;
  }, [
    baseRoomPrice,
    extraGuestTotalPrice,
    guestCount,
    isDormitory,
    isServerPriceForCurrentGuestCount,
    nights,
    roomInfo.roomPrice,
    roomInfo.totalPrice,
    roomPrice,
    totalPrice,
  ]);

  const refreshRoomDetail = useCallback(async () => {
    if (!guesthouseId || !roomId || !selectedCheckIn || !selectedCheckOut) {
      return;
    }

    try {
      const response = await userGuesthouseApi.getGuesthouseDetail({
        guesthouseId,
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        guestCount,
      });
      const nextRoomInfo = response?.data?.roomInfos?.find(
        room => Number(room.id) === Number(roomId),
      );

      if (nextRoomInfo) {
        setRoomInfo(prev => ({
          ...prev,
          ...nextRoomInfo,
        }));
      }
    } catch (error) {
      console.warn('객실 상세 금액 조회 실패:', error);
    }
  }, [guestCount, guesthouseId, roomId, selectedCheckIn, selectedCheckOut]);

  const refreshAvailabilityCalendar = useCallback(async () => {
    if (!guesthouseId || !roomId || !currentMonth) {
      return;
    }

    try {
      const response = await userGuesthouseApi.getRoomAvailabilityCalendar({
        guesthouseId,
        roomId,
        yearMonth: currentMonth,
        guestCount,
      });

      setAvailabilityDays(Array.isArray(response?.data?.days) ? response.data.days : []);
    } catch (error) {
      console.warn('객실 예약 가능 달력 조회 실패:', error);
      setAvailabilityDays([]);
    }
  }, [currentMonth, guestCount, guesthouseId, roomId]);

  useEffect(() => {
    refreshRoomDetail();
  }, [refreshRoomDetail]);

  useEffect(() => {
    refreshAvailabilityCalendar();
  }, [refreshAvailabilityCalendar]);

  const availabilityByDate = useMemo(
    () =>
      availabilityDays.reduce((acc, day) => {
        if (day?.date) {
          acc[day.date] = day;
        }

        return acc;
      }, {}),
    [availabilityDays],
  );

  const handleDayPress = day => {
    const dateString = day?.dateString;

    if (!dateString) {
      return;
    }

    if (dayjs(dateString).isBefore(dayjs(), 'day')) {
      return;
    }

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(dateString);
      setSelectedCheckOut(null);
      setCurrentMonth(dayjs(dateString).format('YYYY-MM'));
      return;
    }

    if (dayjs(dateString).isSame(selectedCheckIn, 'day')) {
      return;
    }

    if (dayjs(dateString).isBefore(selectedCheckIn, 'day')) {
      setSelectedCheckIn(dateString);
      setCurrentMonth(dayjs(dateString).format('YYYY-MM'));
      return;
    }

    setSelectedCheckOut(dateString);
  };

  const renderCalendarDay = ({date, state}) => {
    const dateString = date?.dateString;
    const dayAvailability = availabilityByDate[dateString];
    const isCurrentMonth = dayjs(dateString).format('YYYY-MM') === currentMonth;
    const isUnavailable =
      isCurrentMonth &&
      dayAvailability &&
      (dayAvailability.available === false || dayAvailability.status === 'CLOSED');
    const isAvailable =
      isCurrentMonth && dayAvailability && dayAvailability.available === true;
    const isSelectedStart = dateString === selectedCheckIn;
    const isSelectedEnd = dateString === selectedCheckOut;
    const isSelectedEdge = isSelectedStart || isSelectedEnd;
    const isSelectedRange =
      selectedCheckIn &&
      selectedCheckOut &&
      dayjs(dateString).isAfter(dayjs(selectedCheckIn), 'day') &&
      dayjs(dateString).isBefore(dayjs(selectedCheckOut), 'day');
    const isToday = dayjs(dateString).isSame(dayjs(), 'day');
    const isPastDate = dayjs(dateString).isBefore(dayjs(), 'day');
    const isDisabled =
      state === 'disabled' || !isCurrentMonth || isUnavailable || isPastDate;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        onPress={() => handleDayPress(date)}
        style={[
          styles.dayCell,
          isAvailable && styles.dayCellAvailable,
          isPastDate && styles.dayCellUnavailable,
          isUnavailable && styles.dayCellUnavailable,
          isSelectedRange && styles.dayCellSelectedRange,
          isSelectedEdge && styles.dayCellSelected,
        ]}>
        <Text
          style={[
            FONTS.fs_14_medium,
            styles.dayNumber,
            !isCurrentMonth && styles.dayNumberOut,
            isPastDate && styles.dayNumberUnavailable,
            isUnavailable && styles.dayNumberUnavailable,
            isSelectedRange && styles.dayNumberSelectedRange,
            isSelectedEdge && styles.dayNumberSelected,
          ]}>
          {date?.day}
        </Text>
        {(isSelectedStart || isSelectedEnd || (isToday && isCurrentMonth)) && (
          <Text
            style={[
              FONTS.fs_12_medium,
              styles.daySubLabel,
              isSelectedEdge && styles.daySubLabelSelected,
            ]}>
            {isSelectedStart ? '입실' : isSelectedEnd ? '퇴실' : '오늘'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const decreaseGuest = () => setGuestCount(prev => Math.max(1, prev - 1));
  const showLimitToast = message => {
    Toast.show({
      type: 'success',
      text1: message,
      position: 'bottom',
      visibilityTime: 1800,
      bottomOffset: 88,
    });
  };
  const increaseGuest = () => {
    if (
      isDormitory &&
      availableBedLimit != null &&
      guestCount >= availableBedLimit
    ) {
      showLimitToast(`현재 예약 가능한 베드 수는 ${availableBedLimit}개입니다`);
      return;
    }

    setGuestCount(prev => {
      if (availableBedLimit != null) {
        return Math.min(availableBedLimit, prev + 1);
      }

      return prev + 1;
    });
  };
  const decreasePrivateGuest = () => {
    setGuestCount(prev => Math.max(1, prev - 1));
  };
  const increasePrivateGuest = () => {
    if (guestCount >= maxCapacity) {
      showLimitToast(`예약 가능한 최대 인원은 ${maxCapacity}명입니다`);
      return;
    }

    setGuestCount(prev => Math.min(maxCapacity, prev + 1));
  };

  const goNext = () => {
    if (!selectedCheckIn || !selectedCheckOut) {
      return;
    }

    navigation.navigate('GuesthouseReservation', {
      ...params,
      ...roomInfo,
      roomId,
      roomPrice: roomInfo.roomPrice ?? roomPrice,
      checkIn: joinDateTime(selectedCheckIn, checkInTime || checkIn),
      checkOut: joinDateTime(selectedCheckOut, checkOutTime || checkOut),
      guestCount,
      totalPrice: displayTotalPrice,
    });
  };

  return (
    <View style={styles.container}>
      <Header title={guesthouseName || '객실 예약'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <CalendarIcon width={20} height={20} />
          <Text style={[FONTS.fs_16_semibold, styles.sectionHeaderText]}>
            일정선택
          </Text>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            {...CALENDAR_COMMON_PROPS}
            current={calendarCurrentDate}
            onDayPress={handleDayPress}
            dayComponent={renderCalendarDay}
            renderArrow={direction =>
              direction === 'left' ? (
                <LeftChevron width={24} height={24} />
              ) : (
                <RightChevron width={24} height={24} />
              )
            }
            onMonthChange={month => {
              if (month?.dateString) {
                setCurrentMonth(dayjs(month.dateString).format('YYYY-MM'));
              }
            }}
            disableAllTouchEventsForDisabledDays
            hideExtraDays={false}
            theme={{
              ...CALENDAR_THEME,
              calendarBackground: COLORS.grayscale_0,
              textMonthFontFamily: 'Pretendard-Bold',
              textMonthFontSize: 20,
              textDayHeaderFontFamily: 'Pretendard-Medium',
              textDayHeaderFontSize: 12,
              textDayFontFamily: 'Pretendard-Medium',
              textDayFontSize: 14,
              textDisabledColor: COLORS.grayscale_300,
              monthTextColor: COLORS.grayscale_900,
              dayTextColor: COLORS.grayscale_800,
              'stylesheet.calendar.header': {
                header: styles.calendarHeader,
                monthText: styles.calendarMonthText,
                dayHeader: styles.calendarDayHeader,
                week: styles.calendarWeekHeader,
              },
            }}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendSelected]} />
              <Text style={[FONTS.fs_12_medium, styles.legendText]}>선택</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDisabled]} />
              <Text style={[FONTS.fs_12_medium, styles.legendText]}>불가</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendAvailable]} />
              <Text style={[FONTS.fs_12_medium, styles.legendText]}>가능</Text>
            </View>
          </View>
        </View>

        {isDormitory ? (
          <View style={styles.priceGuestRow}>
            <View>
              <Text style={[FONTS.fs_20_bold, styles.priceText]}>
                {formatCurrency(displayTotalPrice)}
              </Text>
              <Text style={[FONTS.fs_14_regular, styles.unitPriceText]}>
                1베드 당 {formatCurrency(roomInfo.roomPrice ?? roomPrice)}
              </Text>
            </View>

            <View style={styles.guestStepper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={decreaseGuest}
                disabled={guestCount <= 1}
                style={styles.stepperButton}>
                <MinusIcon width={20} height={20} />
              </TouchableOpacity>
              <Text style={[FONTS.fs_16_semibold, styles.guestCountText]}>
                {guestCount}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={increaseGuest}
                style={styles.stepperButton}>
                <PlusIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.baseRoomPriceBlock}>
              <Text style={[FONTS.fs_20_bold, styles.priceText]}>
                {formatCurrency(baseRoomPrice)}
              </Text>
              <Text style={[FONTS.fs_14_regular, styles.unitPriceText]}>
                {baseCapacity}인 기준
              </Text>
            </View>

            {maxExtraGuestCount > 0 && (
              <>
                <View style={styles.divider} />

                <View style={styles.optionHeader}>
                  <View style={styles.optionIconGrid}>
                    <View style={styles.optionIconDot} />
                    <View style={styles.optionIconDot} />
                    <View style={styles.optionIconDot} />
                    <View style={styles.optionIconDot} />
                  </View>
                  <Text style={[FONTS.fs_16_semibold, styles.optionTitle]}>
                    추가옵션
                  </Text>
                </View>
                <Text style={[FONTS.fs_14_regular, styles.optionDescription]}>
                  투숙 인원을 선택해주세요 (최대 {maxCapacity}인)
                </Text>

                <View style={styles.optionPriceRow}>
                  <View>
                    <Text style={[FONTS.fs_16_semibold, styles.extraPriceText]}>
                      {formatCurrency(extraGuestUnitPrice)}
                    </Text>
                    <Text style={[FONTS.fs_14_regular, styles.extraPriceSubText]}>
                      기준 인원 초과 시 1인당
                    </Text>
                  </View>

                  <View style={styles.optionStepperColumn}>
                    <View style={styles.guestStepper}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={decreasePrivateGuest}
                        disabled={guestCount <= 1}
                        style={styles.stepperButton}>
                        <MinusIcon width={20} height={20} />
                      </TouchableOpacity>
                      <Text style={[FONTS.fs_16_semibold, styles.guestCountText]}>
                        {guestCount}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={increasePrivateGuest}
                        style={styles.stepperButton}>
                        <PlusIcon width={20} height={20} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[FONTS.fs_14_medium, styles.totalGuestText]}>
                      추가 인원 {extraGuestCount}명
                    </Text>
                  </View>
                </View>
              </>
            )}
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={[FONTS.fs_20_bold, styles.totalPrice]}>
            {formatCurrency(displayTotalPrice)}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.fixedButton}>
        <ButtonScarlet
          title="다음 단계"
          onPress={goNext}
          disabled={!selectedCheckIn || !selectedCheckOut}
        />
      </View>
    </View>
  );
};

export default GuesthouseReservationEntry;
