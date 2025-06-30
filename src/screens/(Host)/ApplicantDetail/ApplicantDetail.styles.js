import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // 하단 버튼 영역 확보
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 16,
  },
});

export default styles;
