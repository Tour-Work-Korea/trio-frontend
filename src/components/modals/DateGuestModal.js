import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  ScrollView,
} from "react-native";
import { Calendar } from 'react-native-calendars';
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.locale('ko');
dayjs.extend(isSameOrBefore);

const { height } = Dimensions.get("window");

import MinusIcon from '@assets/images/minus_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import XIcon from '@assets/images/x_gray.svg';
import LeftArrowIcon from '@assets/images/chevron_left_gray.svg';
import RightArrowIcon from '@assets/images/chevron_right_gray.svg';

import ButtonScarlet from '@components/ButtonScarlet';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

// 안드로이드 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DateGuestModal = ({
  visible,
  onClose,
  onApply,
  initCheckInDate,
  initCheckOutDate,
  initAdultGuestCount,
  initChildGuestCount,
}) => {
  // 인원
  const [adultCount, setAdultCount] = useState(initAdultGuestCount);
  const [childCount, setChildCount] = useState(initChildGuestCount);
  // 달력
  const [checkInDate, setCheckInDate] = useState(initCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(initCheckOutDate);

  // 모달 열릴 때마다 최신값으로
  useEffect(() => {
    setCheckInDate(initCheckInDate);
    setCheckOutDate(initCheckOutDate);
    setAdultCount(initAdultGuestCount);
    setChildCount(initChildGuestCount);
  }, [visible]);

  const onDayPress = (day) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
        // 첫 선택 or 이미 2개 선택된 뒤 재선택 → checkIn 갱신
        setCheckInDate(day.dateString);
        setCheckOutDate(null);
    } else {
        // 두번째 선택 → checkOut
        if (day.dateString > checkInDate) {
        setCheckOutDate(day.dateString);
        } else {
        // checkOut이 checkIn보다 앞이면 checkIn 교체
        setCheckInDate(day.dateString);
        setCheckOutDate(null);
        }
    }
  };

  const markedDates = {};
  if (checkInDate && !checkOutDate) {
    markedDates[checkInDate] = { startingDay: true, endingDay: true, color: COLORS.primary_orange, textColor: COLORS.grayscale_0 };
  }
  if (checkInDate && checkOutDate) {
    let current = dayjs(checkInDate);
    const end = dayjs(checkOutDate);

    while (current.isSameOrBefore(end)) {
        const dateStr = current.format("YYYY-MM-DD");
        if (dateStr === checkInDate) {
            markedDates[dateStr] = { startingDay: true, color: COLORS.primary_orange, textColor: COLORS.grayscale_0 };
        } else if (dateStr === checkOutDate) {
            markedDates[dateStr] = { endingDay: true, color: COLORS.primary_orange, textColor: COLORS.grayscale_0 };
        } else {
            markedDates[dateStr] = { color: COLORS.primary_orange, textColor: COLORS.grayscale_0 };
        }
        current = current.add(1, "day");
    }
  }

  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM-DD"));

  const goPrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM-DD"));
  };

  const goNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM-DD"));
  };

  // 날짜 텍스트 출력 
  const formattedSelectedText = checkInDate && checkOutDate
  ? `${dayjs(checkInDate).format("M.D(dd)")} - ${dayjs(checkOutDate).format("M.D(dd)")}, ${dayjs(checkOutDate).diff(dayjs(checkInDate), "day")}박`
  : "날짜를 선택해주세요";

  // 인원
  const increaseAdult = () => setAdultCount(adultCount + 1);
  const decreaseAdult = () => setAdultCount(Math.max(1, adultCount - 1));

  const increaseChild = () => setChildCount(childCount + 1);
  const decreaseChild = () => setChildCount(Math.max(0, childCount - 1));

  const formattedGuestText = childCount > 0
  ? `성인 ${adultCount}, 아동 ${childCount}`
  : `성인 ${adultCount}`;

  // 아코디언 효과
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const toggleGuestSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsGuestOpen(!isGuestOpen);
  };

  const toggleDateSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDateOpen(!isDateOpen);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.title]}>날짜, 인원 선택</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={{paddingBottom: 80}}>
          {/* 날짜 */}
          <View style={styles.section}>
            <TouchableOpacity
                style={styles.sectionText}
                onPress={toggleDateSection}
            >
                <Text style={[FONTS.fs_16_medium, styles.selectedTitle]}>날짜</Text>
                <Text style={[FONTS.fs_14_semibold, styles.selectedText]}>{formattedSelectedText}</Text>
            </TouchableOpacity>
            {isDateOpen && (
              <View style={styles.selectContainer}>
                <View style={styles.calendarHeader}>
                    <View style={styles.calendarHeaderText}>
                        <TouchableOpacity onPress={goPrevMonth}>
                            <LeftArrowIcon />
                        </TouchableOpacity>
                        <Text style={[FONTS.fs_16_semibold, styles.monthText]}>{dayjs(currentMonth).format("YYYY년 M월")}</Text>
                        <TouchableOpacity onPress={goNextMonth}>
                            <RightArrowIcon />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dayTextContainer}>
                        {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                            <Text key={d} style={[FONTS.fs_14_medium, styles.dayText]}>{d}</Text>
                        ))}
                    </View>
                </View>
                <Calendar
                    minDate={dayjs().format("YYYY-MM-DD")}
                    markingType="period"
                    markedDates={markedDates}
                    onDayPress={onDayPress}
                    firstDay={1}
                    hideDayNames={true}
                    current={currentMonth}
                    renderHeader={() => null}
                    key={currentMonth}
                    hideArrows={true}        
                    theme={{
                        textDayFontFamily: 'Pretendard-Medium',
                        textDayFontSize: 14,
                        textDayFontWeight: '500',
                    }}
                />
              </View>
            )}
          </View>

          {/* 인원 */}
          <View style={styles.section}>
            <TouchableOpacity
                style={styles.sectionText}
                onPress={toggleGuestSection}
            >
                <Text style={[FONTS.fs_16_medium, styles.selectedTitle]}>인원</Text>
                <Text style={[FONTS.fs_14_semibold, styles.selectedText]}>{formattedGuestText}</Text>
            </TouchableOpacity>
            {isGuestOpen && (
              <View style={styles.selectContainer}>
                  <View style={styles.guestContainer}>
                      <Text style={FONTS.fs_16_semibold}>성인</Text>
                      <View style={styles.selectGuest}>
                          <TouchableOpacity style={styles.pmIconContainer} onPress={decreaseAdult}>
                              <MinusIcon width={24} height={24}/>
                          </TouchableOpacity>
                          <View style={styles.guestText}>
                              <Text style={FONTS.fs_14_medium}>{adultCount}</Text>
                          </View>
                          <TouchableOpacity style={styles.pmIconContainer} onPress={increaseAdult}>
                              <PlusIcon width={24} height={24}/>
                          </TouchableOpacity>
                      </View>
                  </View>
                  <View style={styles.guestContainer}>
                      <Text style={FONTS.fs_16_semibold}>아동</Text>
                      <View style={styles.selectGuest}>
                          <TouchableOpacity style={styles.pmIconContainer} onPress={decreaseChild}>
                              <MinusIcon width={24} height={24}/>
                          </TouchableOpacity>
                          <View style={styles.guestText}>
                              <Text style={FONTS.fs_14_medium}>{childCount}</Text>
                          </View>
                          <TouchableOpacity style={styles.pmIconContainer} onPress={increaseChild}>
                              <PlusIcon width={24} height={24}/>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
            )}
          </View>
        </ScrollView>

          {/* 적용 버튼 */}
          <View style={styles.applyButton}>
            <ButtonScarlet 
                title="적용하기" 
                onPress={() => {
                    onApply(checkInDate, checkOutDate, adultCount, childCount);
                }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateGuestModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    height: height * 0.9,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_600,
  },

  // 제목, 닫기 버튼
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  title: {
    color: COLORS.grayscale_900,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  // 선택 틀
  section: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTitle: {
    color: COLORS.grayscale_800,
  },
  selectedText: {
    color: COLORS.primary_blue,
  },
  
  // 선택
  panel: {
    // overflow: 'hidden',
  },
  selectContainer: {
    borderTopWidth: 0.8,
    borderTopColor: COLORS.grayscale_200,
    marginTop: 20,
    paddingTop: 20,
    gap: 12,
  },

  // 인원 선택
  guestContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectGuest: {
    flexDirection: "row",
    alignItems: 'center',
  },
  pmIconContainer: {
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 100,
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

  // 날짜 선택
  calendarHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarHeaderText: {
    flexDirection: "row", 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    width: '95%',
  },
  monthText: {
  },
  dayTextContainer: {
    flexDirection: "row", 
    alignSelf: 'center',
    width: '95%',
  },
  dayText: {
    flex: 1,
    textAlign: "center",
    color: COLORS.grayscale_400,
  },
  
  applyButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    left: 20,
    right: 20,
  },
});
