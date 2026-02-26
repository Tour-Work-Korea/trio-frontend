import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  body: {
    position: 'relative',
    backgroundColor: COLORS.grayscale_0,
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  searchFilterBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
  },

  // 날짜 선택
  dateSelectContainer: {
    position: 'relative',
    zIndex: 12,
  },
  dateSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
  },
  calendarContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
  },

  // 룸 리스트
  sectionTitle: {
    textAlign: 'center',
    color: COLORS.grayscale_900,
    marginTop: 4,
    marginBottom: 4,
  },
  normalSectionTitle: {
    marginTop: 8,
  },
  roomList: {
    gap: 12,
  },
  roomCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  roomTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  roomName: {
    color: COLORS.grayscale_900,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  roomRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  exposureBadge: {
    width: 60,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  exposureBadgeOff: {
    borderColor: COLORS.grayscale_500,
  },
  exposureBadgeOn: {
    borderColor: COLORS.primary_orange,
  },
  exposureTextOff: {
    color: COLORS.grayscale_500,
  },
  exposureTextOn: {
    color: COLORS.primary_orange,
  },
  bedControlRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  bedControlLabel: {
    color: COLORS.grayscale_900,
    marginRight: 2,
  },
  bedControlButton: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedCountText: {
    minWidth: 18,
    textAlign: 'center',
    color: COLORS.grayscale_900,
  },
});
