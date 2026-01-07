import {StyleSheet, Dimensions, Platform} from 'react-native';
import {COLORS} from '@constants/colors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const HEADER_HEIGHT = 340;
const PROFILE_SIZE = 60;

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
    height: HEADER_HEIGHT,
    position: 'relative',
    alignItems: 'center',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // 프로필 영역
  profileWrap: {
    alignItems: 'center',
    paddingBottom: 18,
    position: 'absolute',
    top: '40%',
    height: '100%',
  },
  guesthouseNameText: {
    color: COLORS.grayscale_0,
  },
  profileImageWrap: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.grayscale_0,
    backgroundColor: COLORS.grayscale_0,
    marginTop: 24,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  hostNameText: {
    marginTop: 12,
    color: COLORS.grayscale_0,
    textAlign: 'center',
  },

  // 소개/주소 영역
  contentContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: {
  },
  sectionTitle: {
    marginBottom: 8,
  },
  introText: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  addressText: {
    color: COLORS.grayscale_700,
  },

  // 탭 바
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    marginTop: 12,
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
});

export default styles;
