import {Platform, StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 96,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  postAvatar: {
    marginRight: 8,
  },
  postNickname: {
    color: COLORS.grayscale_900,
    marginRight: 8,
  },
  postTime: {
    color: COLORS.grayscale_400,
  },
  postTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  postContent: {
    color: COLORS.grayscale_900,
    lineHeight: 22,
  },
  multiImageContainer: {
    gap: 12,
    marginTop: 20,
    paddingRight: 14,
  },
  multiPostImage: {
    width: 174,
    height: 230,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  singlePostImage: {
    width: '100%',
    height: 190,
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  postImageFill: {
    width: '100%',
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 18,
  },
  commentActionRow: {
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
  adBannerContainer: {
    marginTop: 34,
    alignItems: 'center',
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
  highlightedCommentSurface: {
    backgroundColor: COLORS.secondary_yellow,
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
  singleCommentImageButton: {
    width: 148,
    height: 148,
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  singleCommentImage: {
    width: '100%',
    height: '100%',
  },
  commentImageList: {
    gap: 8,
    marginTop: 10,
    paddingRight: 10,
  },
  commentImageButton: {
    width: 108,
    height: 108,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  commentImage: {
    width: '100%',
    height: '100%',
  },
  commentMetaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  commentMetaActionsWithImages: {
    marginTop: 4,
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
  highlightedReplyRow: {
    backgroundColor: COLORS.secondary_yellow,
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
  commentBottomBar: {
    backgroundColor: COLORS.grayscale_0,
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
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
  commentImagePreviewSection: {
    paddingTop: 10,
  },
  commentImagePreviewList: {
    gap: 8,
    paddingHorizontal: 2,
  },
  commentImagePreviewItem: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  commentImagePreview: {
    width: '100%',
    height: '100%',
  },
  commentImageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  commentInputBar: {
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
    minHeight: 44,
    paddingVertical: 0,
    color: COLORS.grayscale_900,
  },
  photoButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default styles;
