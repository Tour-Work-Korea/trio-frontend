import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@constants/colors';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: width * 0.85,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardContent: {
    alignItems: 'center',
  },
  name: {
    color: COLORS.black,
  },
  reviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  reviewCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: COLORS.scarlet,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default styles;
