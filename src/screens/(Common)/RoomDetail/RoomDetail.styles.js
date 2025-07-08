import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // 사진, 뒤로가기 버튼
  imageContainer: {

  },
  image: {
    width: '100%',
    height: 280,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 16,
  },

  // 방이름 ~ 날짜
  contentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  // 방 이름, 설명, 가격
  roomInfo: {
    borderBottomWidth: 0.4,
    borderColor: COLORS.grayscale_300,
  },
  roomType: {
    color: COLORS.grayscale_800,
  },
  description: {
    marginTop: 4,
    color: COLORS.grayscale_500,
  },
  price: {
    alignSelf: 'flex-end',
    marginVertical: 20,
    color: COLORS.grayscale_800,
  },

  // 날짜
  dateTitle: {
    marginTop: 20,
    color: COLORS.grayscale_800,
  },
  dateBoxContainer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  dateBoxCheckIn: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  dateBoxCheckOut: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    marginBottom: 6,
    color: COLORS.grayscale_400,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  button: {
    paddingHorizontal: 20,
  },
});

export default styles;
