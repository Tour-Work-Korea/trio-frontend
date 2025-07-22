import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    paddingTop: 30,
  },
  section: {
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  //헤더
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 20,
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },

  //이력서 리스트
  sectionTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
  },
  resumeItem: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  resumeLeftSection: {
    justifyContent: 'center',
  },
  resumeMiddleSection: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'column',
    gap: 12,
    flex: 1,
  },
  resumeTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
  //태그
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tagText: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  //수정
  modifiedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modifiedTextBox: {
    flexDirection: 'row',
    gap: 8,
  },
  lastModifiedText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  editButton: {
    justifyContent: 'center',
    padding: 4,
  },
  //약관동의
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
  },
  checked: {
    borderColor: COLORS.primary_orange,
  },
  textBlue: {
    color: COLORS.primary_blue,
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

  //
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    padding: 12,
  },
  datePickerLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
    marginBottom: 8,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  messageInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    padding: 16,
    height: 150,
    ...FONTS.fs_body,
    textAlignVertical: 'top',
  },

  //하단바
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: COLORS.scarlet,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});
export default styles;
