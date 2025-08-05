import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  listContiner: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 16,
  },

  // 게하 리스트
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  // 이미지
  image: {
    width: 112,
    height: 112,
    borderRadius: 4,
    marginRight: 12,
  },
  // 별점
  ratingBox: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: COLORS.grayscale_800,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    top: 4,
    left: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: COLORS.grayscale_0,
  },

  // 오른쪽 내용
  content: {
    flex: 1,
    height: '100%',
  },
  topContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // 해시태그
  hashtagContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  hashtagBox: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  hashtag: {
    color: COLORS.primary_blue,
  },

  favoriteButton: {
  },

  // 게하 이름
  name: {
    marginTop: 8,
  },
  // 게하 주소
  address: {
    marginTop: 4,
    color: COLORS.grayscale_500,
  },
  // 게하 가격
  price: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },

  // 빈 회면
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  emptyButton: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});

export default styles;
