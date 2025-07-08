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
    paddingBottom: 80,
  },
  title: {
    ...FONTS.fs_h1_bold,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.fs_body_bold,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    ...FONTS.fs_body,
    justifyContent: 'center',
  },
  inputText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  placeholderText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  genderContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 40,
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
  genderText: {
    ...FONTS.fs_body,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknameInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    ...FONTS.fs_body,
  },
  checkButton: {
    position: 'absolute',
    right: 10,
    paddingHorizontal: 10,
  },
  checkButtonText: {
    ...FONTS.fs_body_small,
    color: COLORS.scarlet,
  },
  nextButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  nextButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});
export default styles;
