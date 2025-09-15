import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 12,
  },
  //공고 없는 경우
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_500,
    marginBottom: 12,
  },
  emptySubTitle: {
    ...FONTS.fs_18_regular,
    color: COLORS.grayscale_500,
  },
});
