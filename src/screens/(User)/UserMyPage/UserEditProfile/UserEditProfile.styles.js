import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 닉네임
  nicknameSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  nicknameTitle: {
    color: COLORS.grayscale_400,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nicknameInput: {
    minWidth: 90,
    maxWidth: 140,
    textAlign: 'center',
    color: COLORS.grayscale_900,
    paddingVertical: 0,
    borderBottomColor: COLORS.grayscale_300,
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  plusButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 4,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 프로필 정보
  sectionGroup: {
    gap: 28,
  },
  section: {},
  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    color: COLORS.grayscale_900,
    marginRight: 16,
  },
  infoValue: {
    color: COLORS.grayscale_500,
    flex: 1,
    textAlign: 'right',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  mbtiGrid: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 4,
  },
  mbtiButton: {
    width: '22%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  mbtiSelected: {},
  mbtiText: {
    color: COLORS.grayscale_400,
  },
  mbtiSelectedText: {
    color: COLORS.primary_orange,
  },
  instagramSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    flex: 1,
  },
  atSymbol: {
    marginRight: 8,
    color: COLORS.grayscale_900,
  },
  instagramInput: {
    flex: 1,
    color: COLORS.grayscale_900,
    paddingVertical: 0,
  },
  saveButton: {
    // alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 40,
    right: 16,
    backgroundColor: COLORS.primary_orange,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  saveButtonText: {
    color: COLORS.grayscale_0,
  },
});
