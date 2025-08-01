import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
    color: COLORS.grayscale_900,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  viewFlexBox: {
    gap: 0,
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    minHeightL: '100%',
    paddingHorizontal: 20,
    // justifyContent: 'space-between',
  },
  groupParent: {
    paddingVertical: 0,
    gap: 12,
    alignSelf: 'stretch',
    marginBottom: 28,
  },
  titleText: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_900,
  },
  inputGroup: {
    marginTop: 40,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  rowBox: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    width: '100%',
  },
  validDefaultText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  validText: {
    color: COLORS.semantic_green,
  },
  invalidText: {
    color: COLORS.semantic_red,
  },
  inputLabel: {...FONTS.fs_16_semibold},
  inputBox: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_900,
  },
  inputButton: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
  },
  inputButtonAbsolute: {
    position: 'absolute',
    right: 4,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resendText: {...FONTS.fs_12_medium, color: COLORS.grayscale_400},
  resendContainer: {
    textAlign: 'right',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
  },
});
