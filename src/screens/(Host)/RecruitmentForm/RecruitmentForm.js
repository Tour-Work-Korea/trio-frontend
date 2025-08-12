import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
    flex: 1,
  },

  //섹션별 제목
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 20,
  },
  titleBox: {flexDirection: 'row', justifyContent: 'space-between'},
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_500,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },

  //하단
  bottomText: {
    color: COLORS.primary_orange,
    ...FONTS.fs_12_medium,
    textAlign: 'center',
  },
  buttonLocation: {position: 'absolute', bottom: 20, right: 20},
  buttonContainer: {flexDirection: 'row', justifyContent: 'flex-end'},
  addButton: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 10,
  },
  addButtonText: {
    color: COLORS.grayscale_800,
    ...FONTS.fs_14_medium,
  },

  //모달

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },

  //본문
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_900,
  },
  titleLength: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  // 하단 버튼
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginBottom: 16,
  },
  formGroup: {
    flexDirection: 'column',
    gap: 8,
  },

  placeHolder: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    ...FONTS.fs_body,
    color: COLORS.black,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
  },

  // 해시태그
  description: {
    ...FONTS.fs_14_medium,
    color: COLORS.primary_blue,
    marginBottom: 16,
  },
  tagSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    alignContent: 'center',
  },
  tagOptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: 10,
    width: '48%',
  },
  tagOptionText: {
    color: COLORS.grayscale_400,
  },
  tagOptionSelectedText: {
    color: COLORS.primary_orange,
  },

  // Date section styles
  subsectionTitle: {
    ...FONTS.fs_14_semibold,
    color: COLORS.black,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  dateLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },

  // Count section styles
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  countItem: {
    flex: 1,
    marginRight: 8,
  },

  // Age section styles
  ageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ageItem: {
    flex: 1,
    marginRight: 8,
  },
  // Photo section styles
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    marginRight: '3%',
    marginBottom: 12,
    position: 'relative',
  },
  thumbnail: {
    borderColor: COLORS.primary_blue,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Button section styles

  submitButton: {
    backgroundColor: COLORS.scarlet,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.gray,
  },
});

export default styles;
