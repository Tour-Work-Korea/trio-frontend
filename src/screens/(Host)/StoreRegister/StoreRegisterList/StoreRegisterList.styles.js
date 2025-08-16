import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  body: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  headerText: {
    color: COLORS.scarlet, // Red-orange color
    textAlign: 'right',
    marginVertical: 12,
  },

  postingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },

  titleRow: {
    marginBottom: 10,
  },
  detailText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 15,
  },
  dateRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  dateLabel: {
    color: COLORS.gray,
    marginRight: 5,
  },
  date: {
    color: COLORS.gray,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary_orange,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  addButtonLocation: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  addButtonText: {
    color: COLORS.grayscale_0,
    marginRight: 10,
  },
});
