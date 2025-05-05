import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.stroke_gray,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    ...FONTS.fs_body,
    color: COLORS.black,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },

  // Tag section styles
  tagDescription: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginBottom: 16,
  },
  tagGrid: {
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: COLORS.scarlet,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.scarlet,
  },
  tagText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  addTagButton: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addTagButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.gray,
  },

  // Date section styles
  subsectionTitle: {
    ...FONTS.fs_body_bold,
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
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  dateLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
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
  countLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
    marginBottom: 4,
  },
  countInput: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    ...FONTS.fs_body,
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
  ageLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
    marginBottom: 4,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    padding: 12,
    ...FONTS.fs_body,
  },

  // Photo section styles
  photoSectionTitle: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  photoDescription: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginBottom: 12,
  },
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
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
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
  removePhotoText: {
    ...FONTS.fs_body_bold,
    color: COLORS.gray,
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
