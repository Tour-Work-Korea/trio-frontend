import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 12,
  },
  //헤더
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    color: COLORS.grayscale_800,
  },

  // 검색 박스
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  input: {
    flex: 1,
    color: COLORS.grayscale_800,
  },

  // 이벤트 리스트
  meetListContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: COLORS.grayscale_500,
    marginBottom: 16,
    alignSelf: 'center',
  },
  itemWrap: {
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_100,
    paddingHorizontal: 20,
  },
  itemTopWrap: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  infoWrap: {
    flex: 1,
  },
  nameHeartWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeText: {
    color: COLORS.grayscale_600,
  },

  titleCapacityWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  titleText: {
    color: COLORS.grayscale_800,
  },
  countText: {
    color: COLORS.grayscale_400,
  },

  priceText: {
    color: COLORS.grayscale_800,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },

  itemBottomWrap: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10,
  },
  addressText: {
    color: COLORS.grayscale_500,
  },
  timeText: {
    color: COLORS.grayscale_800,
  },
  timeTextToday: {
    color: COLORS.primary_orange,
  },
});

export default styles;
