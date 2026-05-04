import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  view: {flex: 1, backgroundColor: COLORS.grayscale_0},
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
  },
  adBannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 8,
    paddingBottom: 8,
  },

  topBarContainer: {
    padding: 16,
    backgroundColor: COLORS.grayscale_0,
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
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -10,
    width: 18,
    height: 18,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: COLORS.grayscale_0,
    fontSize: 10,
    fontWeight: '600',
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  // 헤더
  headerText: {
    color: COLORS.grayscale_800,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 13,
  },

  // 본문
  container: {},

  // 유저 프로필
  userInfoContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 88,
    height: 88,
    marginRight: 12,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileTextGroup: {
    flex: 1,
    marginRight: 12,
    gap: 8,
  },
  profileTextSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  profileSectionTitle: {
    color: COLORS.grayscale_400,
    width: 36,
  },
  name: {
    color: COLORS.grayscale_800,
  },
  profileMeta: {
    color: COLORS.grayscale_800,
  },
  profileInstagram: {
    color: COLORS.grayscale_800,
    flex: 1,
  },
  profileEdit: {
    backgroundColor: COLORS.grayscale_200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  profileEditText: {
    color: COLORS.grayscale_800,
  },

  // 유저 프로모션 섹션
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginVertical: 16,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_0,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  promoSection: {
    alignItems: 'center',
    gap: 4,
  },
  promoSectionText: {
    color: COLORS.primary_orange,
  },

  // 마이페이지
  bottomSection: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  section: {},
  staffSection: {
    marginBottom: 16,
  },
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

  // 회원 탈퇴
  deleteAccount: {
    marginVertical: 8,
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  deleteAccountText: {
    color: COLORS.grayscale_400,
  },
});
