import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  screen: {
    flex: 1,
    paddingBottom: 28,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // 안내문구
  descriptionBox: {
    backgroundColor: COLORS.secondary_yellow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  descriptionText: {
    color: COLORS.grayscale_700,
    lineHeight: 16,
  },

  // 입력란
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countText: {
    color: COLORS.grayscale_400,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    lineHeight: 18,
  },
  placeholderText: {
    color: COLORS.grayscale_400,
  },
  rewriteText: {
    color: COLORS.grayscale_500,
  },

});
