import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  topIcons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  shareIconContainer: {
    backgroundColor: COLORS.white,
    padding: 4,
    borderRadius: 100,
    justifyContent: 'center',
    alignContent: 'center',
  },
  heartIconContainer: {
    backgroundColor: COLORS.white,
    padding: 4,
    borderRadius: 100,
    justifyContent: 'center',
    alignContent: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  contentTopWrapper: {
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  name: {
    marginBottom: 8,
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  address: {
    color: COLORS.gray,
    flexShrink: 1,
  },
  sectionSpacing: {
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 15,
    marginRight: 12,
  },
  rating: {
  },
  reviewCount: {
    color: COLORS.gray,
  },
  iconServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 12,
  },
  iconWrapper: {
    alignItems: 'center',
  },
  iconServiceText: {
    marginTop: 4,
  },
  dateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  roomCard: {
    marginBottom: 12,
  },
  roomImage: {
    width: '100%',
    height: 160,
    borderRadius: 5,
  },
  roomInfo: {
    padding: 12,
  },
  roomType: {
    marginBottom: 4,
  },
  checkin: {
    marginBottom: 4,
    color: COLORS.gray,
  },
  roomPrice: {
    alignSelf: 'flex-end',
  },
  tabMenuWrapper: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginVertical: 16,
  },
  tabButton: {
    alignItems: 'center',
  },
  tabUnderline: {
    marginTop: 4,
    height: 2,
    width: 20,
    backgroundColor: COLORS.primary_blue,
  },
  introductionContainer: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  introductionText: {
    lineHeight: 20,
  },
  // reviewContainer: {
  //   backgroundColor: COLORS.white,
  //   marginTop: 12,
  //   paddingHorizontal: 15,
  //   paddingVertical: 12,
  // },
  // devideLine: {
  //   marginTop: 16,
  //   height: 1,
  //   width: '100%',
  //   backgroundColor: COLORS.stroke_gray,
  // },
  // reviewCard: {
  //   marginBottom: 16,
  // },
  // reviewHeader: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 12,
  //   marginBottom: 8,
  // },
  // profileImage: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: COLORS.light_gray,
  // },
  // starRow: {
  //   flexDirection: 'row',
  //   marginTop: 4,
  //   gap: 2,
  // },
  // reviewImages: {
  //   flexDirection: 'row',
  //   gap: 8,
  //   marginBottom: 8,
  // },
  // reviewImageThumb: {
  //   width: 100,
  //   height: 100,
  //   borderRadius: 5,
  // },
});

export default styles;
