import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const PROFILE_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // 상단 헤더 배경
  headerBg: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerBgFallback: {
    backgroundColor: COLORS.grayscale_0,
  },
  headerOverlay: {
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 프로필 영역
  profileWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guesthouseNameText: {
    marginTop: 20,
  },
  profileImageWrap: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_200,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 소개/주소 영역
  contentContainer: {
    backgroundColor: COLORS.grayscale_0,
    alignItems: 'center',
    paddingBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  section: {
    alignItems: 'center',
    gap: 4,
  },
  countText: {

  },
  sectionText: {

  },
  hostBtnContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },

  // 탭 바
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    paddingVertical: 12,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    color: COLORS.grayscale_500,
  },
  tabTextActive: {
    color: COLORS.primary_blue,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -12,
    width: '70%',
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.primary_blue,
  },

  // 탭 내용
  tabContentWrapper: {
    backgroundColor: COLORS.grayscale_0,
  },
  tabPage: {
    backgroundColor: COLORS.grayscale_0,
  },
});

export default styles;
