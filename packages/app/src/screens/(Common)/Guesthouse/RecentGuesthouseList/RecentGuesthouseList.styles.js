import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  actionRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 8,
  },
  clearText: {
    color: COLORS.grayscale_500,
  },
  card: {
    flexDirection: 'row',
    position: 'relative',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  image: {
    width: 114,
    height: 114,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    paddingTop: 4,
    paddingRight: 34,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  tagBox: {
    maxWidth: 76,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  name: {
    color: COLORS.grayscale_800,
    marginBottom: 6,
  },
  address: {
    color: COLORS.grayscale_500,
  },
  heartButton: {
    position: 'absolute',
    top: 2,
    right: 24,
    width: 32,
    height: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  emptyTitle: {
    color: COLORS.grayscale_600,
    marginBottom: 10,
  },
  emptyDescription: {
    color: COLORS.grayscale_500,
  },
});
