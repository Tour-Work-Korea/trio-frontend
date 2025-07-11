import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    paddingTop: 60,
  },
  //헤더
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },
  //검색창
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 20,
    paddingHorizontal: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    padding: 0,
  },
  //숙박
  guesthouseContainer: {
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
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
  sectionTitle: {...FONTS.fs_16_semibold, color: COLORS.grayscale_800},
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
    ...FONTS.fs_16_semibold,
  },
  guesthousePrice: {
    flexDirection: 'row',
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

  //일자리 리스트
  employContainer: {
    flexDirection: 'column',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
  },
});
export default styles;
