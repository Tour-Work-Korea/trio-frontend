import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    paddingBottom: 20,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },

  xBtn: {
    marginBottom: 12,
  },
  // 상단
  title: {
  },
  guesthouseName: {
    marginTop: 16,
  },
  address: {
    marginTop: 6,
    color: COLORS.grayscale_400,
  },

  // action button
  actionRow: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.grayscale_200,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionText: {
    color: COLORS.grayscale_700,
  },

  // 체크인/아웃
  dateBoxContainer: {
    marginTop: 32,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBoxCheckIn: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    paddingLeft: 24,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  dateBoxCheckOut: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    paddingLeft: 24,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    marginBottom: 6,
    color: COLORS.grayscale_400,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  nightsBox: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  // 구매정보
  purchaseWrap: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  purchaseLeft: {
  },
  purchaseRight: {
  },
  purchaseTitle: {
    color: COLORS.grayscale_500,
  },
  purchaseSub: {
    marginTop: 6,
    color: COLORS.grayscale_500,
  },

  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
  },

  // rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowLabel: {
    color: COLORS.grayscale_600,
  },
  rowValue: {
    color: COLORS.grayscale_900,
    flexShrink: 1,
    textAlign: 'right',
  },

  copyBtn: {
    backgroundColor: COLORS.grayscale_200,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyBtnText: {
    color: COLORS.grayscale_700,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 8,
  },

  // 최종 결제 금액
  finalPrice: {
    color: COLORS.primary_orange,
  },

  // 취소버튼
  cancelNotice: {
    marginTop: 10,
    color: COLORS.semantic_red,
    lineHeight: 18,
    marginBottom: 12,
  },
});

export default styles;
