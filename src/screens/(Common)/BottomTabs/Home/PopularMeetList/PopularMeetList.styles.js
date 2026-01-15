import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },

  // 헤더
  headerContainer: {
    backgroundColor: COLORS.grayscale_800,
    height: 160,
    overflow: 'hidden',
  },
  headerImg: {
    alignSelf: 'flex-end',
    marginRight: -30,
    marginTop: 56,
  },
  headerTitle: {
    marginTop: 12,
    position: 'absolute',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitleText: {
    alignSelf: 'center',
    color: COLORS.grayscale_0,
  },
  headerSubtitle: {
    position: 'absolute',
    bottom: 0,
    bottom: 20,
    left: 20,
  },
  headerSubtitleText: {
    color: COLORS.grayscale_0,
    marginTop: 8,
  },

  // 섹션 공통
  // 섹션 제목
  title: {
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  
  // 상단 3개용
  trendingList: {
    marginBottom: 4,
  },
  trendingCard: {
  },
  trendingImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  trendingInfo: {
    marginTop: 10,
  },
  trendingTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
    flex: 1,
    flexShrink: 1,
    marginRight: 4,
  },
  trendingDate: {
    color: COLORS.grayscale_500,
    marginBottom: 6,
  },
  trendingPriceText: {
    color: COLORS.grayscale_800,
    flexShrink: 0,
  },

  // 인디케이터
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.grayscale_200,
  },
  indicatorDotActive: {
    backgroundColor: COLORS.grayscale_400,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // 하단 인기 이벤트용
  meetItemContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  meetTopContainer: {
    flexDirection: 'row',
  },
  meetThumb: {
    width: 90,
    height: 90,
    borderRadius: 4,
    marginRight: 10,
  },
  meetInfo: {
    flex: 1,
  },
  meetTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 게하 이름
  meetPlace: {
    color: COLORS.grayscale_600,
  },
  meetTitle: {
    color: COLORS.grayscale_800,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  capacityText: {
    color: COLORS.grayscale_400,
  },
  meetBottomRow: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  price: {
    color: COLORS.grayscale_800,
  },
  meetBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  meetAddress: {
    color: COLORS.grayscale_500,
    flexShrink: 1,
    marginRight: 8,
  },
  timeText: {
    color: COLORS.primary_orange,
  },

});

export default styles;
