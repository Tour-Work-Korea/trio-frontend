import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

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
  headerContainer: {
    marginBottom: 12,
    borderRadius: 10,
    borderColor: COLORS.stroke_gray,
    borderWidth: 1,
    padding: 15,
    backgroundColor: COLORS.light_gray,
  },
  sectionContainer: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  imageUploadBox: {
    height: 150,
    width: '100%',
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
