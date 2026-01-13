import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import ClockIcon from '@assets/images/clock_gray.svg';
import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const KOR_DAYS = [
  {key: 'MONDAY', label: '월요일'},
  {key: 'TUESDAY', label: '화요일'},
  {key: 'WEDNESDAY', label: '수요일'},
  {key: 'THURSDAY', label: '목요일'},
  {key: 'FRIDAY', label: '금요일'},
  {key: 'SATURDAY', label: '토요일'},
  {key: 'SUNDAY', label: '일요일'},
];

const toYMD = d => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const toHMS = d => {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};
const fmtTimeKOR = d => {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? '오전' : '오후';
  const hh12 = ((h + 11) % 12) + 1;
  return `${ap} ${hh12}:${m}`;
};
const fmtYMD = d =>
  `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const MeetDateModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialRecruitStartDate = '',
  initialRecruitEndDate = '',
  initialPartyStartTime = '19:00:00',
  initialPartyEndTime = '22:00:00',
  initialIsRecurring = false,
  initialRepeatDays = [],
}) => {
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(22, 0, 0, 0);
    return d;
  });

  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date());

  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatDays, setRepeatDays] = useState([]);

  // 피커 노출 상태
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // ✅ 추가: 피커 영역 터치인지 판별하기 위해 measureInWindow 저장
  const startTimePickerRef = useRef(null);
  const endTimePickerRef = useRef(null);
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);
  const pickerRectsRef = useRef({
    startTime: null,
    endTime: null,
    startDate: null,
    endDate: null,
  });

  const parseDate = ymd => {
    if (!ymd) return new Date();
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m - 1) || 0, d || 1);
  };
  const parseTime = hms => {
    const d = new Date();
    const [h, m, s] = (hms || '00:00:00').split(':').map(Number);
    d.setHours(h || 0, m || 0, s || 0, 0);
    return d;
  };

  // 모달 열릴 때 마지막 적용 값 복원
  useEffect(() => {
    if (!visible) return;

    // ✅ 수정: 모달이 다시 열릴 때는 "마지막 적용값(appliedData)"을 우선 보여주고,
    // 없으면 initial 값으로 세팅
    if (appliedData) {
      setStartTime(new Date(appliedData.startTime));
      setEndTime(new Date(appliedData.endTime));
      setStartDate(new Date(appliedData.startDate));
      setEndDate(new Date(appliedData.endDate));
      setIsRecurring(appliedData.isRecurring);
      setRepeatDays(appliedData.repeatDays);
      return;
    }

    setStartDate(parseDate(initialRecruitStartDate));
    setEndDate(parseDate(initialRecruitEndDate));
    setStartTime(parseTime(initialPartyStartTime));
    setEndTime(parseTime(initialPartyEndTime));
    setIsRecurring(!!initialIsRecurring);
    setRepeatDays(Array.isArray(initialRepeatDays) ? initialRepeatDays : []);
  }, [
    visible,
    initialRecruitStartDate,
    initialRecruitEndDate,
    initialPartyStartTime,
    initialPartyEndTime,
    initialIsRecurring,
    initialRepeatDays,
    appliedData,
  ]);

  const resetToInitial = () => {
    const t1 = new Date();
    t1.setHours(17, 0, 0, 0);
    const t2 = new Date();
    t2.setHours(22, 0, 0, 0);
    setStartTime(t1);
    setEndTime(t2);
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setIsRecurring(false);
    setRepeatDays([]);
  };

  const closeAllPickers = () => {
    setShowStartTime(false);
    setShowEndTime(false);
    setShowStartDate(false);
    setShowEndDate(false);
  };

  const anyPickerOpen = useMemo(
    () => showStartTime || showEndTime || showStartDate || showEndDate,
    [showStartTime, showEndTime, showStartDate, showEndDate],
  );

  // 버튼 활성화 조건
  const timesValid = endTime.getTime() > startTime.getTime();
  const datesValid = endDate.getTime() >= startDate.getTime();
  const repeatValid = !isRecurring || (isRecurring && repeatDays.length > 0);
  const isDisabled = !(timesValid && datesValid && repeatValid);

  // ✅ 수정: applyNow는 "적용하기" 버튼에서만 호출되도록 유지
  const applyNow = useCallback(() => {
    if (isDisabled) return false;

    const payload = {
      isRecurring,
      repeatDays,
      recruitStartDate: toYMD(startDate),
      recruitEndDate: toYMD(endDate),
      partyStartTime: toHMS(startTime),
      partyEndTime: toHMS(endTime),
    };

    setAppliedData({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isRecurring,
      repeatDays: [...repeatDays],
    });

    onSelect(payload);
    return true;
  }, [isDisabled, isRecurring, repeatDays, startDate, endDate, startTime, endTime, onSelect]);

  // ✅ 추가: 피커가 열렸을 때 실제 picker 영역을 measureInWindow로 저장
  const measurePicker = useCallback((key, ref) => {
    if (!ref?.current?.measureInWindow) return;
    ref.current.measureInWindow((x, y, width, height) => {
      pickerRectsRef.current[key] = {x, y, width, height};
    });
  }, []);

  useEffect(() => {
    if (!visible) return;

    const t = setTimeout(() => {
      if (showStartTime) measurePicker('startTime', startTimePickerRef);
      if (showEndTime) measurePicker('endTime', endTimePickerRef);
      if (showStartDate) measurePicker('startDate', startDatePickerRef);
      if (showEndDate) measurePicker('endDate', endDatePickerRef);
    }, 0);

    return () => clearTimeout(t);
  }, [visible, showStartTime, showEndTime, showStartDate, showEndDate, measurePicker]);

  // ✅ 추가: 현재 열려있는 피커 영역 안을 눌렀는지 체크
  const isPressInsideAnyPicker = useCallback(
    (pageX, pageY) => {
      const rects = pickerRectsRef.current;

      const hit = r =>
        !!r &&
        pageX >= r.x &&
        pageX <= r.x + r.width &&
        pageY >= r.y &&
        pageY <= r.y + r.height;

      // 열려있는 피커만 체크
      if (showStartTime && hit(rects.startTime)) return true;
      if (showEndTime && hit(rects.endTime)) return true;
      if (showStartDate && hit(rects.startDate)) return true;
      if (showEndDate && hit(rects.endDate)) return true;

      return false;
    },
    [showStartTime, showEndTime, showStartDate, showEndDate],
  );

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    // ✅ 수정: 피커가 열려있으면 모달 닫지 말고 피커만 닫기 (적용 X)
    if (anyPickerOpen) {
      closeAllPickers();
      return;
    }

    // ✅ 수정: 모달 자체를 적용 안 누르고 닫으면 적용 안됨
    // shouldResetOnClose가 true면 마지막 적용값(or 초기값)으로 원복
    if (shouldResetOnClose) {
      if (appliedData) {
        // 마지막 적용값 복원
        setStartTime(new Date(appliedData.startTime));
        setEndTime(new Date(appliedData.endTime));
        setStartDate(new Date(appliedData.startDate));
        setEndDate(new Date(appliedData.endDate));
        setIsRecurring(appliedData.isRecurring);
        setRepeatDays(appliedData.repeatDays);
      } else {
        // 처음 상태로 초기화
        resetToInitial();
      }
    }

    // 열려있는 피커 접기
    setShowStartTime(false);
    setShowEndTime(false);
    setShowStartDate(false);
    setShowEndDate(false);
    onClose();
  };

  // ✅ 추가: 피커 바깥 아무 곳 눌렀을 때 (피커만 닫기 / 적용 X)
  const handleContainerTouchCapture = useCallback(
    e => {
      if (!anyPickerOpen) return false;

      const {pageX, pageY} = e.nativeEvent || {};
      // 피커 영역 터치면 그대로 두기(닫지 않기)
      if (isPressInsideAnyPicker(pageX, pageY)) return false;

      // 피커 바깥 터치면: 피커만 닫기
      closeAllPickers();
      return true; // 첫 탭은 "닫기 전용"으로 먹기
    },
    [anyPickerOpen, isPressInsideAnyPicker],
  );

  // 요일 멀티 토글
  const toggleDay = key => {
    setRepeatDays(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    if (!applyNow()) return;

    setShowStartTime(false);
    setShowEndTime(false);
    setShowStartDate(false);
    setShowEndDate(false);
    onClose();
  };

  const durationMin = Math.max(0, Math.round((endTime - startTime) / 60000));
  const durationText =
    durationMin >= 60
      ? `${Math.floor(durationMin / 60)}시간${
          durationMin % 60 ? ` ${durationMin % 60}분` : ''
        }`
      : `${durationMin}분`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <TouchableWithoutFeedback onPress={handleModalClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={styles.modalContainer}
              // ✅ 추가: 피커가 열려있을 때, 터치를 캡처해서 "바깥 터치"면 피커만 닫기
              onStartShouldSetResponderCapture={e => handleContainerTouchCapture(e)}
              onResponderRelease={() => {}}
            >
              {/* 헤더 */}
              <View style={styles.header}>
                <Text style={[FONTS.fs_20_semibold, styles.headerTitle]}>
                  이벤트 날짜
                </Text>
                <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
                  <XBtn width={24} height={24} />
                </TouchableOpacity>
              </View>

              {/* 게하 정보 */}
              <ScrollView
                style={styles.body}
                keyboardShouldPersistTaps="handled">
                {/* 시간 */}
                <View style={styles.titleRow}>
                  <Text style={FONTS.fs_16_medium}>이벤트 시간</Text>
                  <Text style={[FONTS.fs_14_medium, styles.grayText]}>
                    {timesValid ? durationText : '시간을 올바르게 선택해 주세요'}
                  </Text>
                </View>

                <View style={[styles.capsuleRow]}>
                  {/* 시작 시간 캡슐 */}
                  <TouchableOpacity
                    style={styles.capsule}
                    onPress={() => {
                      setShowStartTime(v => !v);
                      setShowEndTime(false);
                      setShowStartDate(false);
                      setShowEndDate(false);
                    }}>
                    <Text style={[FONTS.fs_14_regular, styles.capsuleText]}>
                      {fmtTimeKOR(startTime)}
                    </Text>
                    <ClockIcon width={24} height={24} />
                  </TouchableOpacity>

                  {/* 종료 시간 캡슐 */}
                  <TouchableOpacity
                    style={styles.capsule}
                    onPress={() => {
                      setShowEndTime(v => !v);
                      setShowStartTime(false);
                      setShowStartDate(false);
                      setShowEndDate(false);
                    }}>
                    <Text style={[FONTS.fs_14_regular, styles.capsuleText]}>
                      {fmtTimeKOR(endTime)}
                    </Text>
                    <ClockIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>

                {/* 인라인 타임 피커들 (토글) */}
                {showStartTime && (
                  <View
                    style={styles.inlinePicker}
                    ref={startTimePickerRef} // ✅ 추가
                    onLayout={() => measurePicker('startTime', startTimePickerRef)} // ✅ 추가
                  >
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      display="spinner"
                      onChange={(_, d) => d && setStartTime(d)}
                      minuteInterval={Platform.OS === 'ios' ? 10 : undefined}
                      themeVariant="light"
                    />
                  </View>
                )}
                {showEndTime && (
                  <View
                    style={styles.inlinePicker}
                    ref={endTimePickerRef} // ✅ 추가
                    onLayout={() => measurePicker('endTime', endTimePickerRef)} // ✅ 추가
                  >
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      display="spinner"
                      onChange={(_, d) => d && setEndTime(d)}
                      minuteInterval={Platform.OS === 'ios' ? 10 : undefined}
                      themeVariant="light"
                    />
                  </View>
                )}

                {/* 기간 */}
                <View style={[styles.titleRow, {marginTop: 20}]}>
                  <Text style={FONTS.fs_16_medium}>이벤트 공고 기간</Text>
                </View>
                <Text
                  style={[FONTS.fs_12_medium, styles.grayText, {marginTop: 8}]}>
                  반복이 아니면 두 날짜를 동일하게 설정해 주세요
                </Text>

                <View style={[styles.capsuleRow]}>
                  {/* 시작일 캡슐 */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.capsule}
                    onPress={() => {
                      setShowStartDate(v => !v);
                      setShowEndDate(false);
                      setShowStartTime(false);
                      setShowEndTime(false);
                    }}>
                    <Text style={[FONTS.fs_14_regular, styles.capsuleText]}>
                      {fmtYMD(startDate)}
                    </Text>
                    <CalendarIcon width={24} height={24} />
                  </TouchableOpacity>

                  {/* 종료일 캡슐 */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.capsule}
                    onPress={() => {
                      setShowEndDate(v => !v);
                      setShowStartDate(false);
                      setShowStartTime(false);
                      setShowEndTime(false);
                    }}>
                    <Text style={[FONTS.fs_14_regular, styles.capsuleText]}>
                      {fmtYMD(endDate)}
                    </Text>
                    <CalendarIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>

                {/* 인라인 데이트 피커들 (토글) */}
                {showStartDate && (
                  <View
                    style={styles.inlinePicker}
                    ref={startDatePickerRef} // ✅ 추가
                    onLayout={() => measurePicker('startDate', startDatePickerRef)} // ✅ 추가
                  >
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="spinner"
                      onChange={(_, d) => d && setStartDate(d)}
                      themeVariant="light"
                    />
                  </View>
                )}
                {showEndDate && (
                  <View
                    style={styles.inlinePicker}
                    ref={endDatePickerRef} // ✅ 추가
                    onLayout={() => measurePicker('endDate', endDatePickerRef)} // ✅ 추가
                  >
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="spinner"
                      onChange={(_, d) => d && setEndDate(d)}
                      minimumDate={startDate}
                      themeVariant="light"
                    />
                  </View>
                )}

                {/* 반복 여부 */}
                <View
                  style={[styles.titleRow, {marginTop: 20, paddingRight: 12}]}>
                  <Text style={FONTS.fs_16_medium}>반복 여부</Text>
                  <Switch
                    value={isRecurring}
                    onValueChange={setIsRecurring}
                    trackColor={{
                      false: COLORS.grayscale_300,
                      true: COLORS.primary_orange,
                    }}
                    thumbColor={COLORS.grayscale_0}
                  />
                </View>
                <Text
                  style={[FONTS.fs_12_medium, styles.grayText, {marginTop: 4}]}>
                  반복설정을 통해 이벤트을 자동으로 등록할 수 있어요!
                </Text>
                {/* 요일 선택 (반복 on일 때만 표시) */}
                {isRecurring && (
                  <View style={[styles.daysCard]}>
                    {KOR_DAYS.map(({key, label}) => {
                      const selected = repeatDays.includes(key);
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.dayRow}
                          onPress={() => toggleDay(key)}>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              {color: COLORS.grayscale_800},
                            ]}>
                            {label}
                          </Text>
                          {selected ? (
                            <EnabledRadioButton width={28} height={28} />
                          ) : (
                            <DisabledRadioButton width={28} height={28} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                    {repeatDays.length === 0 && (
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.grayText,
                          {alignSelf: 'center', marginTop: 8},
                        ]}>
                        반복 요일을 하나 이상 선택해 주세요
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* 적용하기 버튼 */}
              <ButtonScarlet
                title={'적용하기'}
                onPress={handleConfirm}
                disabled={isDisabled}
                style={{marginBottom: 16}}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MeetDateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    color: COLORS.grayscale_900,
  },
  XBtn: {
    position: 'absolute',
    right: 0,
  },

  body: {flex: 1},

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grayText: {
    color: COLORS.grayscale_500,
  },

  capsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },

  capsule: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capsuleText: {
    color: COLORS.grayscale_600,
  },

  inlinePicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    alignItems: 'center',
    overflow: 'hidden',
  },

  daysCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 32,
  },

  dayRow: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
