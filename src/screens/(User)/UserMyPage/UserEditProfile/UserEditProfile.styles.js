import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  // 본문
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    marginHorizontal: 16,
    marginVertical: 20,
    paddingHorizontal: 8,
    paddingVertical: 20,
    borderRadius: 8,
  },

  // 이미지
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 이미지 추가 버튼
  plusButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    backgroundColor: COLORS.secondary_blue,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 각 섹션
  contentContainer: {
    marginBottom: 16,
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

  // 성별
  genderRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: COLORS.grayscale_100,
    padding: 10,
    borderRadius: 8,
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
  },
  genderSelected: {},
  genderText: {
    color: COLORS.grayscale_400,
    fontWeight: '500',
  },
  genderSelectedText: {
    color: COLORS.primary_orange,
    fontWeight: '600',
  },

  // 나이, 출생연도
  ageBirthYearRow: {
    flexDirection: 'row',
    gap: 16,
  },
  row: {
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
    width: '22%',
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
    marginVertical: 40,
  },
});
