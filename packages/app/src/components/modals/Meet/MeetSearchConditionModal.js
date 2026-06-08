import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Keyboard,
  Pressable,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import SearchIcon from '@assets/images/search_gray.svg';
import XIcon from '@assets/images/x_gray.svg';
import LeftArrowIcon from '@assets/images/chevron_left_gray.svg';
import RightArrowIcon from '@assets/images/chevron_right_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';

dayjs.extend(isSameOrBefore);
dayjs.locale('ko');

const {height} = Dimensions.get('window');

const MeetSearchConditionModal = ({
  visible,
  onClose,
  onApply,
  initialLocation = '제주도',
  initialCheckInDate,
  initialCheckOutDate,
  initialAdultCount = 1,
  initialChildCount = 0,
}) => {
  const [step, setStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialLocation || '제주도');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [checkInDate, setCheckInDate] = useState(
    initialCheckInDate || dayjs().format('YYYY-MM-DD'),
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialCheckOutDate || dayjs().add(1, 'day').format('YYYY-MM-DD'),
  );
  const [adultCount, setAdultCount] = useState(initialAdultCount);
  const [childCount, setChildCount] = useState(initialChildCount);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM-DD'));
  const [isDateOpen, setIsDateOpen] = useState(true);
  const [isGuestOpen, setIsGuestOpen] = useState(true);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setStep(0);
    setSearchTerm(initialLocation || '제주도');
    setSelectedLocation(initialLocation || '제주도');
    setCheckInDate(initialCheckInDate || dayjs().format('YYYY-MM-DD'));
    setCheckOutDate(
      initialCheckOutDate || dayjs().add(1, 'day').format('YYYY-MM-DD'),
    );
    setAdultCount(initialAdultCount || 1);
    setChildCount(initialChildCount || 0);
    setCurrentMonth(
      initialCheckInDate || dayjs().format('YYYY-MM-DD'),
    );
    setIsDateOpen(true);
    setIsGuestOpen(true);
  }, [
    visible,
    initialLocation,
    initialCheckInDate,
    initialCheckOutDate,
    initialAdultCount,
    initialChildCount,
  ]);

  const canProceed = useMemo(() => {
    if (step === 0) {
      return !!selectedLocation;
    }
    if (step === 1) {
      return !!checkInDate && !!checkOutDate;
    }
    return true;
  }, [step, selectedLocation, checkInDate, checkOutDate]);

  const onDayPress = day => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(day.dateString);
      setCheckOutDate(null);
      return;
    }
    if (day.dateString > checkInDate) {
      setCheckOutDate(day.dateString);
      return;
    }
    setCheckInDate(day.dateString);
    setCheckOutDate(null);
  };

  const markedDates = useMemo(() => {
    const marked = {};
    if (checkInDate && !checkOutDate) {
      marked[checkInDate] = {
        startingDay: true,
        endingDay: true,
        color: COLORS.primary_orange,
        textColor: COLORS.grayscale_0,
      };
      return marked;
    }

    if (checkInDate && checkOutDate) {
      let current = dayjs(checkInDate);
      const end = dayjs(checkOutDate);
      while (current.isSameOrBefore(end)) {
        const dateStr = current.format('YYYY-MM-DD');
        if (dateStr === checkInDate) {
          marked[dateStr] = {
            startingDay: true,
            color: COLORS.primary_orange,
            textColor: COLORS.grayscale_0,
          };
        } else if (dateStr === checkOutDate) {
          marked[dateStr] = {
            endingDay: true,
            color: COLORS.primary_orange,
            textColor: COLORS.grayscale_0,
          };
        } else {
          marked[dateStr] = {
            color: COLORS.primary_orange,
            textColor: COLORS.grayscale_0,
          };
        }
        current = current.add(1, 'day');
      }
    }
    return marked;
  }, [checkInDate, checkOutDate]);

  const renderLocationStep = () => (
    <View style={styles.stepWrap}>
      <View style={styles.searchBar}>
        <SearchIcon width={20} height={20} />
        <TextInput
          value={searchTerm}
          onChangeText={text => {
            setSearchTerm(text);
            setSelectedLocation(text.trim());
          }}
          placeholder="지역을 검색해보세요"
          placeholderTextColor={COLORS.grayscale_400}
          style={[FONTS.fs_14_regular, styles.searchInput]}
        />
      </View>
      <Text style={[FONTS.fs_12_medium, styles.helperText]}>
        검색 API는 추후 연결 예정입니다.
      </Text>
    </View>
  );

  const renderDateStep = () => (
    <View style={styles.stepWrap}>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionText}
          onPress={() => setIsDateOpen(prev => !prev)}>
          <Text style={[FONTS.fs_16_medium, styles.selectedTitle]}>날짜</Text>
          <Text style={[FONTS.fs_14_semibold, styles.selectedText]}>
            {checkInDate && checkOutDate
              ? `${dayjs(checkInDate).format('M.D(dd)')} - ${dayjs(checkOutDate).format('M.D(dd)')}`
              : '날짜를 선택해주세요'}
          </Text>
        </TouchableOpacity>

        {isDateOpen && (
          <View style={styles.selectContainer}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarHeaderText}>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentMonth(
                      dayjs(currentMonth)
                        .subtract(1, 'month')
                        .format('YYYY-MM-DD'),
                    )
                  }>
                  <LeftArrowIcon width={24} height={24} />
                </TouchableOpacity>
                <Text style={[FONTS.fs_16_semibold, styles.monthText]}>
                  {dayjs(currentMonth).format('YYYY년 M월')}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentMonth(
                      dayjs(currentMonth).add(1, 'month').format('YYYY-MM-DD'),
                    )
                  }>
                  <RightArrowIcon width={24} height={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.dayTextContainer}>
                {['월', '화', '수', '목', '금', '토', '일'].map(d => (
                  <Text key={d} style={[FONTS.fs_14_medium, styles.dayText]}>
                    {d}
                  </Text>
                ))}
              </View>
            </View>

            <Calendar
              minDate={dayjs().format('YYYY-MM-DD')}
              markingType="period"
              markedDates={markedDates}
              onDayPress={onDayPress}
              firstDay={1}
              hideDayNames
              current={currentMonth}
              renderHeader={() => null}
              key={currentMonth}
              hideArrows
              theme={{
                textDayFontFamily: 'Pretendard-Medium',
                textDayFontSize: 14,
                textDayFontWeight: '500',
              }}
            />
          </View>
        )}
      </View>
    </View>
  );

  const increaseAdult = () => setAdultCount(prev => prev + 1);
  const decreaseAdult = () => setAdultCount(prev => Math.max(1, prev - 1));
  const increaseChild = () => setChildCount(prev => prev + 1);
  const decreaseChild = () => setChildCount(prev => Math.max(0, prev - 1));

  const formattedGuestText =
    childCount > 0 ? `성인 ${adultCount}, 아동 ${childCount}` : `성인 ${adultCount}`;

  const renderGuestStep = () => (
    <View style={styles.stepWrap}>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionText}
          onPress={() => setIsGuestOpen(prev => !prev)}>
          <Text style={[FONTS.fs_16_medium, styles.selectedTitle]}>인원</Text>
          <Text style={[FONTS.fs_14_semibold, styles.selectedText]}>
            {formattedGuestText}
          </Text>
        </TouchableOpacity>

        {isGuestOpen && (
          <View style={styles.selectContainer}>
            <View style={styles.guestContainer}>
              <Text style={FONTS.fs_16_semibold}>성인</Text>
              <View style={styles.selectGuest}>
                <TouchableOpacity
                  style={styles.pmIconContainer}
                  onPress={decreaseAdult}>
                  <MinusIcon width={24} height={24} />
                </TouchableOpacity>
                <View style={styles.guestText}>
                  <Text style={FONTS.fs_14_medium}>{adultCount}</Text>
                </View>
                <TouchableOpacity
                  style={styles.pmIconContainer}
                  onPress={increaseAdult}>
                  <PlusIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.guestContainer}>
              <Text style={FONTS.fs_16_semibold}>아동</Text>
              <View style={styles.selectGuest}>
                <TouchableOpacity
                  style={styles.pmIconContainer}
                  onPress={decreaseChild}>
                  <MinusIcon width={24} height={24} />
                </TouchableOpacity>
                <View style={styles.guestText}>
                  <Text style={FONTS.fs_14_medium}>{childCount}</Text>
                </View>
                <TouchableOpacity
                  style={styles.pmIconContainer}
                  onPress={increaseChild}>
                  <PlusIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={Keyboard.dismiss}>
        <Pressable style={styles.modal} onPress={Keyboard.dismiss}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.tabWrap}>
                {['위치', '날짜', '인원'].map((label, idx) => {
                  const active = step === idx;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={styles.tabItem}
                      activeOpacity={1}
                      onPress={() => setStep(idx)}>
                      <Text
                        style={[
                          FONTS.fs_16_semibold,
                          styles.tabText,
                          active && styles.tabTextActive,
                        ]}>
                        {label}
                      </Text>
                      <View
                        style={[
                          styles.tabUnderline,
                          active && styles.tabUnderlineActive,
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <XIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {step === 0 && renderLocationStep()}
            {step === 1 && renderDateStep()}
            {step === 2 && renderGuestStep()}
          </View>

          <View style={styles.buttonWrap}>
            {step < 2 ? (
              <ButtonScarlet
                title="다음"
                onPress={() => setStep(prev => prev + 1)}
                disabled={!canProceed}
              />
            ) : (
              <ButtonScarlet
                title="적용하기"
                onPress={() => {
                  onApply?.({
                    location: selectedLocation,
                    checkInDate,
                    checkOutDate,
                    adultCount,
                    childCount,
                  });
                  onClose?.();
                }}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modal: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.grayscale_200,
  },
  tabWrap: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tabText: {
    color: COLORS.grayscale_500,
    paddingVertical: 12,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },
  tabUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: COLORS.primary_orange,
  },
  closeButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  stepWrap: {
    gap: 12,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: COLORS.grayscale_800,
  },
  helperText: {
    color: COLORS.grayscale_400,
  },
  section: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  sectionText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedTitle: {
    color: COLORS.grayscale_800,
  },
  selectedText: {
    color: COLORS.primary_blue,
  },
  selectContainer: {
    borderTopWidth: 0.8,
    borderTopColor: COLORS.grayscale_200,
    marginTop: 20,
    paddingTop: 20,
    gap: 12,
  },
  calendarHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarHeaderText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 12,
  },
  monthText: {
    color: COLORS.grayscale_800,
  },
  dayTextContainer: {
    flexDirection: 'row',
    width: '95%',
    alignSelf: 'center',
  },
  dayText: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.grayscale_400,
  },

  guestContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectGuest: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pmIconContainer: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    padding: 4,
  },
  guestText: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
  },
  buttonWrap: {
    paddingBottom: 40,
    paddingTop: 12,
    width: '40%',
    alignSelf: 'flex-end',
  },
});

export default MeetSearchConditionModal;
