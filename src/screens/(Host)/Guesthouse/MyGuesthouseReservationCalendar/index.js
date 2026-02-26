import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';

import Header from '@components/Header';
import EmptyState from '@components/EmptyState';
import styles from './MyGuesthouseReservationCalendar.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import {
  formatLocalDateToDot,
  formatLocalDateToDotWithDay,
} from '@utils/formatDate';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import EmptyIcon from '@assets/images/search_empty.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';

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

const STATUS_LABEL_MAP = {
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 1;
  const diff = new Date(checkOutDate) - new Date(checkInDate);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const formatSelectedDateTitle = (localDate) => {
  return formatLocalDateToDotWithDay(localDate).replace(' (', ' ').replace(')', '');
};

const normalizeReservation = (reservation = {}) => {
  const status = STATUS_LABEL_MAP[reservation?.status] || reservation?.status || '완료';
  const checkInDate = reservation?.checkInDate?.split?.('T')?.[0] ?? reservation?.checkInDate;
  const checkOutDate = reservation?.checkOutDate?.split?.('T')?.[0] ?? reservation?.checkOutDate;

  return {
    ...reservation,
    id: reservation?.reservationId ?? reservation?.id,
    reservationId: reservation?.reservationId ?? reservation?.id,
    status,
    roomName: reservation?.roomName ?? reservation?.room ?? '-',
    checkInDate,
    checkOutDate,
  };
};

// TODO: 사장님 프로필 변경되면 게하 id값 받아서 해야함
const MyGuesthouseReservationCalendar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialGuesthouseId = route?.params?.guesthouseId;

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [guesthouses, setGuesthouses] = useState([]);
  const [selectedGuesthouseId, setSelectedGuesthouseId] = useState(initialGuesthouseId ?? null);
  const [isGuesthouseOpen, setIsGuesthouseOpen] = useState(false);
  const [isGuesthousesLoading, setIsGuesthousesLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(false);

  const selectedGuesthouse =
    guesthouses.find((item) => String(item.id) === String(selectedGuesthouseId)) ?? null;

  useEffect(() => {
    const fetchMyGuesthouses = async () => {
      setIsGuesthousesLoading(true);
      try {
        const response = await hostGuesthouseApi.getMyGuesthouses();
        const list = Array.isArray(response?.data) ? response.data : [];
        const mapped = list
          .map((item) => ({
            id: item?.id,
            guesthouseName: item?.guesthouseName ?? item?.name ?? '이름 없음',
          }))
          .filter((item) => item.id != null);

        setGuesthouses(mapped);
        setSelectedGuesthouseId((prev) => {
          if (
            initialGuesthouseId &&
            mapped.some((item) => String(item.id) === String(initialGuesthouseId))
          ) {
            return initialGuesthouseId;
          }
          if (prev && mapped.some((item) => String(item.id) === String(prev))) {
            return prev;
          }
          return mapped[0]?.id ?? null;
        });
      } catch (error) {
        setGuesthouses([]);
        setSelectedGuesthouseId(null);
      } finally {
        setIsGuesthousesLoading(false);
      }
    };

    fetchMyGuesthouses();
  }, [initialGuesthouseId]);

  useEffect(() => {
    if (!selectedGuesthouseId) {
      setReservations([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setCurrentPage(DEFAULT_PAGE);
      setHasNextPage(false);
      return;
    }

    const fetchReservations = async (page = DEFAULT_PAGE, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      try {
        const response = await hostGuesthouseApi.searchGuesthouseReservations({
          guesthouseId: selectedGuesthouseId,
          targetDate: selectedDate,
          page,
          size: DEFAULT_SIZE,
        });
        const payload = response?.data?.data ?? response?.data ?? {};
        const list =
          payload?.reservations ??
          payload?.content ??
          (Array.isArray(payload) ? payload : null) ??
          response?.data?.reservations ??
          response?.data?.content ??
          (Array.isArray(response?.data) ? response.data : null) ??
          [];

        const safeList = Array.isArray(list) ? list.map(normalizeReservation) : [];
        setReservations((prev) => (append ? [...prev, ...safeList] : safeList));
        setHasNextPage(Boolean(payload?.hasNext));
        setCurrentPage(Number.isFinite(Number(payload?.currentPage)) ? Number(payload.currentPage) : page);
      } catch (error) {
        if (!append) {
          setReservations([]);
          setHasNextPage(false);
          setCurrentPage(DEFAULT_PAGE);
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    };

    fetchReservations(DEFAULT_PAGE, false);
  }, [selectedGuesthouseId, selectedDate]);

  const loadNextPage = async () => {
    if (isLoading || isLoadingMore || !hasNextPage || !selectedGuesthouseId) return;

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await hostGuesthouseApi.searchGuesthouseReservations({
        guesthouseId: selectedGuesthouseId,
        targetDate: selectedDate,
        page: nextPage,
        size: DEFAULT_SIZE,
      });
      const payload = response?.data?.data ?? response?.data ?? {};
      const list =
        payload?.reservations ??
        payload?.content ??
        (Array.isArray(payload) ? payload : null) ??
        response?.data?.reservations ??
        response?.data?.content ??
        (Array.isArray(response?.data) ? response.data : null) ??
        [];
      const safeList = Array.isArray(list) ? list.map(normalizeReservation) : [];
      setReservations((prev) => [...prev, ...safeList]);
      setHasNextPage(Boolean(payload?.hasNext));
      setCurrentPage(
        Number.isFinite(Number(payload?.currentPage))
          ? Number(payload.currentPage)
          : nextPage,
      );
    } catch (error) {
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const markedDates = useMemo(() => ({
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  }), [selectedDate]);

  return (
    <View style={styles.container}>
      <Header title="예약 캘린더"/>

      <View style={styles.body}>
        {isGuesthouseOpen ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.guesthouseBackdrop}
            onPress={() => setIsGuesthouseOpen(false)}
          />
        ) : null}

        <View style={styles.guesthouseSelectContainer}>
          <TouchableOpacity
            style={styles.guesthouseSelectBox}
            onPress={() => setIsGuesthouseOpen((prev) => !prev)}
            disabled={isGuesthousesLoading}
          >
            <Text style={[FONTS.fs_14_regular, styles.guesthouseSelectText]}>
              {selectedGuesthouse?.guesthouseName ?? '게스트하우스를 선택해 주세요'}
            </Text>
            {isGuesthouseOpen ? (
              <ChevronUp width={12} height={12} />
            ) : (
              <ChevronDown width={12} height={12} />
            )}
          </TouchableOpacity>

          {isGuesthouseOpen ? (
            <View style={styles.guesthouseDropdown}>
              {guesthouses.length === 0 ? (
                <View style={styles.guesthouseOption}>
                  <Text style={[FONTS.fs_14_regular, styles.guesthouseOptionText]}>
                    등록된 게스트하우스가 없습니다
                  </Text>
                </View>
              ) : (
                guesthouses.map((item) => (
                  <TouchableOpacity
                    key={String(item.id)}
                    style={styles.guesthouseOption}
                    onPress={() => {
                      setSelectedGuesthouseId(item.id);
                      setIsGuesthouseOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        FONTS.fs_14_regular,
                        styles.guesthouseOptionText,
                        String(selectedGuesthouseId) === String(item.id)
                          ? styles.selectedGuesthouseText
                          : null,
                      ]}
                    >
                      {item.guesthouseName}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : null}
        </View>

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

          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={COLORS.primary_orange} size="small" />
            </View>
          ) : reservations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={EmptyIcon}
                iconSize={{ width: 72, height: 72 }}
                title="예약 내역이 없어요"
                description=""
              />
            </View>
          ) : (
            <FlatList
              data={reservations}
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => String(item.reservationId || item.id || index)}
              onEndReached={loadNextPage}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color={COLORS.primary_orange} size="small" />
                  </View>
                ) : null
              }
              renderItem={({ item: reservation, index }) => {
                const statusStyle =
                  RESERVATION_STATUS_STYLE[reservation.status] || RESERVATION_STATUS_STYLE.완료;
                const nights = getNights(reservation.checkInDate, reservation.checkOutDate);

                return (
                  <TouchableOpacity
                    key={String(reservation.reservationId || reservation.id || index)}
                    activeOpacity={0.85}
                    style={styles.reservationItem}
                    onPress={() =>
                      navigation.navigate('MyGuesthouseReservationDetail', {
                        reservationId: reservation.reservationId || reservation.id,
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
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default MyGuesthouseReservationCalendar;
