import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  reviewTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
  },
  reviewTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeReviewTypeButton: {
    backgroundColor: COLORS.grayscale_0,
  },
  reviewTypeText: {
    color: COLORS.grayscale_600,
  },
  activeReviewTypeText: {
    color: COLORS.grayscale_900,
  },
  // 탭
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    color: COLORS.grayscale_600,
  },
  activeTabText: {
    color: COLORS.primary_orange,
  },

  tabContentContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default styles;
