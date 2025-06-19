import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stroke_gray,
  },
  headerTitle: {
    ...FONTS.fs_h1_bold,
    color: COLORS.black,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stroke_gray,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 16,
  },
  resumeItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    padding: 16,
    marginBottom: 12,
  },
  resumeLeftSection: {
    marginRight: 12,
    justifyContent: 'center',
  },
  resumeMiddleSection: {
    flex: 1,
  },
  resumeTitle: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagText: {
    ...FONTS.fs_body,
    color: COLORS.scarlet,
  },
  lastModifiedText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  editButton: {
    justifyContent: 'center',
    padding: 4,
  },
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
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.scarlet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  privacyTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  requiredText: {
    color: COLORS.scarlet,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalText: {
    ...FONTS.fs_body,
    color: COLORS.black,
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: COLORS.scarlet,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
  bottomPadding: {
    height: 80,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.stroke_gray,
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
