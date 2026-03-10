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
  },
  userInfoTitle: {
    color: COLORS.grayscale_600,
  },

  // 방 이름, 가격
  roomNameText: {

  },
  roomPriceText: {
    color: COLORS.grayscale_600,
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
});

export default styles;
