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
    marginVertical: 2,
  },
  todayContainer: {
    flex: 1,
    marginVertical: 2,
  },

  Header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },

  // 검색
  searchArea: {
    marginHorizontal: 12,
    position: 'relative',
    zIndex: 100,
    elevation: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  searchBoxAndroid: {
    paddingVertical: 0,
    zIndex: 101,
  },
  searchBoxConnected: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  searchInput: {
    flex: 1,
    color: COLORS.grayscale_800,
  },
  searchInputAndroid: {
    height: 40,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  searchPlaceholder: {
    color: COLORS.grayscale_600,
  },
  searchResultDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.grayscale_0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderTopWidth: 0,
    shadowColor: COLORS.grayscale_800,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: 260,
    overflow: 'hidden',
    zIndex: 101,
    marginTop: -1,
  },
  searchResultList: {
    maxHeight: 260,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_100,
    gap: 10,
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultLeftIcon: {
    // padding: 8,
    // borderRadius: 100,
    // borderColor: COLORS.grayscale_200,
    // borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultContent: {
    flex: 1,
    minWidth: 0,
  },
  searchResultText: {
    color: COLORS.grayscale_800,
  },
  searchResultSubText: {
    marginTop: 2,
    color: COLORS.grayscale_500,
  },
  searchResultEmptyText: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    color: COLORS.grayscale_500,
    textAlign: 'center',
  },

  //배너
  bannerContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingVertical: 12,
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
    marginTop: 8,
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
