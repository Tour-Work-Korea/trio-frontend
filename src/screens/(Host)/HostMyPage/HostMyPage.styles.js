import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  view: {flex: 1, backgroundColor: COLORS.grayscale_100},
  outContainer: {
    flex: 1,
    
  },
  // 헤더
  headerText: {
    color: COLORS.grayscale_800,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 13,
  },

  // 본문
  container: {marginBottom: 20, paddingHorizontal: 20,},

  // 상단 호스트 프로필
  headerBg: {
    width: '100%',
    height: 240,
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

  // 프로필 변경 버튼
  profileEditButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: COLORS.grayscale_600,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  profileEditBtnText: {
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
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.grayscale_0,
    backgroundColor: COLORS.grayscale_0,
    marginTop: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    alignItems:'center',
    justifyContent: 'center',
  },
  hostNameText: {
    marginTop: 16,
    color: COLORS.grayscale_0,
    textAlign: 'center',
  },

  // 마이페이지
  bottomSection: {
    marginTop: 16,
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  section: {},
  sectionTitle: {
    marginBottom: 16,
    color: COLORS.grayscale_800,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItemIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: 12,
    color: COLORS.grayscale_700,
  },
  devide: {
    marginVertical: 16,
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
  },
});
