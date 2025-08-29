import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  // 본문
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // 각 섹션
  contentContainer: {
    marginBottom: 20,
    gap: 20,
  },
  label: {
    ...FONTS.fs_18_semibold,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
  },
  divide: {
    borderWidth: 0.8,
    borderColor: COLORS.grayscale_200,
    flex: 1,
  },

  // mbti
  mbtiGrid: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  mbtiButton: {
    width: '45%',
    padding: 10,
    alignItems: 'center',
  },
  mbtiSelected: {},
  mbtiText: {
    color: COLORS.grayscale_400,
  },
  mbtiSelectedText: {
    color: COLORS.primary_orange,
  },

  // 인스타
  instagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
  },
  atSymbol: {
    marginRight: 2,
  },
  instagramInput: {
    flex: 1,
  },

  // 버튼
  saveButton: {
    marginVertical: 20,
  },
});
