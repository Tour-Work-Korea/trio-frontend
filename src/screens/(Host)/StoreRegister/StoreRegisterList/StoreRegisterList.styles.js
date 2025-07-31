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
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  guestHouseTag: {
    backgroundColor: COLORS.light_gray,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
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
});
