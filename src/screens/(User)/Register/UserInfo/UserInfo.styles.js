import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '../../../constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  body: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  agreementContainer: {
    marginBottom: 12,
    borderRadius: 10,
    borderColor: COLORS.stroke_gray,
    borderWidth: 1,
  },
  agreementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stroke_gray,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.light_gray,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: COLORS.scarlet, // Example selected color
    color: 'white',
  },
});
