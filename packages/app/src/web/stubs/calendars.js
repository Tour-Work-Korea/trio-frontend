import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export const LocaleConfig = {
  locales: {},
  defaultLocale: 'ko',
};

const DAY_MS = 24 * 60 * 60 * 1000;

const pad = value => String(value).padStart(2, '0');

const toDate = value => {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  const [year, month = 1, day = 1] = String(value)
    .slice(0, 10)
    .split('-')
    .map(Number);

  return new Date(year, month - 1, day, 12);
};

const toDateString = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toCalendarDay = date => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
  timestamp: date.getTime(),
  dateString: toDateString(date),
});

const getMonthDays = ({current, firstDay = 0, hideExtraDays = false}) => {
  const currentDate = toDate(current);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstOfMonth = new Date(year, month, 1, 12);
  const lastOfMonth = new Date(year, month + 1, 0, 12);
  const firstWeekday = (firstOfMonth.getDay() - firstDay + 7) % 7;
  const totalCells = Math.ceil((firstWeekday + lastOfMonth.getDate()) / 7) * 7;
  const startTime = firstOfMonth.getTime() - firstWeekday * DAY_MS;

  return Array.from({length: totalCells}, (_, index) => {
    const date = new Date(startTime + index * DAY_MS);
    const isCurrentMonth = date.getMonth() === month;

    return {
      date,
      isCurrentMonth,
      hidden: hideExtraDays && !isCurrentMonth,
    };
  });
};

const compareDateString = (left, right) =>
  String(left).slice(0, 10).localeCompare(String(right).slice(0, 10));

const getDayState = ({dateString, isCurrentMonth, minDate, maxDate}) => {
  if (!isCurrentMonth) {
    return 'disabled';
  }

  if (minDate && compareDateString(dateString, minDate) < 0) {
    return 'disabled';
  }

  if (maxDate && compareDateString(dateString, maxDate) > 0) {
    return 'disabled';
  }

  return '';
};

const weekdayLabels = firstDay => {
  const labels = ['일', '월', '화', '수', '목', '금', '토'];
  return labels.slice(firstDay).concat(labels.slice(0, firstDay));
};

export function Calendar({
  current,
  dayComponent,
  disableAllTouchEventsForDisabledDays,
  firstDay = 0,
  hideArrows,
  hideDayNames,
  hideExtraDays = false,
  markedDates = {},
  maxDate,
  minDate,
  onDayPress,
  onMonthChange,
  renderHeader,
  style,
  theme = {},
}) {
  const currentDate = toDate(current);
  const days = getMonthDays({current, firstDay, hideExtraDays});
  const title = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

  const pressDay = day => {
    onDayPress?.(day);
  };

  const renderDefaultDay = ({date, state}) => {
    const dateString = date.dateString;
    const mark = markedDates?.[dateString] || {};
    const isDisabled = state === 'disabled' || mark.disabled;
    const isMarked = Boolean(mark.color || mark.selected || mark.startingDay || mark.endingDay);
    const backgroundColor = mark.color || (mark.selected ? mark.selectedColor : undefined);
    const textColor =
      mark.textColor ||
      mark.selectedTextColor ||
      (isDisabled ? '#c9cdd2' : theme.textSectionTitleColor || '#111827');

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={isDisabled && disableAllTouchEventsForDisabledDays}
        onPress={() => pressDay(date)}
        style={[
          styles.dayButton,
          isMarked && styles.markedDay,
          backgroundColor ? {backgroundColor} : null,
          mark.startingDay && styles.startingDay,
          mark.endingDay && styles.endingDay,
        ]}>
        <Text
          style={[
            styles.dayText,
            {
              color: textColor,
              fontFamily: theme.textDayFontFamily,
              fontSize: theme.textDayFontSize || 14,
              fontWeight: theme.textDayFontWeight,
            },
          ]}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderHeader ? renderHeader(currentDate) : (
        <View style={styles.header}>
          {!hideArrows && <Text style={styles.arrowPlaceholder}>‹</Text>}
          <Text style={styles.headerText}>{title}</Text>
          {!hideArrows && <Text style={styles.arrowPlaceholder}>›</Text>}
        </View>
      )}
      {!hideDayNames && (
        <View style={styles.weekRow}>
          {weekdayLabels(firstDay).map(day => (
            <Text key={day} style={styles.weekText}>
              {day}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.grid}>
        {days.map(({date, hidden, isCurrentMonth}) => {
          const day = toCalendarDay(date);
          const state = getDayState({
            dateString: day.dateString,
            isCurrentMonth,
            minDate,
            maxDate,
          });

          return (
            <View key={day.dateString} style={styles.cell}>
              {hidden ? null : dayComponent
                ? dayComponent({date: day, state, marking: markedDates?.[day.dateString]})
                : renderDefaultDay({date: day, state})}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function CalendarList(props) {
  return <Calendar {...props} />;
}

export function Agenda(props) {
  return <View {...props} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  arrowPlaceholder: {
    color: '#111827',
    fontSize: 24,
    marginHorizontal: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekText: {
    color: '#9EA3A7',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dayButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    minWidth: 36,
    paddingHorizontal: 8,
  },
  markedDay: {
    borderRadius: 0,
    width: '100%',
  },
  startingDay: {
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  endingDay: {
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
  },
  dayText: {
    textAlign: 'center',
  },
});
