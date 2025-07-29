import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollView: {
    flex: 1,
  },
  devide: {
    marginVertical: 28,
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },

  bottomButtonContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  applyButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});
export default styles;
