import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  view: {flex: 1, backgroundColor: COLORS.grayscale_100},

  // 헤더
  topBarContainer: {
    padding: 16,
    backgroundColor: COLORS.grayscale_100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guesthouseSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  topBarTitle: {
    marginRight: 4,
    flexShrink: 1,
  },
  topBarRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // 본문
  outContainer: {
    flex: 1,
  },

  // 메뉴박스
  container: {marginBottom: 20, paddingHorizontal: 20},

  // 상단 호스트 프로필
  headerBg: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  headerBgFallback: {
    backgroundColor: COLORS.grayscale_0,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // 미리보기 버튼
  profileEditButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: COLORS.grayscale_200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  profileEditBtnText: {
    color: COLORS.grayscale_500,
  },

  // 프로필 영역
  profileWrap: {
    alignItems: 'center',
  },
  guesthouseNameText: {
    marginTop: 20,
  },
  profileImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_200,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    alignItems:'center',
    justifyContent: 'center',
  },
  
  // 마이페이지
  bottomSection: {
    marginTop: 16,
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 24,
  },
  section: {},
  sectionTitle: {
    paddingBottom: 8,
    marginBottom: 8,
    color: COLORS.grayscale_800,
    borderBottomColor: COLORS.grayscale_200,
    borderBottomWidth: 0.8,
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
    // marginVertical: 16,
    // height: 0.8,
    // backgroundColor: COLORS.grayscale_200,
  },

  // 프로필 선택 모달
  profileListOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  profileListWrap: {
  },
});
