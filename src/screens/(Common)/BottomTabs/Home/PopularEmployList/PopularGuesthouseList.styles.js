import {StyleSheet, Platform} from 'react-native';
import {COLORS} from '@constants/colors';

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
    bottom: 20,
    left: 20,
  },
  headerSubtitleText: {
    color: COLORS.grayscale_0,
    marginTop: 8,
  },
  bodyContainer: {
    marginHorizontal: 20,     
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },

  // 섹션 공통
  // 섹션 제목
  title: {
    marginTop: 20,
    marginBottom: 8,
  },
  // 별점
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_800,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.grayscale_0,
  },
  //태그
  tags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    color: COLORS.primary_blue,
  },

  // 상단 3개용
  trendingList: {
    marginBottom: 4,
  },
  trendingCard: {
    marginRight: 24,
  },
  trendingImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  trendingRating: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  // 제목, 가격
  trendingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  trendingName: {
    color: COLORS.grayscale_600,
  },
  trendingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingPrice: {
    color: COLORS.semantic_red,
  },
  trendingPriceText: {
    color: COLORS.grayscale_800,
    marginLeft: 4,
  },
  // 태그
  trendingTag: {
    marginTop: 8,
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

  // 하단 인기 게하용
  popularCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  popularImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  popularInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  // 제목 별점
  popularTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularName: {
    color: COLORS.grayscale_800,
  },
  // 태그 가격
  popularBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    color: COLORS.grayscale_800,
  },
});

export default styles;
