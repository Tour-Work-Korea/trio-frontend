import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  signin: {
    backgroundColor: COLORS.white,
    flex: 1,
    color: COLORS.grayscale_900,
  },
  logoParent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonParent: {
    gap: 12,
    alignSelf: 'stretch',
  },
  frameParent: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  view: {
    paddingBottom: 60,
    paddingHorizontal: 20,
    gap: 0,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },
});

export default styles;
