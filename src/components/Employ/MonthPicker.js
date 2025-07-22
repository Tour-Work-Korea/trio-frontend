import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import dayjs from 'dayjs';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import LeftChevron from '@assets/images/chevron_left_gray.svg';
import RightChevron from '@assets/images/chevron_right_gray.svg';

const MonthPicker = ({selectedDate, onChange}) => {
  const [currentYear, setCurrentYear] = useState(dayjs().year());

  const months = Array.from({length: 12}, (_, i) => i + 1);

  const handlePrevYear = () => setCurrentYear(prev => prev - 1);
  const handleNextYear = () => setCurrentYear(prev => prev + 1);

  return (
    <View style={styles.container}>
      {/* 연도 이동 */}
      <View style={styles.yearHeader}>
        <TouchableOpacity onPress={handlePrevYear}>
          <LeftChevron width={24} />
        </TouchableOpacity>
        <Text style={styles.yearText}>{currentYear}</Text>
        <TouchableOpacity onPress={handleNextYear}>
          <RightChevron width={24} />
        </TouchableOpacity>
      </View>

      {/* 월 목록 */}
      <View style={styles.monthGrid}>
        {months.map(month => {
          const isSelected =
            selectedDate?.year === currentYear && selectedDate?.month === month;

          return (
            <TouchableOpacity
              key={month}
              style={[styles.monthButton, isSelected && styles.selectedMonth]}
              onPress={() => onChange({year: currentYear, month: month})}>
              <Text style={isSelected ? styles.selectedText : styles.monthText}>
                {month}월
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  yearText: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '25%',
    alignItems: 'center',
    marginTop: 20,
  },
  monthText: {
    color: COLORS.grayscale_400,
    ...FONTS.fs_16_medium,
  },
  selectedText: {
    color: COLORS.primary_orange,
    ...FONTS.fs_16_semibold,
  },
});

export default MonthPicker;
