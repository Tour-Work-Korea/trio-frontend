import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  // 리스트
  body: {
    backgroundColor: COLORS.grayscale_0,
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  row: {
    alignItems: 'stretch',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: COLORS.grayscale_100,
  },
  // 우 상단
  middle: {
    flex: 1,
    justifyContent: 'space-between',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  // 게하 이름
  ghName: {
    color: COLORS.grayscale_600,
    flex: 1,
  },
  // 글 제목
  titleText: {
    color: COLORS.grayscale_800,
    flex: 1,
  },
  // 참여 인원수
  heartText: {
    color: COLORS.grayscale_400,
  },
  // 가격
  priceText: {
    alignSelf: 'flex-end',
    color: COLORS.grayscale_800,
  },

  
  down: {
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressText: {
    color: COLORS.grayscale_500,
    flex: 1,
  },

});

export default styles;
