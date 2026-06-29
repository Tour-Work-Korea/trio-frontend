import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  headerText: {
    color: COLORS.grayscale_800,
    lineHeight: 28,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.grayscale_900,
    lineHeight: 20,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    height: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 19,
    backgroundColor: COLORS.grayscale_0,
  },
  dateText: {
    flex: 1,
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
    backgroundColor: COLORS.grayscale_300,
    borderRadius: 12,
  },

  // 검색어 입력 후
  searchResultContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 16,
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

});

export default styles;
