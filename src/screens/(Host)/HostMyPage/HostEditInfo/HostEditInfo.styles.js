import {StyleSheet, Platform} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  // 본문
  container: {
    marginHorizontal: 16,
    paddingTop: 20,
    justifyContent: 'space-between',
    flex: 1,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        marginBottom: 40,
      },
    }),
  },
  buttonContainer: {
    marginBottom: 8,
  },

  // 각 섹션
  contentContainer: {
    marginBottom: 24,
  },
  contentRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
  },

  // 버튼
  saveButton: {
    marginTop: 40,
    marginBottom: 20,
  },
});
