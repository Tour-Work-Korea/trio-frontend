import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
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
  registerButton: {
    backgroundColor: COLORS.primary_orange,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerButtonText: {
    color: COLORS.grayscale_0,
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
});

export default styles;
