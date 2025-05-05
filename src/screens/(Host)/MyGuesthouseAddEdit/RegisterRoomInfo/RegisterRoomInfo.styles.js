import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 24,
  },
  devide: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginBottom: 16,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  sectionSubTitle: {
    marginBottom: 4,
    color: COLORS.gray,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    flex: 1,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageThumb: {
    width: 76,
    height: 76,
    borderRadius: 5,
    marginRight: 8,
  },
  imageAddBox: {
    width: 76,
    height: 76,
    borderRadius: 5,
    backgroundColor: COLORS.light_gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: "center",
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    marginVertical: 8,
    marginHorizontal: 4,
    width: '45%',
  },
  buttonGroup: {
    marginTop: 32,
    gap: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  whiteBtnContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  halfButtonWrapper: {
    flex: 1,
  },
});

export default styles;
