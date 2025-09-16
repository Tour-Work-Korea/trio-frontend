import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  view: {flex: 1, backgroundColor: COLORS.grayscale_100},
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 20,
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  // 이름 성별
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {},
  age: {
    color: COLORS.grayscale_500,
    marginLeft: 16,
  },
  profileEdit: {
    position: 'absolute',
    right: 0,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },

  // 유저 정보
  profileContainer: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 8,
    marginRight: 20,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholder: {
    gap: 4,
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  profileText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTitleText: {
    color: COLORS.grayscale_400,
    width: 42,
  },
  profileContentText: {
    marginLeft: 20,
    flex: 1,
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
