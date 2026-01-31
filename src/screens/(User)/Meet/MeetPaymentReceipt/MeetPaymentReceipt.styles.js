import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  body: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    paddingVertical: 24,
    marginTop: 12,
    marginBottom: 40,
  },

  // 이벤트 제목, 사진
  card: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    color: COLORS.black,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginBottom: 24,
  },

  divide: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginBottom: 24,
  },

  // 이벤트 정보
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: COLORS.grayscale_800,
  },
  value: {
    color: COLORS.grayscale_800,
  },

  // 안내박스
  noticeBox: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    marginTop: 12,
  },
  noticeText: {
    lineHeight: 22,
  },

  // 결제정보
  paymentBox: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 4,
    color: COLORS.grayscale_700,
  },
  subText: {
    color: COLORS.grayscale_400,
    marginBottom: 24,
  },
  priceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    color: COLORS.grayscale_500,
  },
  priceValue: {
    color: COLORS.grayscale_500,
  },

  // 경고 문구
  warningText: {
    marginTop: 12,
    color: COLORS.semantic_red,
    lineHeight: 18,
    marginBottom: 8,
  },
});

export default styles;