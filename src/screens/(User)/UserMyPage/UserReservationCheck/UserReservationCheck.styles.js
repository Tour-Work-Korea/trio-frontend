import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  // 탭
  tabContainer: {
    flexDirection: 'row',
    marginTop: 28,
    marginBottom: 8,
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
    paddingBottom: 20,
  },
});

export default styles;
