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
    marginTop: 13,
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
    fontSize: 14,
  },
    selectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginHorizontal: 20,
    gap: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    height: 40,
    borderColor: COLORS.primary_blue,
    borderWidth: 1,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 12,
  },
  dateText: {
    marginLeft: 8,
    color: COLORS.grayscale_600,
  },
  personRoomContainer: {
    flexDirection: 'row',
    height: 40,
    borderColor: COLORS.primary_blue,
    borderWidth: 1,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 12,
  },
  personText: {
    marginLeft: 8,
    color: COLORS.grayscale_600,
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
  EXimagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.grayscale_300,
    borderRadius: 12,
  },

});

export default styles;
