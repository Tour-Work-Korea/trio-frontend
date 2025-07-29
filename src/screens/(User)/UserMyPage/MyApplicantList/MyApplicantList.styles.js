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
    paddingHorizontal: 15,
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
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
});
