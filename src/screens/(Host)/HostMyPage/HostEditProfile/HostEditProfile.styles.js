import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    marginHorizontal: 20,
    paddingTop: 30,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 50,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    backgroundColor: COLORS.grayscale_400,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 8,
  },
  nameText: {
    marginRight: 12,
  },
  infoContainer: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    color: COLORS.grayscale_800,
    marginRight: 8,
    ...FONTS.fs_14_medium,
  },
});
