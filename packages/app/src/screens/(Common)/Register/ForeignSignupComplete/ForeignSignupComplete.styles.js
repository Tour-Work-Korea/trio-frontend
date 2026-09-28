import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 88,
    paddingBottom: 40,
    backgroundColor: COLORS.grayscale_0,
  },
  main: {alignItems: 'center'},
  title: {
    ...FONTS.fs_22_bold,
    color: COLORS.grayscale_900,
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 22,
  },
  description: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  summaryCard: {
    alignSelf: 'stretch',
    marginTop: 48,
    padding: 18,
    gap: 15,
    borderRadius: 14,
    backgroundColor: COLORS.secondary_orange,
  },
  summaryTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  summaryTitle: {...FONTS.fs_16_semibold, color: COLORS.grayscale_900},
  divider: {height: 1, backgroundColor: COLORS.grayscale_0},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12},
  label: {...FONTS.fs_12_medium, color: COLORS.grayscale_500, flex: 1},
  value: {...FONTS.fs_14_semibold, color: COLORS.grayscale_800},
  badge: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_orange,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  button: {},
});
