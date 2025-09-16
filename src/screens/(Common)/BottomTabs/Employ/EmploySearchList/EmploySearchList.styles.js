import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  headerBox: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  titleText: {...FONTS.fs_14_medium, color: COLORS.grayscale_500},
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
