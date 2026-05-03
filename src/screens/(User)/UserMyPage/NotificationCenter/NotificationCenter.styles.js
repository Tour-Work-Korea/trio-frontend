import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary_orange,
  },
  chipText: {
    color: COLORS.grayscale_700,
  },
  chipTextActive: {
    color: COLORS.grayscale_0,
  },
  actionRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
  },
  actionButtonText: {
    color: COLORS.grayscale_700,
  },
  listScrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 34,
  },
  iconWrap: {
    width: 28,
    height: 28,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    paddingTop: 2,
  },
  notificationTitle: {
    color: COLORS.grayscale_800,
    lineHeight: 26,
    marginBottom: 4,
  },
  notificationTitleRead: {
    color: COLORS.grayscale_400,
  },
  notificationLine: {
    color: COLORS.grayscale_700,
    lineHeight: 20,
  },
  noticeLine: {
    color: COLORS.grayscale_600,
  },
  pendingActionLine: {
    color: COLORS.semantic_red,
  },
  notificationDate: {
    color: COLORS.grayscale_500,
    marginTop: 6,
  },
  notificationTextRead: {
    color: COLORS.grayscale_400,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
