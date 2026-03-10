import { StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  guesthouseBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
  },
  guesthouseSelectContainer: {
    position: 'relative',
    zIndex: 13,
  },
  guesthouseSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    gap: 8,
  },
  guesthouseSelectText: {
    flex: 1,
    color: COLORS.grayscale_900,
  },
  guesthouseDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },
  guesthouseOption: {
    paddingVertical: 8,
  },
  guesthouseOptionText: {
    color: COLORS.grayscale_900,
  },
  selectedGuesthouseText: {
    color: COLORS.primary_orange,
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
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
