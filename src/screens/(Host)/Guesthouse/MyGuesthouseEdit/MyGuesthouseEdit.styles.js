import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  // 등록 폼
  bodyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.grayscale_900,
  },

  // 설명 텍스트
  explainText: {
    color: COLORS.primary_orange,
    textAlign: 'center',
  },

  // 하단 버튼
  bottomContainer: {
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
  previewButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  previewText: {
    color: COLORS.grayscale_800,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary_orange,
  },
  submitText: {
    color: COLORS.grayscale_0,
  },

});

export default styles;
