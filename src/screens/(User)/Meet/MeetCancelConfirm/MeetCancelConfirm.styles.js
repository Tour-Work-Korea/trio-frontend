import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scroll: {
    paddingBottom: 120,
  },

  body: {
    paddingHorizontal: 20,
  },

  // 안내 문구
  noticeBox: {
    backgroundColor: COLORS.semantic_red,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeText: {
    color: COLORS.grayscale_0,
  },

  // 현재 날짜 시간
  todayText: {
    alignSelf: 'flex-end',
    color: COLORS.grayscale_400,
    marginBottom: 12,
  },

  // 게하 정보
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  cardInfo: {
    gap: 4,
  },
  roomName: {
    color: COLORS.grayscale_800,
  },
  roomDesc: {
    color: COLORS.grayscale_500,
  },

  // 숙박 날짜
  timeText: {
    color: COLORS.grayscale_800,
  },

  devide: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 12,
  },

  // 환불 정보
  section: {
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: COLORS.grayscale_600,
  },
  value: {
    color: COLORS.grayscale_900,
  },

  refundMethod: {
    color: COLORS.primary_orange,
  },
  refundAmount: {
    color: COLORS.primary_orange,
  },

  // 취소 사유
  dropdown: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  dropdownItem: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dropdownDivide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },

  // 동의
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    justifyContent: 'space-between',
  },
  checkBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  agreeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agreeText: {
    color: COLORS.grayscale_700,
  },
  required: {
    color: COLORS.primary_blue,
  },

  // 요청 버튼
  submitButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: COLORS.primary_orange,
    padding: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.grayscale_0,
  },
});
