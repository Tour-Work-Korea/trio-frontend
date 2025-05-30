import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  bannerContainer: {
    marginVertical: 15,
  },
  banner: {
    alignSelf: 'center',
    width: '90%',
    height: 160,
    borderRadius: 10,
  },
  bottomView: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 4,
    marginHorizontal: 15,
  },
  storyList: {
    paddingHorizontal: 15,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  storyImageContainer: {
    padding: 2,
    borderWidth: 2,
    borderColor: COLORS.scarlet,
    borderRadius: 50,
  },
  storyImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  storyText: {
    marginTop: 8,
  },
  guesthouseList: {
    paddingHorizontal: 15,
  },
  guesthouseCard: {
    width: 114,
    marginRight: 12,
  },
  guesthouseImage: {
    width: '100%',
    height: 120,
    borderRadius: 5,
  },
  guesthouseCategory: {
    marginTop: 8,
    color: COLORS.scarlet,
  },
  guesthouseTitle: {
    marginTop: 4,
  },
  guesthousePriceName: {
    marginTop: 4,
    alignSelf: 'flex-end',
    color: COLORS.scarlet,
  },
  guesthousePrice: {
    color: COLORS.black,
  },
  jobCard: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    alignItems: 'center',
  },
  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 10,
  },
  jobGuesthouse: {
    color: COLORS.black,
  },
  jobTitle: {
    marginTop: 6,
    color: COLORS.black,
  },
  jobAdress: {
    color: COLORS.gray,
    marginTop: 12,
  },
  jobSubInfo: {
    color: COLORS.gray,
  },
  jobSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  jobCount: {
    color: COLORS.black,
  },
  applyButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 15,
  },
  applyButtonText: {
    color: COLORS.black,
  },  
});
