import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@constants/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  body: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },

  // 게하 선택 드롭다운 박스
  selectContainer: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderColor: COLORS.primary_blue,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devide: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 12,
  },
});

export default styles;
