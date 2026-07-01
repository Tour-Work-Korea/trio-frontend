import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  headerText: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
    marginRight: 12,
    marginVertical: 16,
  },
  searchBackButton: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 8,
  },
  searchBarAndroid: {
    height: 42,
    paddingVertical: 0,
  },
  searchInput: {
    flex: 1,
    color: COLORS.grayscale_800,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  searchInputSmall: {
    fontSize: 13,
  },
  searchInputAndroid: {
    height: 40,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    height: 38,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 19,
    backgroundColor: COLORS.grayscale_0,
  },
  dateText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
  personRoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 19,
    backgroundColor: COLORS.grayscale_0,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 19,
    backgroundColor: COLORS.grayscale_0,
  },
  filterText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
  personText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },

  // 지역 선택
  regionContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    flex: 1,
  },
  leftRegionList: {
    alignSelf: 'flex-start',
    width: 80,
    backgroundColor: COLORS.grayscale_100,
    padding: 4,
    borderRadius: 12,
  },
  regionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionItemSelected: {
    backgroundColor: COLORS.grayscale_0,
  },
  regionText: {
    color: COLORS.grayscale_900,
  },
  regionTextSelected: {
    color: COLORS.primary_blue,
    fontWeight: '600',
  },
  rightSubRegionGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    marginLeft: 20,
  },
  subRegionItem: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRegionText: {
    marginTop: 4,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionImgPlaceholder: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 검색어 입력 후
  searchResultContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 8,
    paddingHorizontal: 20,
    flex: 1,
  },
  searchResultSection: {
    marginBottom: 10,
    gap: 10,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultSubText: {
    color: COLORS.grayscale_500,
    marginTop: 2,
  },
  resultIconBox: {
    padding: 4,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultDivider: {
    height: 1,
    backgroundColor: COLORS.grayscale_300,
    marginBottom: 10,
  },
  recentSearchHeader: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentSearchTitle: {
    color: COLORS.grayscale_900,
  },
  recentSearchClearText: {
    color: COLORS.grayscale_500,
  },
  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  recentSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentSearchKeyword: {
    flexShrink: 1,
    color: COLORS.grayscale_900,
  },
  recentSearchDeleteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  recentSearchDeleteText: {
    color: COLORS.grayscale_400,
  },
});

export default styles;
