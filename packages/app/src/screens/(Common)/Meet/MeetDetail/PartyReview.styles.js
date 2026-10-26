import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    backgroundColor: COLORS.primary_blue,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  rating: {
    color: COLORS.grayscale_0,
    marginLeft: 4,
  },
  divider: {
    color: COLORS.grayscale_0,
    marginHorizontal: 2,
  },
  reviewCount: {
    color: COLORS.grayscale_0,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 4,
  },
  hiddenImage: {
    opacity: 0,
  },
});

export default styles;
