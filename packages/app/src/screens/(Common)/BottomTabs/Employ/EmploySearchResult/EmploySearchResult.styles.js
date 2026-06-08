import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  modalContainer: {flex: 1},
  //검색창
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 20,
    paddingHorizontal: 8,
    height: 40,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    padding: 0,
    flex: 1,
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
  //일자리 리스트
  recruitListContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  recruitListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
  },
  employContainer: {
    flexDirection: 'column',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
  },
  filterTitleText: {
    ...FONTS.fs_14_medium,
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
  filterText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
  selectFilterContainer: {
    gap: 8,
    paddingHorizontal: 8,
  },
  selectFilter: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
  },
  selectFilterText: {
    color: COLORS.primary_blue,
    ...FONTS.fs_12_medium,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    padding: 10,
  },
  sortText: {
    ...FONTS.fs_14_medium,
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },

  // 지도 버튼
  mapButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    padding: 10,
    borderRadius: 12,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapButtonText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
});
export default styles;
