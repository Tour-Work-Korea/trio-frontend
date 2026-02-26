import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  body: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
  },

  notiText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
    marginBottom: 16,
  },
  guesthouseSelectContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16,
  },
  guesthouseSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    gap: 8,
  },
  guesthouseSelectText: {
    flex: 1,
    color: COLORS.grayscale_900,
  },
  guesthouseDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
    elevation: 3,
  },
  guesthouseOption: {
    paddingVertical: 8,
  },
  guesthouseOptionText: {
    color: COLORS.grayscale_900,
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
  emptyText: {
    color: COLORS.grayscale_500,
    textAlign: 'center',
    paddingVertical: 8,
  },
  roomNameText: {
    color: COLORS.grayscale_1000,
  },
});
