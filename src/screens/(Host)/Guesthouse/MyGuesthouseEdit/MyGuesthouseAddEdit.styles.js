import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 24,
  },
  devide: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubTitle: {
    marginBottom: 4,
    color: COLORS.gray,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  adressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
  },
  // 이미지 업로드
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
  roomDetailBtnContainer: {
    marginTop: 12,
  },
  // 편의시설 체크 버튼
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
    width: "45%"
  },
  optionText: {
  },
  // 시간 선택
  timeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal : 36,
    alignItems: 'center',
  },
  //입력 넓은 폼
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    height: 60,
  },
  textArea2: {
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    height: 120,
  },

  buttonContainer: {
    backgroundColor: COLORS.white,
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
