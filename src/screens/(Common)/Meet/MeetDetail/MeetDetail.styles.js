import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_0,
  },
  // 메인 이미지
  thumbnail: {
    width: '100%',
    height: 280,
  },
  headerContainer: {
    position: 'absolute',
    paddingHorizontal: 20,
    top: 16,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: COLORS.modal_background,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  placePillContainer: {
    backgroundColor: COLORS.grayscale_900,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'center',
  },
  placePill: {
    color: 'white',
  },

  // 본문
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  // 제목
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    flex: 1,
    marginRight: 12,
  },
  shareHeartContainer: {
    flexDirection: 'row',
  },
  // 주소, 인원수
  addressCapacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
    marginRight: 8,
  },
  capacityText: {
    color: COLORS.grayscale_400,
  },
  // 설명
  descriptionContainer: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  description: {
    color: COLORS.grayscale_700,
  },
  // 날짜
  dateBoxContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dateBoxCheckIn: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  dateBoxCheckOut: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
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
  // 가격
  priceBox: {
    flexDirection: 'row',
    width: '50%',
  },
  priceRow: {
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceSectionTitle: {},
  priceTextRow: {},
  priceText: {
    color: COLORS.grayscale_800,
  },

  // 분리 선
  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 16,
  },

  // 지도
  map: {
    height: 160,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },

  // 하단탭
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
  },
  tabButton: {
    paddingBottom: 5,
    flex: 1,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary_blue,
    paddingBottom: 4,
  },
  tabText: {
    color: COLORS.grayscale_800,
  },
  tabTextActive: {
    color: COLORS.primary_blue,
  },

  tabContent: {
    marginTop: 20,
    gap: 12,
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
  },
  tagWrapper: {
    flex: 1,
    marginRight: 8,
  },
  tagText: {
    color: COLORS.primary_blue,
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
  },
  eventImageBlog: {
    width: 300,
    height: 240,
    marginRight: 10,
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
  },
  profileAddr: {
    color: COLORS.grayscale_500,
  },
  profileTextBox: {
    gap: 4,
  },

  // 하단 고정영역
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_100,
  },
  bottomLeft: {
    flexDirection: 'column',
  },
  bottomPrice: {
    marginBottom: 4,
  },
  bottomDate: {
  },
  bottomButton: {
    backgroundColor: COLORS.primary_orange,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
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