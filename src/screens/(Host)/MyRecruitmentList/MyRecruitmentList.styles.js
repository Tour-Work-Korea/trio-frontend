import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  //공고 없는 경우
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_500,
    marginBottom: 12,
  },
  emptySubTitle: {
    ...FONTS.fs_18_regular,
    color: COLORS.grayscale_500,
  },

  //본문
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postingCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  guestHouseText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'visible',
  },
  title: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  icon: {
    width: 24,
    height: 24,
    color: COLORS.grayscale_500,
  },
  deleteButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
});
