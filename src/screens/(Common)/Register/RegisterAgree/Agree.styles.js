import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  signin: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  viewFlexBox: {
    gap: 0,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },

  iconPosition: {
    maxWidth: '100%',
    top: '50%',
    position: 'absolute',
    overflow: 'hidden',
  },

  parentWrapperFlexBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    height: 28,
    borderWidth: 1,
    borderStyle: 'solid',
    width: 28,
    borderRadius: 4,
    borderColor: COLORS.grayscale_300,
    overflow: 'hidden',
    alignContent: 'center',
    justifyContent: 'center',
    paddingLeft: 1,
  },
  checked: {
    borderColor: COLORS.scarlet,
  },
  textBlue: {
    color: COLORS.primary_blue,
  },
  titleText: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_900,
  },
  groupParent: {
    paddingVertical: 0,
    gap: 12,
    alignSelf: 'stretch',
  },
  textAllAgree: {
    textAlign: 'left',
    ...FONTS.fs_14_semibold,
  },
  checkboxParent: {
    gap: 12,
    alignSelf: 'stretch',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: COLORS.grayscale_400,
  },
  textRequired: {
    ...FONTS.fs_14_semibold,
  },
  textAgreeTitle: {
    color: COLORS.grayscale_600,
    ...FONTS.fs_14_regular,
  },
  parent: {
    gap: 4,
  },
  textSmall: {
    ...FONTS.fs_12_medium,
  },
  frameContainer: {
    gap: 0,
    justifyContent: 'space-between',
    flex: 1,
  },
  checkboxGroup: {
    gap: 12,
    flex: 1,
  },
  frameWrapper: {
    alignSelf: 'stretch',
    width: 335,
    alignContent: 'center',
    justifyContent: 'center',
  },
  frameGroup: {
    gap: 12,
  },

  frameParent: {
    alignSelf: 'stretch',
    gap: 40,
  },
});
