import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  notiText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
    marginBottom: 24,
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
  roomList: {
    gap: 16,
  },
  roomNameText: {
    color: COLORS.grayscale_1000,
  },
});
