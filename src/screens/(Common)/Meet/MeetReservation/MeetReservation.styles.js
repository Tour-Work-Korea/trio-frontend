import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  devide: {
    width: '100%',
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 24,
  },

  // 이벤트 정보
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  eventThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
  },
  eventTextRow: {
    justifyContent: 'center',
    gap: 6,
  },
  // 예약자 정보
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.grayscale_400,
  },
  row: {
    flexDirection: 'row',
    gap: 40,
    color: COLORS.grayscale_800,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoTitle: {
    color: COLORS.grayscale_600,
  },

  // 요청 사항
  inputWrapper: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
  },
  requestInput: {},

  // 약관 동의
  agreeRowContainer: {
    gap: 12,
  },
  checkedBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeRowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    color: COLORS.grayscale_800,
  },
  agreeRowConent: {
    gap: 12,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    color: COLORS.grayscale_600,
  },
  agreeText: {
    color: COLORS.grayscale_600,
  },
  nessesaryText: {
    color: COLORS.primary_blue,
  },
  seeMore: {
    position: 'absolute',
    right: 0,
  },
  seeMoreText: {
    color: COLORS.primary_blue,
  },
  fixedButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 34,
  },
  // 신청 안내 단계
  guideContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  guideProgressTrack: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
  },
  guideProgressFill: {
    height: 1,
    backgroundColor: COLORS.primary_orange,
  },
  guideContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  guideTitle: {
    marginTop: 8,
    color: COLORS.grayscale_900,
    lineHeight: 28,
  },
  guideRuleScroll: {
    marginTop: 36,
    maxHeight: 320,
  },
  guideRuleList: {
    gap: 32,
    paddingBottom: 4,
  },
  guideRuleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guideRuleNumber: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideRuleNumberText: {
    color: COLORS.grayscale_900,
  },
  guideRuleText: {
    flex: 1,
    color: COLORS.grayscale_800,
    lineHeight: 21,
  },
  guideAgreeBox: {
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_100,
  },
  guideAgreeBoxActive: {
    borderColor: COLORS.semantic_red,
    backgroundColor: COLORS.secondary_red,
  },
  guideUncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: COLORS.semantic_red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideAgreeText: {
    color: COLORS.grayscale_400,
  },
  guideAgreeTextActive: {
    color: COLORS.semantic_red,
  },
  guideBottomButtonWrap: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  guideNextButton: {
  },

});

export default styles;
