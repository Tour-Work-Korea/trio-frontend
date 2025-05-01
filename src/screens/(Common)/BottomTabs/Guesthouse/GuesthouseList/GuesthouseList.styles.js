import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 24,
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.stroke_gray,
    paddingVertical: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 12,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dateText: {
    marginLeft: 8,
    marginRight: 60,
  },
  personText: {
    marginLeft: 8,
  },
  listContent: {
  },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 108,
    borderRadius: 5,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tagText: {
    color: COLORS.scarlet,
    marginRight: 4,
  },
  title: {
    marginBottom: 4,
  },
  name: {
    marginBottom: 6,
  },
  address: {
    color: COLORS.gray,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
//   이것만 폰트 따로 설정해둠
  ratingText: {
    fontSize: 12,
    color: COLORS.black,
  },
  price: {
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default styles;
