import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  xBtn: {
    marginBottom: 16,
  },

  // 경고 배너
  banner: {
    backgroundColor: COLORS.semantic_red,
    borderRadius: 8,
    padding: 12,
    marginBottom: 40,
    marginTop: 12,
  },
  bannerText: {
    color: COLORS.grayscale_0,
    lineHeight: 20,
  },

  // 게하 정보
  summaryCard: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: COLORS.grayscale_100,
  },
  summaryTextBox: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
    gap: 4,
  },
  guesthouseName: {
    color: COLORS.grayscale_900,
  },
  roomName: {
    color: COLORS.grayscale_800,
    flexShrink: 1,
  },
  roomDesc: {
    color: COLORS.grayscale_500,
    flexShrink: 1,
  },
  // 날짜
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  dateCol: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_900,
    marginBottom: 6,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  dateDivider: {
    width: 1,
    height: 42,
    backgroundColor: COLORS.grayscale_200,
    marginHorizontal: 14,
  },

  // 취소 일시
  cancelledAt: {
    color: COLORS.grayscale_400,
    marginBottom: 16,
  },

  devide: {
    backgroundColor: COLORS.grayscale_200,
    height: 1,
    width: '100%',
  },

  // 취소 내역
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    color: COLORS.grayscale_500,
  },
  value: {
    color: COLORS.grayscale_900,
  },
  valueInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueHint: {
    marginRight: 6,
  },
  valueStrike: {
    color: COLORS.grayscale_900,
    textDecorationLine: 'line-through',
  },
  valueAccent: {
    color: COLORS.primary_orange,
  },
  refundAmount: {
    color: COLORS.primary_orange,
  },
  sectionLast: {
    marginTop: 32,
  },
});

export default styles;
