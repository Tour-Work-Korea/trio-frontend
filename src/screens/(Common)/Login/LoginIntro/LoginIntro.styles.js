import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  signin: {
    backgroundColor: COLORS.white,
    flex: 1,
    color: COLORS.grayscale_900,
  },
  buttonFlexBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    alignSelf: 'stretch',
    gap: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoParent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column',
    gap: 20,
  },
  pathIcon: {
    height: '93.33%',
    top: '3.33%',
    bottom: '3.33%',
    left: '0%',
    right: '0%',
    maxHeight: '100%',
    width: '100%',
  },
  text: {
    ...FONTS.fs_16_semibold,
  },
  titleText: {
    ...FONTS.fs_20_bold,
    textAlign: 'center',
  },
  hiddenButton: {
    opacity: 0,
  },
  naverButton: {
    backgroundColor: '#00de5a',
  },
  mailButton: {
    backgroundColor: '#eaebed',
  },
  kakaoButton: {
    backgroundColor: '#fee500',
  },
  buttonParent: {
    gap: 8,
    alignSelf: 'stretch',
  },
  textGray: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
  },
  frameParent: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
  },
  view: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 0,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },
});

export default styles;
