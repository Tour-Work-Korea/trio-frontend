import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  image: {
    width: '100%',
    height: 260,
  },
  contentWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  roomInfo: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.light_gray,
  },
  roomType: {
    marginBottom : 4,
  },
  description: {
    marginBottom : 4,
  },
  price: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  dateTitle: {
    marginVertical: 12,
  },
  dateBoxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
    gap: 4,
  },
  dateBoxCheckIn: {
    backgroundColor: COLORS.light_gray,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    flex: 1,
    padding: 16,
    gap: 2,
  },
  dateBoxCheckOut: {
    backgroundColor: COLORS.light_gray,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    flex: 1,
    padding: 16,
    gap: 2,
  },
  dateLabel: {
    marginBottom: 4,
    color: COLORS.gray,
  },
  dateText: {
  },
  button: {
    
  },
});

export default styles;
