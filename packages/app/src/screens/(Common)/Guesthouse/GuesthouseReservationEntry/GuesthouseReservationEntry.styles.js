import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 140,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderText: {
    color: COLORS.grayscale_800,
  },
  calendarCard: {
    marginTop: 20,
    paddingTop: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 56,
    paddingRight: 56,
    marginBottom: 18,
  },
  calendarMonthText: {
    color: COLORS.grayscale_900,
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
  },
  calendarWeekHeader: {
    marginTop: 0,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDayHeader: {
    width: 38,
    textAlign: 'center',
    color: COLORS.grayscale_400,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
  dayCell: {
    width: 40,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayCellAvailable: {
    backgroundColor: COLORS.secondary_orange,
  },
  dayCellUnavailable: {
    backgroundColor: COLORS.grayscale_200,
  },
  dayCellSelectedRange: {
    backgroundColor: COLORS.primary_orange,
    width: 38,
    height: 38,
    borderRadius: 100,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary_orange,
    width: 38,
    height: 38,
    borderRadius: 100,
  },
  dayNumber: {
    color: COLORS.grayscale_800,
    lineHeight: 17,
  },
  dayNumberOut: {
    color: COLORS.grayscale_300,
  },
  dayNumberUnavailable: {
    color: COLORS.grayscale_400,
  },
  dayNumberSelectedRange: {
    color: COLORS.grayscale_0,
  },
  dayNumberSelected: {
    color: COLORS.grayscale_0,
  },
  daySubLabel: {
    marginTop: 0,
    color: COLORS.primary_orange,
    fontSize: 8,
    lineHeight: 10,
  },
  daySubLabelSelected: {
    color: COLORS.grayscale_0,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    paddingLeft: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 1,
  },
  legendSelected: {
    backgroundColor: COLORS.primary_orange,
  },
  legendDisabled: {
    backgroundColor: COLORS.grayscale_300,
  },
  legendAvailable: {
    backgroundColor: COLORS.secondary_orange,
  },
  legendText: {
    color: COLORS.grayscale_500,
  },
  priceGuestRow: {
    marginTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  baseRoomPriceBlock: {
    marginTop: 56,
  },
  priceText: {
    color: COLORS.grayscale_900,
  },
  unitPriceText: {
    marginTop: 2,
    color: COLORS.grayscale_400,
  },
  guestStepper: {
    width: 120,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCountText: {
    minWidth: 24,
    textAlign: 'center',
    color: COLORS.grayscale_900,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.grayscale_300,
    marginTop: 32,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  optionIconGrid: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  optionIconDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: COLORS.grayscale_800,
  },
  optionTitle: {
    color: COLORS.grayscale_800,
  },
  optionDescription: {
    marginTop: 28,
    color: COLORS.grayscale_700,
  },
  optionPriceRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  optionStepperColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  extraPriceText: {
    color: COLORS.grayscale_800,
  },
  extraPriceSubText: {
    marginTop: 4,
    color: COLORS.grayscale_400,
  },
  totalGuestText: {
    color: COLORS.primary_orange,
  },
  totalRow: {
    alignItems: 'flex-end',
    marginTop: 28,
  },
  totalPrice: {
    color: COLORS.grayscale_900,
  },
  fixedButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 34,
  },
});

export default styles;
