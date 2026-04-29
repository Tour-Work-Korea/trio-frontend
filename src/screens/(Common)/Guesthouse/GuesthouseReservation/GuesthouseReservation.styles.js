import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  devide: {
    width: '100%',
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 24,
  },

  // 방 이름
  title: {
    marginTop: 20,
  },
  roomName: {
    marginTop: 12,
    marginBottom: 2,
  },
  // 날짜
  dateBoxContainer: {
    marginTop: 20,
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
  actualGuestToggle: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 4,
  },
  actualGuestToggleText: {
    color: COLORS.grayscale_700,
  },
  actualGuestForm: {
    gap: 14,
    marginTop: 4,
  },
  actualGuestGuide: {
    color: COLORS.grayscale_700,
  },
  actualGuestInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actualGuestLabel: {
    width: 64,
    color: COLORS.grayscale_800,
  },
  actualGuestInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    color: COLORS.grayscale_800,
  },

  // 방 이름, 가격
  roomNameText: {

  },
  roomPriceText: {
    color: COLORS.grayscale_600,
  },
  // 쿠폰
  couponBtn: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
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
  // 포인트
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
  requestInput: {

  },

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
    marginHorizontal: 20,
    marginBottom: 40,
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
});

export default styles;
