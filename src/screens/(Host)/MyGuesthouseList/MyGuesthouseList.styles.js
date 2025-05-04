import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  buttonContainer: {
    marginTop: 12,
  },
  listContainer: {
    paddingHorizontal: 15,
    marginTop: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    marginBottom: 4,
  },
  date: {
    color: COLORS.gray,
  },
  cardBtnContainer: {
    width: "30%",
  }, 
});

export default styles;
