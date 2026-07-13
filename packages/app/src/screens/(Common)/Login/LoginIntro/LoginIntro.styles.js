import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  signin: {
    backgroundColor: COLORS.grayscale_0,
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
  loginButtonWrapper: {
    position: 'relative',
  },
  recentBadge: {
    position: 'absolute',
    right: 10,
    top: -18,
    zIndex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.primary_orange,
  },
  recentBadgeTail: {
    position: 'absolute',
    right: 16,
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary_orange,
  },
  recentBadgeText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_0,
    lineHeight: 12,
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
