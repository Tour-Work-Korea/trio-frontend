import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  scrollContent: {
    gap: 16,
    flexGrow: 1,
  },
  //검색창
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 20,
    paddingHorizontal: 8,
    height: 40,
    marginHorizontal: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    padding: 0,
    flex: 1,
  },
  //공고
  employContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  titleText: {...FONTS.fs_16_semibold, color: COLORS.grayscale_800},
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_400,
  },
});
export default styles;
