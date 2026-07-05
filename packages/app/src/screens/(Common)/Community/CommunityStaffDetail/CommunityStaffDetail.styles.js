import {Platform, StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  guesthouseName: {
    flexShrink: 1,
    color: COLORS.grayscale_900,
    marginRight: 8,
  },
  deadline: {
    color: COLORS.grayscale_400,
  },
  recruitTitle: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_900,
    lineHeight: 23,
    marginBottom: 14,
  },
  shortDescription: {
    color: COLORS.grayscale_900,
    lineHeight: 22,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  tabSection: {
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  activeTabItem: {
    borderBottomColor: COLORS.primary_blue,
  },
  tabText: {
    color: COLORS.grayscale_700,
  },
  activeTabText: {
    color: COLORS.primary_blue,
  },
  infoCard: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.grayscale_100,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lastInfoRow: {
    marginBottom: 0,
  },
  infoLabel: {
    width: 74,
    color: COLORS.grayscale_400,
  },
  infoValue: {
    flex: 1,
    color: COLORS.grayscale_900,
    lineHeight: 18,
  },
  detailSection: {
    marginTop: 24,
  },
  detailTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 10,
  },
  detailText: {
    color: COLORS.grayscale_800,
    lineHeight: 22,
  },
  detailLinkText: {
    color: COLORS.primary_blue,
    textDecorationLine: 'underline',
  },
  commentList: {
    marginTop: 44,
    gap: 16,
  },
  commentBlock: {
    position: 'relative',
  },
  commentSurface: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: -10,
  },
  commentThreadConnector: {
    position: 'absolute',
    left: 20,
    top: 40,
    bottom: 32,
    width: 46,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 18,
    borderColor: COLORS.grayscale_200,
  },
  commentContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    marginRight: 10,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  commentNickname: {
    color: COLORS.grayscale_900,
  },
  commentTime: {
    color: COLORS.grayscale_400,
  },
  editedText: {
    color: COLORS.grayscale_400,
  },
  commentText: {
    color: COLORS.grayscale_900,
    lineHeight: 28,
  },
  commentMetaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  commentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: COLORS.grayscale_900,
  },
  commentManageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  commentManageButton: {
    paddingVertical: 2,
  },
  commentManageText: {
    color: COLORS.grayscale_500,
  },
  commentManageDot: {
    color: COLORS.grayscale_300,
  },
  commentDeleteText: {
    color: COLORS.semantic_red,
  },
  replySection: {
    position: 'relative',
    marginLeft: 20,
  },
  replyList: {
    flex: 1,
    gap: 12,
    marginLeft: 62,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    padding: 10,
    marginLeft: -10,
  },
  replyMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  replyMoreText: {
    color: COLORS.grayscale_500,
  },
  commentFooterLoading: {
    marginTop: 20,
    marginBottom: 8,
  },
  bottomContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    backgroundColor: COLORS.grayscale_0,
  },
  bottomInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyTargetBox: {
    paddingHorizontal: 2,
    paddingTop: 10,
  },
  replyTargetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  replyTargetTitle: {
    flex: 1,
    color: COLORS.grayscale_400,
  },
  replyTargetCancel: {
    color: COLORS.primary_orange,
  },
  replyTargetContent: {
    color: COLORS.grayscale_900,
  },
  commentInputBar: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.grayscale_100,
    marginBottom: Platform.OS === 'ios' ? 28 : 16,
    marginTop: 12,
  },
  commentInputBarFocused: {
    marginBottom: 8,
  },
  commentInput: {
    flex: 1,
    lineHeight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    color: COLORS.grayscale_900,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary_orange,
  },
  sendButtonText: {
    color: COLORS.grayscale_0,
    lineHeight: 24,
  },
  inlineApplyButton: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary_orange,
    marginTop: 12,
    marginBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  inlineApplyText: {
    color: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default styles;
