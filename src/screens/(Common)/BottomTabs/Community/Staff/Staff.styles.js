import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  listContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  recruitItem: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  headerInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  guesthouseName: {
    flexShrink: 1,
    color: COLORS.grayscale_900,
    marginRight: 8,
  },
  deadline: {
    color: COLORS.grayscale_400,
  },
  recruitTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  address: {
    flex: 1,
    color: COLORS.grayscale_500,
  },
  workPeriod: {
    color: COLORS.grayscale_500,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: COLORS.grayscale_900,
  },
  footerLoading: {
    marginVertical: 16,
  },
});

export default styles;
