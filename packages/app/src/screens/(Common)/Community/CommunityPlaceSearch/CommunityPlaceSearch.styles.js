import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  inputWrap: {
    height: 44,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  input: {
    height: 44,
    paddingVertical: 0,
    color: COLORS.grayscale_900,
  },
  guideText: {
    marginTop: 18,
    paddingHorizontal: 16,
    color: COLORS.grayscale_500,
  },
  loading: {
    paddingTop: 28,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 18,
    paddingHorizontal: 16,
    color: COLORS.semantic_red,
  },
  resultList: {
    paddingTop: 14,
    paddingBottom: 28,
  },
  resultItem: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.grayscale_200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultTextWrap: {
    flex: 1,
  },
  resultTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  resultMeta: {
    color: COLORS.grayscale_500,
  },
  selectText: {
    color: COLORS.primary_orange,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingTop: 20,
    color: COLORS.grayscale_500,
  },
});

export default styles;
