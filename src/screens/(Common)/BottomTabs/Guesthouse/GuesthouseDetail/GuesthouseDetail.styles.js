import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  mainImage: {
    width: '100%',
    height: 280,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 16,
  },

  // 이미지 제외 전체 콘텐츠
  contentWrapper: {
    padding: 20,
  },
  // 이름부터 탭들 위쪽까지
  contentTopWrapper: {
  },
  
  nameIconContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    lineHeight: 28,
  },
  // 공유, 좋아요 아이콘 박스
  topIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  address: {
    marginBottom: 20,
  },

  // 리뷰
  reviewRow: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reviewBox:{
    backgroundColor: COLORS.grayscale_800,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  rating: {
    color: COLORS.grayscale_0,
    marginLeft: 4,
  },
  ratingDevide: {
    color: COLORS.grayscale_0,
    marginHorizontal: 2,
  },
  reviewCount: {
    color: COLORS.grayscale_0,
  },

  // 간단 소개글
  shortIntroContainer: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  shortIntroText: {
    color: COLORS.grayscale_700,
  },
  
  // 어메너티
  iconServiceContainer: {
    marginBottom: 28,
  },
  iconServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    marginBottom: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconServiceText: {
    marginTop: 12,
  },
  readMoreText: {
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },

  devide: {
    backgroundColor: COLORS.grayscale_300,
    width: '100%',
    height: 1,
    marginBottom: 28,
  },

  // 선택된 날짜 인원 객실
  displayDateGuestRow: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 8,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary_orange,
    padding: 10,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfoContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary_orange,
    padding: 10,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateGuestText: {
    color: COLORS.grayscale_0,
    marginLeft: 8,
  },

  // 탭 디자인
  tabMenuWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    height: 24,
    width: 75,
  },
  tabUnderline: {
    marginTop: 4,
    height: 1,
    width: 75,
    backgroundColor: COLORS.primary_blue,
  },
  tabTitle: {
    color: COLORS.grayscale_800,
    marginTop: 28,
    marginBottom: 12,
  },

  // 방 리스트
  roomContentWrapper: {

  },
  roomCard: {
    marginBottom: 12,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
  },
  roomImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  roomNameDescContainer: {
  },
  roomType: {
    marginBottom: 4,
    color: COLORS.grayscale_800,
  },
  checkTimeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  checkin: {
    color: COLORS.grayscale_400,
  },
  roomPrice: {
    color: COLORS.grayscale_800,
  },
  
  // 긴 소개
  introductionContainer: {
    marginBottom: 16,
  },
  longTextContainer: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
  },
  introductionText: {
    lineHeight: 20,
    color: COLORS.grayscale_700,
  },
});

export default styles;
