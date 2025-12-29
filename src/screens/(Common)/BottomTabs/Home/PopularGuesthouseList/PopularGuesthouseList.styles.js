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
    gap: 12,
  },
  imgRatingContainer: {
    position: 'relative',
  },
  popularImage: {
    width: 112,
    height: 112,
    borderRadius: 4,
  },
  rating: {
    position:'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_800,
    justifyContent: 'center',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 2,
    gap: 4,
    top: 4,
    left: 4,
  },
  popularInfo: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
    paddingRight: 28,
  },
  tagContainer: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  // 제목
  popularName: {
    color: COLORS.grayscale_800,
    marginBottom: 4,
  },
  popularAddress: {
    color: COLORS.grayscale_500,
    marginBottom: 10,
  },
  // 가격
  popularBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  popularPrice: {
    color: COLORS.grayscale_800,
  },
  popularEmptyPrice: {
    color: COLORS.grayscale_300,
  },
  heartIcon: {
    position: 'absolute',
    right: 0,
  },

});

export default styles;
