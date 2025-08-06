import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  bodyContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flex: 1,
  },
  // 게하 리스트
  listContainer: {
    minHeight: '80%',
    maxHeight: '90%',
  },
  card: {
    flexDirection: 'row',
  },
  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 12,
  },
  cardContent: {
    justifyContent: 'space-between',
    flex: 1,
  },
  // 게하 정보
  infoContent: {
    paddingVertical: 4,
  },
  name: {
    marginBottom: 4,
  },
  adress: {
    color: COLORS.grayscale_500,
  },
  // 버튼들
  cardBtnContainer: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'flex-end',
  },

  // 게하 추가 버튼
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary_orange,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    position: 'absolute',
    right: 20,
    bottom : 20,
  },
  addButtonText: {
    color: COLORS.grayscale_0,
    marginRight: 10,
  },
  
});

export default styles;
