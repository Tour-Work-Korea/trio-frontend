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
  buttonContainer: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  whiteBtnContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  halfButtonWrapper: {
    flex: 1,
  },
});

export default styles;
