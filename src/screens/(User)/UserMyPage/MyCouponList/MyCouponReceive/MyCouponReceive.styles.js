import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countText: {
    color: COLORS.grayscale_900,
  },
  emptyStateWrapper: {
    flex: 1,
    justifyContent: 'center',
  },

  couponCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextArea: {
    flex: 1,
    minWidth: 0,
  },
  discountText: {
    color: COLORS.grayscale_900,
  },
  titleText: {
    color: COLORS.grayscale_900,
    marginTop: 4,
  },
  descriptionText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
  expiryText: {
    color: COLORS.grayscale_400,
    marginTop: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.secondary_red,
  },
  badgeText: {
    color: COLORS.semantic_red,
  },
  issueButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.grayscale_0,
  },
  issueButtonDisabled: {
    backgroundColor: COLORS.grayscale_100,
  },
  issueButtonText: {
    color: COLORS.grayscale_700,
  },
  issueButtonTextDisabled: {
    color: COLORS.grayscale_400,
  },
});

export default styles;
