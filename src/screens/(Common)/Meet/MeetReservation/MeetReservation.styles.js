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
  },
  userInfoTitle: {
    color: COLORS.grayscale_600,
  },

  // 방 이름, 가격
  meetNameText: {},
  meetPriceText: {
    color: COLORS.grayscale_600,
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
    marginTop: 12,
    marginBottom: 20,
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
