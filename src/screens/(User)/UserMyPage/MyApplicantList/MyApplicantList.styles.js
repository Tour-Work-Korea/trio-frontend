import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: COLORS.grayscale_0,
  },

  headerBox: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },

  //공고 카드
  RecruitCard: {
    borderRadius: 8,
    paddingVertical: 16,
    gap: 12,
  },
  jobSmall: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: COLORS.grayscale_200,
  },
  jobDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  jobType: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
  },
  deadline: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    flexShrink: 0,
  },
  jobTitle: {
    flex: 1,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
  jobItemContent: {
    flexDirection: 'row',
    alignContents: 'center',
  },
  applyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  applyText: {
    color: COLORS.grayscale_500,
    ...FONTS.fs_12_medium,
  },
  divider: {
    borderWidth: 0.4,
    borderColor: COLORS.grayscale_300,
  },
});
