import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 96,
  },
  title: {
    color: COLORS.grayscale_900,
    marginHorizontal: 24,
    marginBottom: 22,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
    marginBottom: 28,
    zIndex: 1,
  },
  sortWrapper: {
    marginRight: 8,
    zIndex: 2,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.grayscale_100,
  },
  sortChipText: {
    color: COLORS.grayscale_800,
  },
  sortMenu: {
    position: 'absolute',
    top: 42,
    left: 0,
    width: 128,
    borderRadius: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.grayscale_200,
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 12,
    elevation: 4,
  },
  sortMenuItem: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sortMenuText: {
    color: COLORS.grayscale_600,
  },
  selectedSortMenuText: {
    color: COLORS.primary_orange,
  },
  categoryChipContainer: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  selectedChip: {
    backgroundColor: COLORS.primary_orange,
  },
  chipText: {
    color: COLORS.grayscale_800,
  },
  selectedChipText: {
    color: COLORS.grayscale_0,
  },
  postContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 100,
    marginRight: 8,
  },
  nickname: {
    color: COLORS.grayscale_900,
    marginRight: 8,
  },
  time: {
    color: COLORS.grayscale_400,
  },
  postTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  postContent: {
    color: COLORS.grayscale_900,
    lineHeight: 21,
  },
  multiImageContainer: {
    gap: 12,
    marginTop: 14,
    paddingRight: 20,
  },
  multiPostImage: {
    width: 160,
    height: 220,
    borderRadius: 12,
  },
  singlePostImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 14,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: COLORS.grayscale_900,
  },
  writeButton: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.grayscale_200,
  },
  writeButtonText: {
    color: COLORS.grayscale_700,
  },
});

export default styles;
