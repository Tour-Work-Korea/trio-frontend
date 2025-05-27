import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    ...FONTS.fs_h1_bold,
    textAlign: 'center',
    marginBottom: 60,
  },
  inputSection: {
    marginBottom: 30,
  },
  label: {
    ...FONTS.fs_body_bold,
    marginBottom: 10,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    ...FONTS.fs_body,
  },
  verifyButton: {
    position: 'absolute',
    right: 10,
    paddingHorizontal: 10,
  },
  verifyButtonText: {
    ...FONTS.fs_body_small,
    color: COLORS.scarlet,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    ...FONTS.fs_body,
  },
  timer: {
    position: 'absolute',
    right: 15,
    ...FONTS.fs_body,
    color: COLORS.scarlet,
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  resendText: {
    ...FONTS.fs_body_small,
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  disabledText: {
    color: COLORS.stroke_gray,
  },
  nextButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  disabledButton: {
    backgroundColor: COLORS.scarlet,
  },
  nextButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});

export default styles;
