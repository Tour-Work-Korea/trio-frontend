import { Platform } from 'react-native';

const getFont = (weight) =>
  Platform.select({
    ios: `Pretendard-${weight}`,
    android: `Pretendard-${weight}`,
  });

export const FONTS = {
  // 12
  fs_12_light: {
    fontSize: 12,
    fontFamily: getFont('Light'),
  },
  fs_12_medium: {
    fontSize: 12,
    fontFamily: getFont('Medium'),
  },

  // 14
  fs_14_light: {
    fontSize: 14,
    fontFamily: getFont('Light'),
  },
  fs_14_regular: {
    fontSize: 14,
    fontFamily: getFont('Regular'),
  },
  fs_14_medium: {
    fontSize: 14,
    fontFamily: getFont('Medium'),
  },
  fs_14_semibold: {
    fontSize: 14,
    fontFamily: getFont('SemiBold'),
  },

  // 16
  fs_16_regular: {
    fontSize: 16,
    fontFamily: getFont('Regular'),
  },
  fs_16_medium: {
    fontSize: 16,
    fontFamily: getFont('Medium'),
  },
  fs_16_semibold: {
    fontSize: 16,
    fontFamily: getFont('SemiBold'),
  },

  // 18
  fs_18_regular: {
    fontSize: 18,
    fontFamily: getFont('Regular'),
  },
  fs_18_medium: {
    fontSize: 18,
    fontFamily: getFont('Medium'),
  },
  fs_18_semibold: {
    fontSize: 18,
    fontFamily: getFont('SemiBold'),
  },
  fs_18_bold: {
    fontSize: 18,
    fontFamily: getFont('Bold'),
  },

  // 20
  fs_20_medium: {
    fontSize: 20,
    fontFamily: getFont('Medium'),
  },
  fs_20_semibold: {
    fontSize: 20,
    fontFamily: getFont('SemiBold'),
  },
  fs_20_bold: {
    fontSize: 20,
    fontFamily: getFont('Bold'),
  },

  // 22
  fs_22_medium: {
    fontSize: 22,
    fontFamily: getFont('Medium'),
  },
  fs_22_semibold: {
    fontSize: 22,
    fontFamily: getFont('SemiBold'),
  },
  fs_22_bold: {
    fontSize: 22,
    fontFamily: getFont('Bold'),
  },
};
