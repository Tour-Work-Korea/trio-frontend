import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  body: {
    paddingHorizontal: 20,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
});