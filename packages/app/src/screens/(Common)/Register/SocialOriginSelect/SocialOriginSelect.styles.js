import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: COLORS.grayscale_0,
  },
  header: {gap: 24},
  title: {...FONTS.fs_22_bold, color: COLORS.grayscale_900, textAlign: 'center'},
  description: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 21,
  },
  optionGroup: {gap: 14, marginTop: 32},
  option: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 176,
    gap: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  optionSelected: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.grayscale_50,
  },
  selectedMark: {position: 'absolute', right: 16, top: 16},
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  foreignIcon: {backgroundColor: COLORS.grayscale_100},
  optionEmoji: {fontSize: 30},
  optionText: {alignItems: 'center', gap: 4},
  optionTitle: {...FONTS.fs_18_semibold, color: COLORS.grayscale_900},
  optionEnglishTitle: {...FONTS.fs_12_medium, color: COLORS.grayscale_400},
  optionDescription: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {gap: 16},
  secureText: {...FONTS.fs_12_medium, color: COLORS.grayscale_400, textAlign: 'center'},
});
