import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.grayscale_100,
    color: COLORS.grayscale_800,
  },
  boxContainer: {
    marginVertical: 4,
  },

  Header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },

  //배너
  bannerContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
  },
  banner: {
    alignSelf: 'center',
    width: '85%',
    height: 120,
    borderRadius: 10,
  },
  indicatorRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicatorDot: isActive => ({
    width: 6,
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: isActive ? COLORS.grayscale_400 : COLORS.grayscale_200,
  }),

  //버튼탭
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  button: {
    justifyContent: 'center',
    alignContent: 'center',
  },
  buttonText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_0,
    position: 'absolute',
    alignSelf: 'center',
  },

  //숙박
  guesthouseContainer: {
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_400,
  },
  seeMoreButtonImage: {
    width: 20,
    height: 20,
    marginLeft: 4,
    tintColor: COLORS.grayscale_400,
  },
  sectionTitle: {
    color: COLORS.grayscale_800,
    ...FONTS.fs_16_semibold,
  },
  // 게하 카드
  guesthouseCardContainer: {
    gap: 20,
  },
  guesthouseCard: {
    width: 249,
  },
  guesthouseImage: {
    width: '100%',
    height: 212,
    borderRadius: 12,
    marginBottom: 8,
  },
  // 게하 별점
  ratingBox: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: COLORS.grayscale_800,
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: COLORS.grayscale_0,
    marginLeft: 4,
  },
  // 게하 카드 내용
  guesthouseTitle: {
    marginTop: 4,
    marginRight: 8,
    flex: 1,
    minWidth: 0,
  },
  guesthousePrice: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
  },
  guesthousePriceName: {
    marginTop: 4,
    marginRight: 4,
    color: COLORS.semantic_red,
  },
  // 해시태그
  hashTagContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  hashtagButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 100,
  },
  hashtagText: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
  },

  //구인구직
  jobContainer: {
    flexDirection: 'column',
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  jobCard: {
    minWidth: '100%',
    flexDirection: 'row',
    marginBottom: 16,
  },
  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  jobInfo: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
  },
  count: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
});
