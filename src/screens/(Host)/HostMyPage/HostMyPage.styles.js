import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  container: {
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    color: COLORS.black,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
    color: COLORS.grayscale_400,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    marginBottom: 10,
    color: COLORS.grayscale_800,
    ...FONTS.fs_16_semibold,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  menuItemIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: 12,
    color: COLORS.grayscale_800,
    ...FONTS.fs_14_semibold,
  },
});
