// KoreanDatePicker.js
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LeftChevron from '@assets/images/chevron_left_gray.svg';
import RightChevron from '@assets/images/chevron_right_gray.svg';

const DOW_HEADER = ['월', '화', '수', '목', '금', '토', '일']; // 월요일 시작
const DOW_KR = ['일', '월', '화', '수', '목', '금', '토']; // 표기용(선택일 포맷)

const pad2 = n => String(n).padStart(2, '0');
const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatSelected = d =>
  `${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}(${DOW_KR[d.getDay()]})`;

export default function DatePicker({
  value, // Date | null
  onChange, // (date: Date) => void
  minDate, // Date (옵션)
  maxDate, // Date (옵션)
  label = '날짜', // 상단 라벨
  style, // 외부 스타일 래핑용
  theme = {}, // 색상/크기 커스터마이즈용
}) {
  const [current, setCurrent] = useState(value ?? new Date()); // 현재 달
  const [selected, setSelected] = useState(value ?? null);

  useEffect(() => {
    if (value instanceof Date) {
      setSelected(value);
      setCurrent(value);
    }
  }, [value]);

  const today = useMemo(() => new Date(), []);
  const year = current.getFullYear();
  const month = current.getMonth(); // 0~11

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  // 월요일 시작 offset (Sun=0 → Mon=0)
  const firstDowSun0 = startOfMonth.getDay(); // 0(일)~6(토)
  const startOffset = (firstDowSun0 + 6) % 7; // 0(월)~6(일)

  const prevMonthDays = new Date(year, month, 0).getDate(); // 이전 달 일수

  // 네비게이션 가능 여부(경계 날짜 옵션 있을 때)
  const canGoPrev =
    !minDate ||
    new Date(year, month, 1) >
      new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext =
    !maxDate ||
    new Date(year, month + 1, 1) <=
      new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

  const goPrev = () => {
    if (!canGoPrev) return;
    setCurrent(new Date(year, month - 1, 1));
  };
  const goNext = () => {
    if (!canGoNext) return;
    setCurrent(new Date(year, month + 1, 1));
  };

  // 6주(42칸) 그리드 생성
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 42; i++) {
      const inPrev = i < startOffset;
      const inCurr = i >= startOffset && i < startOffset + daysInMonth;
      const inNext = i >= startOffset + daysInMonth;
      let day,
        dateObj,
        inMonth = false;

      if (inPrev) {
        day = prevMonthDays - (startOffset - i - 1);
        dateObj = new Date(year, month - 1, day);
      } else if (inCurr) {
        day = i - startOffset + 1;
        dateObj = new Date(year, month, day);
        inMonth = true;
      } else {
        day = i - (startOffset + daysInMonth) + 1;
        dateObj = new Date(year, month + 1, day);
      }

      const disabledByRange =
        (minDate &&
          dateObj <
            new Date(
              minDate.getFullYear(),
              minDate.getMonth(),
              minDate.getDate(),
            )) ||
        (maxDate &&
          dateObj >
            new Date(
              maxDate.getFullYear(),
              maxDate.getMonth(),
              maxDate.getDate(),
            ));

      arr.push({
        key: dateObj.toISOString(),
        label: day,
        date: dateObj,
        inMonth,
        isToday: isSameDay(dateObj, today),
        isSelected: selected ? isSameDay(dateObj, selected) : false,
        disabled: !inMonth || disabledByRange,
      });
    }
    return arr;
  }, [
    year,
    month,
    startOffset,
    daysInMonth,
    prevMonthDays,
    selected,
    minDate,
    maxDate,
    today,
  ]);

  const handleSelect = (date, disabled) => {
    if (disabled) return;
    setSelected(date);
    onChange?.(date);
  };

  return (
    <View style={[styles.card]}>
      {/* 상단 라벨/선택일 */}
      <View style={[styles.headerRow]}>
        <Text style={[styles.labelText, theme.labelText]}>{label}</Text>
        <Text style={[styles.valueText, theme.valueText]}>
          {selected ? formatSelected(selected) : '선택'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* 월 네비 + 제목 */}
      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={goPrev}
          disabled={!canGoPrev}
          style={[styles.navBtn, !canGoPrev && {opacity: 0.3}]}>
          <LeftChevron width={24} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, theme.monthTitle]}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity
          onPress={goNext}
          disabled={!canGoNext}
          style={[styles.navBtn, !canGoNext && {opacity: 0.3}]}>
          <RightChevron width={24} />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.dowRow}>
        {DOW_HEADER.map(d => (
          <Text key={d} style={styles.dowText}>
            {d}
          </Text>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.grid}>
        {cells.map(c => (
          <TouchableOpacity
            key={c.key}
            onPress={() => handleSelect(c.date, c.disabled)}
            disabled={c.disabled}
            style={[styles.cell]}>
            <Text
              style={[
                styles.dayText,
                !c.inMonth && styles.dayTextOut,
                c.isSelected && styles.dayTextSelected,
              ]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {...FONTS.fs_16_medium, color: COLORS.grayscale_900},
  valueText: {...FONTS.fs_14_semibold, color: COLORS.primary_blue},
  divider: {borderWidth: 0.8, borderColor: COLORS.grayscale_200, width: '100%'},
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  monthTitle: {...FONTS.fs_16_semibold, color: COLORS.grayscale_900},

  dowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dowText: {
    textAlign: 'center',
    color: COLORS.grayscale_400,
    ...FONTS.fs_14_medium,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dayText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
  dayTextOut: {
    color: COLORS.grayscale_300,
  },
  dayTextSelected: {
    color: COLORS.grayscale_0,
    backgroundColor: COLORS.primary_orange,
    borderRadius: 100,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});
