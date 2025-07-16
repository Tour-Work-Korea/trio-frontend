import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  // 해시태그
  hashTagContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
  },
  hashtagButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 100,
  },
  hashtagText: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
  },
  //공고 카드
  jobSmall: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
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
export default styles;
