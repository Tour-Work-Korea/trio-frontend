import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 140,
    gap: 16,
  },
  summaryText: {
    alignSelf: 'flex-end',
    color: COLORS.grayscale_900,
  },

  couponCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  selectedCouponCard: {
    borderColor: COLORS.primary_orange,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: COLORS.primary_orange,
    borderColor: COLORS.primary_orange,
  },
  disabledCheckbox: {
    borderColor: COLORS.grayscale_300,
  },
  cardContent: {
    flex: 1,
    gap: 10,
  },
  discountAmountText: {
    color: COLORS.grayscale_900,
  },
  couponTitle: {
    color: COLORS.grayscale_900,
  },
  conditionText: {
    color: COLORS.grayscale_500,
  },
  remainingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary_red,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  remainingBadgeText: {
    color: COLORS.semantic_red,
  },
  disabledTitleText: {
    color: COLORS.grayscale_400,
  },
  disabledBodyText: {
    color: COLORS.grayscale_400,
  },
  
  emptyStateWrapper: {
    flex: 1,
    minHeight: 420,
  },
  buttonContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
  },
});

export default styles;
