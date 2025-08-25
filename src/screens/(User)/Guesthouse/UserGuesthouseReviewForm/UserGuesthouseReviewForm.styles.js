import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  // 리뷰 전체
  infoContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 숙소 정보
  infoBox: {
    borderBottomWidth: 0.4,
    borderBottomColor: COLORS.grayscale_300,
    paddingBottom: 16,
    marginBottom: 16,
  },
  nameText: {

  },
  roomText: {
    color: COLORS.grayscale_800,
    marginTop: 4,
  },
  adressText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
  dateContent: {
    marginTop: 8,
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  devideText: {
    marginHorizontal: 16,
    alignSelf: 'center',
  },

  // 작성 폼
  reviewRow: {
    marginBottom: 20,
  },
  rowTitle: {
    marginBottom: 12,
  },
  rowTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 별점
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  // 이미지
  imageText: {
    color: COLORS.grayscale_500,
  },
  imageContainer: {
    gap: 12,
  },
  uploadBtn: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  xbutton: {
    position: 'absolute',
    right: 16,
    top: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    width: 18,
    height: 18,
    borderRadius: 20,
  },

  // 리뷰 작성
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    minHeight: 200,
    lineHeight: 20,
  },
  rewriteText: {
    alignSelf: 'flex-end',
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
  
  // 유의 문구
  noticeWrapper: {
    marginTop: 12,
    gap: 4,
  },
  noticeText: {
    color: COLORS.grayscale_400,
    lineHeight: 18,
  },

  submitBtn: {
    marginTop: 36,
    marginBottom: 20,
  },
});
