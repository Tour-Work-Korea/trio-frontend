import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  scrollView: {
    flex: 1,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilterButton: {
    backgroundColor: COLORS.stroke_gray,
  },
  filterButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  latestHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
  },
  highlightedText: {
    color: COLORS.scarlet,
  },
  subTitle: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  pageIndicator: {
    ...FONTS.fs_body_bold,
    color: COLORS.scarlet,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
    marginRight: 4,
  },
  applicantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  favoriteButton: {
    padding: 4,
  },
  applicantInfo: {
    flexDirection: 'row',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  nameText: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    textAlign: 'center',
  },
  genderAgeText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  introductionText: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  hashTag: {
    ...FONTS.fs_body,
    color: COLORS.scarlet,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
    width: 50,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    flex: 1,
  },
  careerYears: {
    ...FONTS.fs_body_bold,
    color: COLORS.scarlet,
    marginTop: 8,
  },
  separator: {
    height: 8,
  },
});

export default styles;
