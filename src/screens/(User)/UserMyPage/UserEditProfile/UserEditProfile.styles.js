import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    marginHorizontal: 15,
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
    backgroundColor: COLORS.stroke_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    backgroundColor: COLORS.gray,
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
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    color: COLORS.black,
    marginRight: 8,
  },
});
