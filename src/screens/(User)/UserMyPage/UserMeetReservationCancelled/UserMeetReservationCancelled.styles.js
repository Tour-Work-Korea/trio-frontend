import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  content: {
    flex: 1,
  },

  listStylesContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeText: {
    color: COLORS.grayscale_700,
  },
  divide: {
    marginBottom: 12,
    marginTop: 4,
    height: 1,
    backgroundColor: COLORS.grayscale_200,
  },
  infoRow: {
    flexDirection: 'row',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 4,
    marginRight: 12,
  },
  infoContent: {
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  partyTitle: {
    color: COLORS.grayscale_700,
  },
  guesthouseText: {
    color: COLORS.grayscale_500,
    flexShrink: 1,
  },
});

export default styles;
