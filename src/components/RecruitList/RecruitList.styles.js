import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  searchSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stroke_gray,
    paddingBottom: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...FONTS.fs_body,
    color: COLORS.black,
    padding: 0,
  },
  searchButton: {
    backgroundColor: COLORS.scarlet,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  bodyContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButtonText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginRight: 4,
  },
  categoryChipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.light_gray,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.stroke_gray,
  },
  categoryChipText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  selectedCategoryChipText: {
    color: COLORS.black,
  },
  jobItem: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  jobItemContent: {
    flexDirection: 'row',
    alignContents: 'center',
  },
  jobImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  jobDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobType: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  deadline: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  jobTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    ...FONTS.fs_body_bold,
    color: COLORS.scarlet,
    marginRight: 8,
  },
  jobLocation: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginBottom: 1,
  },
  jobPeriod: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 2,
  },
  applyButton: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  applyButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  separator: {
    height: 16,
  },
});
export default styles;
