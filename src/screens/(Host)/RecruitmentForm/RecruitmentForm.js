import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollContainer: {
    padding: 16,
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
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
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
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
