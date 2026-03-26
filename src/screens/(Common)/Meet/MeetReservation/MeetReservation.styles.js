import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  devide: {
    width: '100%',
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 24,
  },

  // 이벤트 정보
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  eventThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
  },
  eventTextRow: {
    justifyContent: 'center',
    gap: 6,
  },
  eventPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceDevide: {
    width: 1,
    backgroundColor: COLORS.grayscale_900,
    height: 10,
  },

  // 예약자 정보
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.grayscale_400,
  },
  row: {
    flexDirection: 'row',
    gap: 40,
    color: COLORS.grayscale_800,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoTitle: {
    color: COLORS.grayscale_600,
  },

  // 방 이름, 가격
  meetNameText: {},
  meetPriceText: {
    color: COLORS.grayscale_600,
  },
  couponBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedCouponDiscountText: {
    color: COLORS.primary_orange,
  },
  couponBanner: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
    width: '100%',
    paddingVertical: 8,
  },
  couponBannerText: {
    color: COLORS.semantic_red,
  },
  selectedCouponBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  selectedCouponNameText: {
    flex: 1,
    color: COLORS.grayscale_400,
  },
  selectedCouponAmountText: {
    color: COLORS.grayscale_400,
  },
  pointSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointInput: {
    width: 120,
    padding: 8,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
    borderRadius: 4,
    textAlign: 'right',
  },
  pointBtn: {
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    color: COLORS.grayscale_600,
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingRight: 8,
  },
  pointWarningText: {
    color: COLORS.semantic_red,
    alignSelf: 'flex-end',
    paddingRight: 8,
  },

  // 요청 사항
  inputWrapper: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
  },
  requestInput: {},

  // 약관 동의
  agreeRowContainer: {
    gap: 12,
  },
  checkedBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeRowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    color: COLORS.grayscale_800,
  },
  agreeRowConent: {
    gap: 12,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    color: COLORS.grayscale_600,
  },
  agreeText: {
    color: COLORS.grayscale_600,
  },
  nessesaryText: {
    color: COLORS.primary_blue,
  },
  seeMore: {
    position: 'absolute',
    right: 0,
  },
  seeMoreText: {
    color: COLORS.primary_blue,
  },
  button: {
    marginHorizontal: 12,
    // marginBottom: 20,
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
    paddingTop: 4,
  },
  discountBannerText: {
    color: COLORS.primary_orange,
  },

  // 하단 요약정보
  bottomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 44,
  },
});

export default styles;
