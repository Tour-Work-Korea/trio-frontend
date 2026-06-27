import {Dimensions, StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const MAP_HEIGHT = Math.min(Math.max(SCREEN_HEIGHT * 0.38, 300), 390);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  inputWrap: {
    height: 44,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  input: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    color: COLORS.grayscale_900,
  },
  mapSection: {
    height: MAP_HEIGHT,
    position: 'relative',
    backgroundColor: COLORS.grayscale_100,
  },
  map: {
    flex: 1,
  },
  mapBubble: {
    position: 'absolute',
    top: 84,
    alignSelf: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_900,
  },
  mapBubbleText: {
    color: COLORS.grayscale_0,
  },
  mapBubbleTail: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.grayscale_900,
  },
  targetButton: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.12,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 4,
  },
  currentLocationMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(83, 97, 219, 0.18)',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.grayscale_0,
    backgroundColor: COLORS.primary_blue,
  },
  resultPanel: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
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
  selectedResultItem: {
    backgroundColor: COLORS.neutral_gray,
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
  selectButton: {
    minWidth: 52,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  selectButtonText: {
    color: COLORS.grayscale_800,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingTop: 20,
    color: COLORS.grayscale_500,
  },
});

export default styles;
