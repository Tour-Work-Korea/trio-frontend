import {StyleSheet, Dimensions, Platform} from 'react-native';
import {COLORS} from '@constants/colors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const HEADER_HEIGHT = 280;
const PROFILE_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
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
    justifyContent: 'center',
  },
  headerBgFallback: {
    backgroundColor: COLORS.grayscale_700,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // 배경사진 변경 버튼
  bgEditBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: COLORS.grayscale_600,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  bgEditBtnText: {
    color: COLORS.grayscale_0,
  },

  // 프로필 영역
  profileWrap: {
    alignItems: 'center',
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
    backgroundColor: COLORS.grayscale_200,
    marginTop: 24,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    alignItems:'center',
    justifyContent: 'center',
  },
  // 이름
  hostNameInputBox: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderRadius: 4,
  },
  hostNameText: {
    color: COLORS.grayscale_0,
    textAlign: 'center',
  },

  // 프로필 이미지 변경 버튼
  profiImgEditBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 100,
    padding: 4,
  },

  // 소개/주소 영역
  contentContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  introInputBox: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    height: 200,
  },
  introText: {
    color: COLORS.grayscale_700,
    lineHeight: 24,
  },

  // 하단 버튼
  bottomBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },

});

export default styles;
