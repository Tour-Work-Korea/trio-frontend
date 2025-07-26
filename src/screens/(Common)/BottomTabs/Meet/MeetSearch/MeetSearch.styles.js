import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  headerText: {
    marginVertical: 12,
    color: COLORS.grayscale_500,
  },
  text: {
    color: COLORS.grayscale_500,
    lineHeight: 24,
  },
});

export default styles;