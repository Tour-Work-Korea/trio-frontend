import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';
import Phone from '@components/Certificate/UserPhone';

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
    backgroundColor: COLORS.modal_background,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  tagContainer: {
    position: 'absolute',
    flexDirection: 'row',
    right: 20,
    bottom: 20,
    gap: 4,
  },
  tagBox: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: {
    color: COLORS.primary_blue,
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
    marginBottom: 4,
  },
  phone: {
    
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
  // 리뷰탭 파란 리뷰 카운트
  reviewBoxBlue:{
    backgroundColor: COLORS.primary_blue,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginTop: 28,
  },
  reviewRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  
  // 객실 서비스
  iconServiceContainer: {
    marginBottom: 28,
  },
  iconServiceRowWithMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  // iconServiceRow: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  // },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
  },
  iconServiceWrapper: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
    iconServiceText: {  
  },
  readMoreButton: {
    alignItems: 'center',
    marginLeft: 8,
  },
  readMoreText: {
    color: COLORS.grayscale_400,
  },

  devide: {
    backgroundColor: COLORS.grayscale_300,
    width: '100%',
    height: 0.4,
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
  roomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomNameDescContainer: {
    flex: 1,       // 왼쪽 블럭이 남는 공간을 사용
    minWidth: 0,   // 텍스트가 ellipsis 되도록 필요한 트릭
    // paddingRight: 8,
  },
  roomType: {
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
    flexShrink: 0,
  },

  // 룸 디테일 버튼
  roomDetailBtn: {
    marginTop: 12,
  },
  roomDetailBtnText: {
    color: COLORS.semantic_blue,
  },

  // 도미토리 카드 하단
  roomInfoBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 60,
    marginTop: 24,
  },
  remainingRow: {
    flex: 2,
    backgroundColor: COLORS.grayscale_0,
    borderColor: COLORS.grayscale_900,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  remainingText: {

  },
  countOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  countOptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    backgroundColor: COLORS.grayscale_0,
  },
  countOptionChipActive: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.grayscale_0,
  },
  countOptionText: {
    color: COLORS.grayscale_700,
  },
  countOptionTextActive: {
    color: COLORS.primary_orange,
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
