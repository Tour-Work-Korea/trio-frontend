import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

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
  // 가격
  priceBox: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
  },
  priceTitle: {
    color: COLORS.grayscale_400,
    marginRight: 40,
  },
  priceRow: {
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceSectionTitle: { 
  },
  priceTextRow: {
  },
  priceText: {
    color: COLORS.grayscale_800,
  },

  // 분리 선
  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 8,
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
    gap: 20,
  },
  // 모임 안내
  infoTextContainer: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  infoText: {
    lineHeight: 22,
  },

  // 이벤트
  eventItem: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
  },
  eventTitle: {
    color: COLORS.grayscale_400,
    marginRight: 40,
  },
  eventDesc: {
  },

  // 모임 사진
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

  // 하단 버튼
  button: {
    marginTop: 40,
    marginBottom: 20,
  },
});

export default styles;