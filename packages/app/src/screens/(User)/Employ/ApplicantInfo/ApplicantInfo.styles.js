import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 120,
  },
  label: {
    color: COLORS.grayscale_900,
  },
  dateInput: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_0,
  },
  dateInputText: {
    color: COLORS.grayscale_900,
  },
  dateInputPlaceholder: {
    color: COLORS.grayscale_400,
  },
  calendar: {
    marginTop: 0,
  },
  messageHeader: {
    marginTop: 24,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageCount: {
    color: COLORS.grayscale_400,
  },
  messageCountActive: {
    color: COLORS.primary_orange,
  },
  messageInput: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingHorizontal: 16,
    color: COLORS.grayscale_900,
    backgroundColor: COLORS.grayscale_0,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    backgroundColor: COLORS.grayscale_0,
  },
  nextButton: {
  },
});

export default styles;
