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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    lineHeight: 28,
    flexShrink: 1,
  },
  // 공유, 좋아요 아이콘 박스
  topIcons: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: 12,
    paddingTop: 4,
  },

  addressSection: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 2,
    maxWidth: '100%',
  },
  address: {
    color: COLORS.grayscale_600,
    flexShrink: 1,
  },
  phoneButton: {
    alignSelf: 'flex-start',
  },
  phone: {},
  copyableText: {
    textDecorationLine: 'underline',
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

  // 오늘의 콘텐츠
  todayPartiesContainer: {
    marginBottom: 28,
  },
  todayContentTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  todayPartyList: {
  },
  todayPartyCard: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  todayPartyImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
  },
  todayPartyImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPartyImageText: {
    color: COLORS.grayscale_400,
  },
  todayPartyInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  todayPartyTopRow: {
    flexDirection: 'row',
  },
  todayPartyTitleWrapper: {
  },
  todayPartyTitle: {
    color: COLORS.grayscale_900,
  },
  todayPartyPeopleRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayPartyPeopleText: {
    color: COLORS.grayscale_400,
  },
  todayPartyTime: {
    color: COLORS.primary_orange,
    alignSelf: 'flex-end',
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
    marginHorizontal: -20,
  },
  tabMenuContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
    height: 24,
    minWidth: 75,
  },
  tabUnderline: {
    marginTop: 4,
    height: 1,
    width: '100%',
    backgroundColor: COLORS.primary_blue,
  },
  tabPager: {
    marginTop: 4,
  },
  tabPage: {
    flexShrink: 0,
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
  roomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
    marginBottom: 4,
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
  roomNameTextWrapper: {
    flex: 1,
    width: 0,
    minWidth: 0,
    marginRight: 4,
    overflow: 'hidden',
  },
  roomType: {
    color: COLORS.grayscale_800,
  },
  roomNameText: {
    flexShrink: 1,
    width: '100%',
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
    textAlign: 'right',
  },

  // 룸 디테일 버튼
  roomDetailBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  remainingText: {

  },
  fullBooked: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
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

  // 취소규정
  refundPolicyContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
  },
  refundPolicyRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  refundPolicyText: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.grayscale_600,
  },
  refundRateText: {
    flex: 0.5,
    textAlign: 'center',
    color: COLORS.grayscale_700,
  },
  refundEmptyBox: {
    backgroundColor: COLORS.grayscale_100,
    padding: 16,
    borderRadius: 8,
  },
  refundEmptyText: {
    color: COLORS.grayscale_600,
  },
  loginModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  loginModalContainer: {
    width: '90%',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  loginModalTitle: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  loginModalButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  loginModalButton: {
    flex: 1,
  },
});

export default styles;
