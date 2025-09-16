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
  },

  //본문
  applyHeaderBox: {marginBottom: 8, marginTop: 20},
  applyHeaderText: {...FONTS.fs_14_semibold, color: COLORS.grayscale_500},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {...FONTS.fs_14_semibold, color: COLORS.grayscale_500},
  //카드
  applicantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  applyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  applyBox: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
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
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  introductionText: {
    ...FONTS.fs_14_medium,
    color: COLORS.primary_orange,
  },
  tagsRow: {
    flexDirection: 'row',
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
  infoLabel: {...FONTS.fs_14_medium, color: COLORS.grayscale_400, width: 80},
  infoValue: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    flex: 1,
  },
});
