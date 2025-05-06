import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // 하단 버튼 영역 확보
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  editMemberButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editMemberButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6E9F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileName: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    textAlign: 'right',
  },
  experienceTotal: {
    ...FONTS.fs_body,
    color: COLORS.scarlet,
  },
  experienceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  experiencePeriod: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  experienceActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  experienceCompany: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  experienceDuties: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  addButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  currentJobSection: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  formLabel: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 12,
    ...FONTS.fs_body,
    marginBottom: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  datePickerButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  textAreaInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 12,
    ...FONTS.fs_body,
    height: 150,
  },
  tagDescription: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginBottom: 16,
  },
  tagRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
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
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  attachmentName: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  deleteAttachmentButton: {
    padding: 4,
  },
  uploadFileButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadFileText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  bottomPadding: {
    height: 80,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.stroke_gray,
  },
  submitButton: {
    backgroundColor: COLORS.scarlet,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});

export default styles;
