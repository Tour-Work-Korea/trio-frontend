import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const PROFILE_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  contentArea: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
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
    paddingBottom: 20,
  },
  headerBgFallback: {
    backgroundColor: COLORS.grayscale_0,
  },
  headerOverlay: {
  },

  // 프로필 영역
  profileWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageWrap: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_200,
  },
  avatarEditWrap: {
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    alignItems:'center',
    justifyContent: 'center',
  },
  // 이름
  guesthouseNameInputBox: {
    marginTop: 8,
    width: 220,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  guesthouseNameText: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },

  // 프로필 이미지 변경 버튼
  profiImgEditBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 100,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },

  // 하단 버튼
  fixedBottomBar: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 40,
  },
  applyBtn: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary_orange,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  applyBtnText: {
    color: COLORS.grayscale_0
  },

});

export default styles;
