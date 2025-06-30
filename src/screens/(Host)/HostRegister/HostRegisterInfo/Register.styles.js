import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '../../../../constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  agreementSection: {
    marginBottom: 20,
    backgroundColor: COLORS.background_gray,
    padding: 15,
    borderRadius: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.scarlet,
    borderColor: COLORS.scarlet,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  requiredAgreements: {
    marginLeft: 10,
  },
  requiredTag: {
    color: COLORS.scarlet,
  },
  verificationSection: {
    marginBottom: 20,
    backgroundColor: COLORS.background_gray,
    padding: 15,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'column',
  },
  sectionTitle: {
    ...FONTS.fs_body_bold,
    marginBottom: 5,
  },
  sectionDescription: {
    ...FONTS.fs_body,
    color: COLORS.dark_gray,
    marginBottom: 10,
  },
  verifyButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  verifyButtonText: {
    ...FONTS.fs_body,
    color: COLORS.white,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.fs_body_bold,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    ...FONTS.fs_body,
  },
  fullInput: {
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    ...FONTS.fs_body,
  },
  verifyCodeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  verifyCodeButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  confirmButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  confirmButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  disabledButton: {
    backgroundColor: COLORS.light_gray,
    borderColor: COLORS.light_gray,
  },
  signupButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});
