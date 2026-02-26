import { StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // 달력
  calendarContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // 예약 리스트
  listContainer: {
    flex: 1,
    marginTop: 28,
    paddingHorizontal: 8,
  },
  listDateTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  reservationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  statusBadge: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  statusBadgeText: {
  },
  reservationInfo: {
    flex: 1,
    gap: 4,
  },
  roomName: {
    color: COLORS.grayscale_900,
  },
  periodText: {
    color: COLORS.grayscale_900,
  },
});
