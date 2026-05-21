import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  listHeader: {
    paddingTop: 20,
  },
  pointCard: {
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    padding: 24,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  pointCardTitle: {
    color: COLORS.grayscale_700,
  },
  currentPointText: {
    color: COLORS.grayscale_700,
    fontSize: 30,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 14,
  },
  expiringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  expiringLabel: {
    color: COLORS.grayscale_400,
  },
  expiringPoint: {
    color: COLORS.grayscale_700,
  },
  sectionTitle: {
    color: COLORS.grayscale_700,
    marginTop: 18,
    marginBottom: 12,
  },
  historyCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: COLORS.grayscale_700,
  },
  historyDate: {
    color: COLORS.grayscale_400,
    marginTop: 4,
  },
  historyAmountWrapper: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    textAlign: 'right',
  },
  earnAmount: {
    color: COLORS.primary_orange,
  },
  spendAmount: {
    color: COLORS.grayscale_700,
  },
  historyType: {
    color: COLORS.grayscale_700,
    marginTop: 4,
  },
  loadingContainer: {
    paddingTop: 40,
  },
  footerLoading: {
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.grayscale_400,
  },
});
