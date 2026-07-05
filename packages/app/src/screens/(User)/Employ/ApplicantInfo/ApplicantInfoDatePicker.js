import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import LeftChevron from '@assets/images/chevron_left_gray.svg';
import RightChevron from '@assets/images/chevron_right_gray.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const DOW_HEADER = ['월', '화', '수', '목', '금', '토', '일'];
const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

const pad2 = value => String(value).padStart(2, '0');
const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatSelected = date =>
  `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}(${
    DOW_KR[date.getDay()]
  })`;

const ApplicantInfoDatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  label = '날짜',
  style,
}) => {
  const [current, setCurrent] = useState(value ?? new Date());
  const [selected, setSelected] = useState(value ?? null);

  useEffect(() => {
    if (value instanceof Date) {
      setSelected(value);
      setCurrent(value);
    }
  }, [value]);

  const today = useMemo(() => new Date(), []);
  const year = current.getFullYear();
  const month = current.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const firstDowSun0 = startOfMonth.getDay();
  const startOffset = (firstDowSun0 + 6) % 7;
  const prevMonthDays = new Date(year, month, 0).getDate();
  const canGoPrev =
    !minDate ||
    new Date(year, month, 1) >
      new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext =
    !maxDate ||
    new Date(year, month + 1, 1) <=
      new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);

  const cells = useMemo(() => {
    const nextCells = [];

    for (let index = 0; index < 42; index += 1) {
      const inPrev = index < startOffset;
      const inCurr = index >= startOffset && index < startOffset + daysInMonth;
      let day;
      let dateObj;
      let inMonth = false;

      if (inPrev) {
        day = prevMonthDays - (startOffset - index - 1);
        dateObj = new Date(year, month - 1, day);
      } else if (inCurr) {
        day = index - startOffset + 1;
        dateObj = new Date(year, month, day);
        inMonth = true;
      } else {
        day = index - (startOffset + daysInMonth) + 1;
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

      nextCells.push({
        key: `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`,
        label: day,
        date: dateObj,
        inMonth,
        isToday: isSameDay(dateObj, today),
        isSelected: selected ? isSameDay(dateObj, selected) : false,
        disabled: !inMonth || disabledByRange,
      });
    }

    return nextCells;
  }, [
    daysInMonth,
    maxDate,
    minDate,
    month,
    prevMonthDays,
    selected,
    startOffset,
    today,
    year,
  ]);

  const handleSelect = (date, disabled) => {
    if (disabled) {
      return;
    }

    setSelected(date);
    onChange?.(date);
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.valueText}>
          {selected ? formatSelected(selected) : '선택'}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={() => canGoPrev && setCurrent(new Date(year, month - 1, 1))}
          disabled={!canGoPrev}
          style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}>
          <LeftChevron width={24} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity
          onPress={() => canGoNext && setCurrent(new Date(year, month + 1, 1))}
          disabled={!canGoNext}
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}>
          <RightChevron width={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.dowRow}>
        {DOW_HEADER.map(day => (
          <Text key={day} style={styles.dowText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(cell => (
          <TouchableOpacity
            key={cell.key}
            onPress={() => handleSelect(cell.date, cell.disabled)}
            disabled={cell.disabled}
            style={styles.cell}>
            {cell.isSelected ? (
              <View style={styles.selectedDayCircle}>
                <Text style={[styles.dayText, styles.dayTextSelected]}>
                  {cell.label}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.dayText,
                  cell.disabled && styles.dayTextDisabled,
                ]}>
                {cell.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

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
  labelText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_900,
  },
  valueText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.primary_blue,
  },
  divider: {
    borderWidth: 0.8,
    borderColor: COLORS.grayscale_200,
    width: '100%',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  monthTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  navButton: {
    padding: 2,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary_orange,
  },
  dayText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  dayTextDisabled: {
    color: COLORS.grayscale_300,
  },
  dayTextSelected: {
    color: COLORS.grayscale_0,
    lineHeight: 18,
  },
});

export default ApplicantInfoDatePicker;
