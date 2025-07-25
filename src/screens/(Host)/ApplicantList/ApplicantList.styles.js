import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    paddingHorizontal: 20,
    flex: 1,
  },
  scrollView: {
    marginTop: 12,
    flex: 1,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    paddingVertical: 12,
  },
  tagButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilterButton: {
    backgroundColor: COLORS.stroke_gray,
  },
  tagText: {
    ...FONTS.fs_body,
    color: COLORS.primary_blue,
  },
  //드롭다운
  dropdown: {
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    paddingHorizontal: 20,
  },

  //지원 아이템
  applicantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
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
  applicantInfo: {
    flexDirection: 'row',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
    ...FONTS.fs_14_medium,
    color: COLORS.primary_orange,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  hashTag: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {...FONTS.fs_14_medium, color: COLORS.grayscale_400, width: 50},
  infoValue: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
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
