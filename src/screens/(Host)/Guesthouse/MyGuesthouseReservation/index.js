import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

import Header from '@components/Header';
import styles from './MyGuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import ReservationList from './ReservationList';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
import useUserStore from '@stores/userStore';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';
import SearchIcon from '@assets/images/search_gray.svg';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const SEARCH_TYPE_MAP = {
  예약자명: 'GUEST_NAME',
  '예약자 전화번호': 'GUEST_PHONE',
  예약번호: 'RESERVATION_CODE',
};
const RESERVATION_STATUS_MAP = {
  확정: 'CONFIRMED',
  취소: 'CANCELLED',
  완료: 'COMPLETED',
};

const MyGuesthouseReservation = () => {
  const selectedGuesthouseId = useUserStore(state => state.selectedHostGuesthouseId);

  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const shiftDate = (baseDate, diffDays) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + diffDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [isReservationStatusOpen, setIsReservationStatusOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedSearchFilter, setSelectedSearchFilter] = useState('예약자명');
  const [selectedReservationStatus, setSelectedReservationStatus] = useState('전체');
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [searchKeywordInput, setSearchKeywordInput] = useState('');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState(SEARCH_TYPE_MAP.예약자명);
  const [reservations, setReservations] = useState([]);
  const [reservationTotalCount, setReservationTotalCount] = useState(0);
  const [targetDateCount, setTargetDateCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isReservationsLoading, setIsReservationsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const searchFilterOptions = ['예약자명', '예약자 전화번호', '예약번호'];
  const reservationStatusOptions = ['전체', '확정', '취소', '완료'];
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };

  const handleSelectSearchFilter = (option) => {
    setSelectedSearchFilter(option);
    setIsSearchFilterOpen(false);
  };

  const handleSelectReservationStatus = (option) => {
    setSelectedReservationStatus(option);
    setIsReservationStatusOpen(false);
  };

  const handleSearch = () => {
    const trimmedKeyword = searchKeywordInput.trim();
    setAppliedSearchKeyword(trimmedKeyword);
    setAppliedSearchType(SEARCH_TYPE_MAP[selectedSearchFilter] ?? 'GUEST_NAME');
  };

  const buildReservationSearchParams = useCallback((page = DEFAULT_PAGE) => ({
    guesthouseId: selectedGuesthouseId,
    targetDate: selectedDate,
    page,
    size: DEFAULT_SIZE,
    ...(selectedReservationStatus !== '전체'
      ? { status: RESERVATION_STATUS_MAP[selectedReservationStatus] }
      : {}),
    ...(appliedSearchKeyword
      ? {
        keyword: appliedSearchKeyword,
        searchType: appliedSearchType,
      }
      : {}),
  }), [
    selectedGuesthouseId,
    selectedDate,
    selectedReservationStatus,
    appliedSearchKeyword,
    appliedSearchType,
  ]);

  const requestReservationSearch = useCallback(
    async (formData, options = { append: false }) => {
      if (!selectedGuesthouseId) return;
      const isAppend = !!options?.append;

      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsReservationsLoading(true);
      }
      try {
        const response = await hostGuesthouseApi.searchGuesthouseReservations(formData);
        const payload = response?.data?.data ?? response?.data ?? {};
        const content =
          payload?.reservations ??
          payload?.content ??
          response?.data?.reservations ??
          response?.data?.content ??
          [];
        const totalCount = Number(payload?.totalCount);
        const targetCount = Number(payload?.targetDateCount);
        const next = Boolean(payload?.hasNext);
        const page = Number(payload?.currentPage);
        const safeContent = Array.isArray(content) ? content : [];

        setReservations((prev) => (
          isAppend ? [...prev, ...safeContent] : safeContent
        ));
        if (Number.isFinite(totalCount)) {
          setReservationTotalCount(totalCount);
        } else if (!isAppend) {
          setReservationTotalCount(safeContent.length);
        }
        if (Number.isFinite(targetCount)) {
          setTargetDateCount(targetCount);
        } else if (!isAppend) {
          setTargetDateCount(safeContent.length);
        }
        setHasNextPage(next);
        setCurrentPage(Number.isFinite(page) ? page : formData?.page ?? DEFAULT_PAGE);
      } catch (error) {
        if (!isAppend) {
          setReservations([]);
          setReservationTotalCount(0);
          setTargetDateCount(0);
          setHasNextPage(false);
          setCurrentPage(DEFAULT_PAGE);
        }
      } finally {
        if (isAppend) {
          setIsLoadingMore(false);
        } else {
          setIsReservationsLoading(false);
        }
      }
    },
    [selectedGuesthouseId],
  );

  const loadNextPage = useCallback(() => {
    if (isReservationsLoading || isLoadingMore || !hasNextPage || !selectedGuesthouseId) {
      return;
    }
    const nextPage = currentPage + 1;
    requestReservationSearch(buildReservationSearchParams(nextPage), { append: true });
  }, [
    isReservationsLoading,
    isLoadingMore,
    hasNextPage,
    selectedGuesthouseId,
    currentPage,
    requestReservationSearch,
    buildReservationSearchParams,
  ]);

  useEffect(() => {
    if (!selectedGuesthouseId) {
      setReservations([]);
      setReservationTotalCount(0);
      setTargetDateCount(0);
      setCurrentPage(DEFAULT_PAGE);
      setHasNextPage(false);
      setIsLoadingMore(false);
      setIsReservationsLoading(false);
      return;
    }

    requestReservationSearch(buildReservationSearchParams(DEFAULT_PAGE), { append: false });
  }, [
    selectedGuesthouseId,
    selectedDate,
    selectedReservationStatus,
    appliedSearchKeyword,
    appliedSearchType,
    buildReservationSearchParams,
    requestReservationSearch,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedGuesthouseId) return;

      requestReservationSearch(buildReservationSearchParams(DEFAULT_PAGE), { append: false });
    }, [
      selectedGuesthouseId,
      selectedDate,
      selectedReservationStatus,
      appliedSearchKeyword,
      appliedSearchType,
      buildReservationSearchParams,
      requestReservationSearch,
    ]),
  );
  
  return (
    <View style={styles.container}>
      <Header title="예약 관리"/>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.body}>
        {isSearchFilterOpen || isReservationStatusOpen || isCalendarOpen ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.searchFilterBackdrop}
            onPress={() => {
              setIsSearchFilterOpen(false);
              setIsReservationStatusOpen(false);
              setIsCalendarOpen(false);
            }}
          />
        ) : null}

        {/* 날짜 선택 */}
        <View style={styles.dateSelectContainer}>
          <View style={styles.dateSelectBox}>
          <TouchableOpacity
            onPress={() => {
              setSelectedDate((prev) => shiftDate(prev, -1));
              setIsCalendarOpen(false);
            }}
          >
            <ChevronLeft width={24} height={24}/>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                setIsCalendarOpen((prev) => !prev);
                setIsSearchFilterOpen(false);
                setIsReservationStatusOpen(false);
              }}
          >
            <Text style={[FONTS.fs_16_medium]}>
              {formatLocalDateToDotWithDay(selectedDate)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedDate((prev) => shiftDate(prev, 1));
              setIsCalendarOpen(false);
            }}
          >
            <ChevronRight width={24} height={24}/>
          </TouchableOpacity>
          </View>

          {isCalendarOpen ? (
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                {...CALENDAR_COMMON_PROPS}
                markedDates={markedDates}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setIsCalendarOpen(false);
                }}
                theme={CALENDAR_THEME}
              />
            </View>
          ) : null}
        </View>

        {/* 검색, 조건 분류 */}
        <View style={styles.searchBox}>
          <View style={styles.searchFilterContainer}>
            <TouchableOpacity
              style={styles.searchFilterBox}
              onPress={() => {
                setIsSearchFilterOpen((prev) => !prev);
                setIsReservationStatusOpen(false);
                setIsCalendarOpen(false);
              }}
            >
              <Text style={[FONTS.fs_14_regular]}>
                {selectedSearchFilter}
              </Text>
              {isSearchFilterOpen ? (
                <ChevronUp width={12} height={12}/>
              ) : (
                <ChevronDown width={12} height={12}/>
              )}
            </TouchableOpacity>

            {isSearchFilterOpen ? (
              <View style={styles.searchFilterDropdown}>
                {searchFilterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.searchFilterOption}
                    onPress={() => handleSelectSearchFilter(option)}
                  >
                    <Text
                      style={[
                        FONTS.fs_14_regular,
                        styles.searchFilterOptionText,
                        selectedSearchFilter === option && {color: COLORS.primary_orange},
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8}}>
            <TextInput
              style={[FONTS.fs_14_medium, styles.searchInput]}
              placeholder="입력 후 검색하세요"
              placeholderTextColor={COLORS.grayscale_400}
              value={searchKeywordInput}
              onChangeText={setSearchKeywordInput}
            />
            <TouchableOpacity onPress={handleSearch}>
              <SearchIcon width={20} height={20}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.filterContainer}>
          <View style={styles.filterBox}>
            <Text style={[FONTS.fs_14_regular]}>오늘이용 {targetDateCount}</Text>
          </View>
          <View style={styles.statusFilterContainer}>
            <TouchableOpacity
              style={styles.filterBox}
              onPress={() => {
                setIsReservationStatusOpen((prev) => !prev);
                setIsSearchFilterOpen(false);
                setIsCalendarOpen(false);
              }}
            >
            <Text style={[FONTS.fs_14_regular]}>예약상태</Text>
              {isReservationStatusOpen ? (
                <ChevronUp width={12} height={12}/>
              ) : (
                <ChevronDown width={12} height={12}/>
              )}
            </TouchableOpacity>

            {isReservationStatusOpen ? (
              <View style={styles.statusFilterDropdown}>
                {reservationStatusOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.searchFilterOption}
                    onPress={() => handleSelectReservationStatus(option)}
                  >
                    <Text
                      style={[
                        FONTS.fs_14_regular,
                        styles.searchFilterOptionText,
                        selectedReservationStatus === option && {color: COLORS.primary_orange},
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {/* 리스트 */}
        <ReservationList
          data={reservations}
          totalCount={reservationTotalCount}
          loading={isReservationsLoading}
          loadingMore={isLoadingMore}
          onEndReached={loadNextPage}
        />
      </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default MyGuesthouseReservation;
