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
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 4,
    borderRadius: 20,
  },
  searchIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchText: {
    color: COLORS.grayscale_600,
    marginLeft: 8,
  },
  filterIconContainer: {
    backgroundColor: COLORS.grayscale_100,
    padding: 4,
    borderRadius: '100%',
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
    backgroundColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 12,
  },
  dateText: {
    marginLeft: 8,
    color: COLORS.grayscale_0,
  },
  personRoomContainer: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 12,
  },
  personText: {
    marginLeft: 8,
    color: COLORS.grayscale_0,
  },

  // 게하 리스트 디자인
  listContent: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
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
  ratingText: {
    fontSize: 12,
    color: COLORS.grayscale_0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
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
  name: {
    marginBottom: 4,
  },
  address: {
    color: COLORS.grayscale_500,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  price: {
  },
  heartIcon: {
    position: 'absolute',
    right: 0,
  },

  // 선택후 날짜, 인원, 객실 출력 디자인
  printSelectContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  printSelectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
  },
  printDateText: {
    color: COLORS.grayscale_500,
  },
  printGuestText: {
    color: COLORS.grayscale_500,
  },
});

export default styles;
