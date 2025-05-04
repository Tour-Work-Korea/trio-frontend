import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 15,
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
  section: {
    borderTopWidth: 1,
    borderColor: COLORS.stroke_gray,
    paddingVertical: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  agreeRowContainer: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: COLORS.stroke_gray,
    overflow: 'hidden',
  },
  agreeRowTitle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  agreeRowConent: {
    backgroundColor: COLORS.light_gray,
  },
  agreeRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    marginTop: 6,
  },
  agreeText: {
    marginLeft: 4,
  },  
  button: {
  },
});

export default styles;
