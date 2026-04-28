import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  // 헤더
  header: {
    height: 280,
    backgroundColor: COLORS.grayscale_100,
  },
  // 메인 이미지
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  shareButton: {
    backgroundColor: 'rgba(0,0,0,0.14)',
    position: 'absolute',
    right: 12,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  heroTagRow: {
    position: 'absolute',
    flexDirection: 'row',
    left: 20,
    top: 40,
    gap: 4,
  },
  heroTagChip: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  heroTagText: {
    color: COLORS.primary_blue,
  },

  // 본문
  contentContainer: {
    paddingHorizontal: 0,
    backgroundColor: COLORS.grayscale_100,
  },
  // 제목
  summaryCard: {
    marginHorizontal: 16,
    marginTop: -32,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    alignItems: 'center',
  },
  summaryAvatar: {
    position: 'absolute',
    top: -24,
    borderWidth: 2,
    borderColor: COLORS.grayscale_0,
  },
  summaryGuesthouseName: {
    marginTop: 2,
    marginBottom: 8,
    color: COLORS.grayscale_500,
    textAlign: 'center',
  },
  titleText: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  shareHeartContainer: {
    flexDirection: 'row',
  },
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  scheduleText: {
    color: COLORS.grayscale_700,
  },
  // 설명
  descriptionContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    color: COLORS.grayscale_700,
  },

  // 하단탭
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 20,
  },
  tabButton: {
    paddingBottom: 10,
    flex: 1,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary_blue,
    paddingBottom: 9,
  },
  tabText: {
    color: COLORS.grayscale_800,
  },
  tabTextActive: {
    color: COLORS.primary_blue,
  },
  tabPager: {
    flex: 1,
  },
  tabPage: {
    flexShrink: 0,
  },

  tabContent: {
    gap: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.grayscale_0,
    flex: 1,
    paddingTop: 12,
    paddingBottom: 180,
  },
  // 상세 안내
  infoTextContainer: {
    borderRadius: 8,
    marginBottom: 20,
  },
  infoMainTitleText: {
  },
  infoText: {
    lineHeight: 22,
  },
  // 상세 안내 밑부분
  detailInfoContainer: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  infoTitleText: {
    marginBottom: 8,
  },
  detailInfoText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWrapper: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  tagText: {
    color: COLORS.primary_blue,
    flexShrink: 1,
  },
  detailInfoBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    flexShrink: 0,
  },
  detailInfoBtnText: {
    color: COLORS.grayscale_400,
  },

  // 이벤트 소개
  eventItem: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
  },
  // eventTitle: {
  //   color: COLORS.grayscale_400,
  //   marginRight: 40,
  // },
  eventDesc: {},
  eventBlock: {
    marginBottom: 18,
  },
  eventImageRow: {
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  eventImageBlog: {
    width: 340,
    height: 300,
    // marginRight: 10,
    backgroundColor: COLORS.grayscale_100,
  },
  eventTitle: {
    marginTop: 4,
  },
  eventBody: {
    marginTop: 6,
    lineHeight: 20,
    color: COLORS.grayscale_700,
  },


  // 이벤트 사진
  mainImageContainer: {
    width: 280,
    height: 280,
    borderRadius: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  imageScroll: {
    alignSelf: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 4,
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: COLORS.primary_orange,
  },

  // 사장님 계정
  profileBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
  },
  profileAddr: {
    color: COLORS.grayscale_500,
  },
  profileTextBox: {
    gap: 4,
  },

  fixedNotice: {
    position: 'absolute',
    left: 9,
    right: 9,
    bottom: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.secondary_red,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fixedNoticeText: {
    flex: 1,
    color: COLORS.grayscale_700,
  },

  // 하단 고정영역
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  bottomLikeButton: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButton: {
    flex: 1,
    backgroundColor: COLORS.primary_orange,
    minHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonDisabled: {
    backgroundColor: COLORS.grayscale_300,
  },

  // 탭 내용 비었을 때
  emptyContainer: {
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    resizeMode: 'contain',
  },

  emptyText: {
    textAlign: 'center',
    color: COLORS.grayscale_600,
    lineHeight: 20,
    marginBottom: 8,
  },

  emptySubText: {
    textAlign: 'center',
    color: COLORS.grayscale_800,
    lineHeight: 20,
  },

});

export default styles;
