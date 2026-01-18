import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },

  title: {
    marginBottom: 14,
  },

  guesthouseName: {
    marginTop: 6,
  },

  address: {
    marginTop: 6,
    color: COLORS.grayscale_500,
  },

  // action buttons row
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.grayscale_300,
    marginBottom: 8,
  },
  actionText: {
    color: COLORS.grayscale_700,
  },

  // info cards row
  infoRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 14,
    padding: 14,
  },
  infoLabel: {
    color: COLORS.grayscale_500,
  },
  infoDate: {
    marginTop: 10,
    color: COLORS.grayscale_900,
  },
  infoTime: {
    marginTop: 4,
    color: COLORS.grayscale_700,
  },

  // purchase line
  purchaseWrap: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  purchaseLeft: {
    flex: 1,
  },
  purchaseTitle: {
    color: COLORS.grayscale_700,
  },
  purchaseSub: {
    marginTop: 6,
    color: COLORS.grayscale_400,
  },

  section: {
    marginTop: 22,
  },
  sectionTitle: {
    marginBottom: 12,
    color: COLORS.grayscale_900,
  },

  // rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowLabel: {
    color: COLORS.grayscale_500,
  },
  rowValue: {
    color: COLORS.grayscale_900,
    flexShrink: 1,
    textAlign: 'right',
  },

  copyBtn: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnText: {
    color: COLORS.grayscale_700,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_100,
    marginTop: 4,
  },

  // payment highlight
  finalPrice: {
    color: COLORS.primary_orange,
  },

  // cancel
  cancelNotice: {
    marginTop: 10,
    color: COLORS.primary_orange,
    lineHeight: 18,
  },

  cancelBtn: {
    marginTop: 12,
    backgroundColor: '#FEE9E8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelBtnText: {
    color: '#E84E4E',
  },
});

export default styles;
