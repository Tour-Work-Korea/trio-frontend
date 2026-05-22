import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

import Avatar from '@components/Avatar';
import Header from '@components/Header';
import Loading from '@components/Loading';
import AlertModal from '@components/modals/AlertModal';
import CommunityImageModal from '@components/modals/CommunityImageModal';
import {FONTS} from '@constants/fonts';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {toggleFavorite} from '@utils/toggleFavorite';
import styles from './CommunityDetail.styles';
import HeartIcon from '@assets/images/heart_black.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import CommentIcon from '@assets/images/chat_black.svg';
import PhotoIcon from '@assets/images/add_image_gray.svg';
import XIcon from '@assets/images/x_gray.svg';
import {COLORS} from '@constants/colors';

const COMMENT_MAX_LENGTH = 300;
const COMMENT_PAGE_SIZE = 20;
const COMMENT_HIGHLIGHT_DURATION = 1700;
const MB = 1024 * 1024;
const JPEG_CONTENT_TYPE = 'image/jpeg';
const COMMENT_IMAGE_LIMITS = {
  maxCount: 10,
  maxSingleFileSizeMb: 20,
  maxTotalFileSizeMb: 100,
};

const communityDetailBannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-6098454400067335/4619471702',
      android: 'ca-app-pub-6098454400067335/5920208998',
    });

const formatRelativeTime = dateTime => {
  if (!dateTime) {
    return '';
  }

  const createdTime = new Date(dateTime).getTime();
  const diffMs = Date.now() - createdTime;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return '방금';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}일`;
  }

  const date = new Date(dateTime);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}.${day}`;
};

const getAnchorPage = anchor => {
  const page =
    anchor?.commentPage ??
    anchor?.page ??
    anchor?.parentCommentPage ??
    anchor?.rootCommentPage ??
    0;

  return Number.isFinite(Number(page)) ? Number(page) : 0;
};

const getAnchorCommentId = (anchor, fallbackCommentId) =>
  anchor?.commentId ??
  fallbackCommentId ??
  anchor?.parentCommentId ??
  anchor?.rootCommentId;

const getAnchorParentCommentId = anchor =>
  anchor?.parentCommentId ?? anchor?.rootCommentId ?? null;

const isCommentEdited = item => {
  if (!item?.createdAt || !item?.updatedAt) {
    return false;
  }

  return (
    Math.abs(
      new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime(),
    ) > 1000
  );
};

const CommunityDetail = ({route}) => {
  const navigation = useNavigation();
  const {postId, commentAnchor, targetCommentId} = route.params ?? {};
  const currentUserPhotoUrl = useUserStore(
    state => state.userProfile?.photoUrl,
  );
  const currentUserRole = useUserStore(state => state.userRole);
  const scrollViewRef = useRef(null);
  const commentInputRef = useRef(null);
  const commentLayoutMapRef = useRef({});
  const commentListOffsetYRef = useRef(0);
  const replySectionLayoutMapRef = useRef({});
  const highlightTimerRef = useRef(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const [commentsLast, setCommentsLast] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreCommentsLoading, setIsMoreCommentsLoading] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replyTarget, setReplyTarget] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [commentImages, setCommentImages] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editingTarget, setEditingTarget] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const [commentAlert, setCommentAlert] = useState({
    visible: false,
    title: '',
    message: '',
    buttonText: '확인',
    buttonText2: null,
    color: COLORS.primary_orange,
    onPress: () => {},
    onPress2: null,
  });
  const shouldShowAd = useMemo(() => Math.random() < 0.25, []);
  const hasCommentValue = commentValue.trim().length > 0;
  const hasCommentImages = commentImages.length > 0;
  const canWriteComment =
    currentUserRole === 'USER' || currentUserRole === 'ADMIN';

  useEffect(() => {
    const resolveCommentAnchor = async () => {
      if (commentAnchor) {
        return commentAnchor;
      }

      if (!targetCommentId) {
        return null;
      }

      try {
        const response = await communityApi.getCommentAnchor(targetCommentId, {
          size: COMMENT_PAGE_SIZE,
        });

        return response.data;
      } catch (error) {
        console.warn('fetchCommunityCommentAnchor 실패:', error);
        return null;
      }
    };

    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        commentLayoutMapRef.current = {};
        commentListOffsetYRef.current = 0;
        replySectionLayoutMapRef.current = {};
        const anchor = await resolveCommentAnchor();
        const initialCommentPage = getAnchorPage(anchor);
        const anchorCommentId = getAnchorCommentId(anchor, targetCommentId);
        const anchorParentCommentId = getAnchorParentCommentId(anchor);
        const response = await communityApi.getPostDetail(postId, {
          commentPage: initialCommentPage,
          commentSize: COMMENT_PAGE_SIZE,
        });
        let nextComments = response.data?.comments ?? [];

        if (
          anchorParentCommentId &&
          anchorCommentId &&
          anchorParentCommentId !== anchorCommentId
        ) {
          try {
            const repliesResponse = await communityApi.getReplies(
              anchorParentCommentId,
            );

            nextComments = nextComments.map(comment =>
              comment.commentId === anchorParentCommentId
                ? {
                    ...comment,
                    replies: repliesResponse.data ?? comment.replies ?? [],
                    hasMoreReplies: false,
                  }
                : comment,
            );
          } catch (error) {
            console.warn('fetchCommunityAnchorReplies 실패:', error);
          }
        }

        setPost(response.data);
        setComments(nextComments);
        setCommentPage(initialCommentPage);
        setCommentsLast(Boolean(response.data?.commentsLast));
        setHighlightedCommentId(anchorCommentId);
      } catch (error) {
        console.warn('fetchCommunityPostDetail 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [commentAnchor, postId, targetCommentId]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!highlightedCommentId) {
      return;
    }

    const scrollToHighlightedComment = () => {
      const targetY = commentLayoutMapRef.current[highlightedCommentId];

      if (typeof targetY === 'number') {
        scrollViewRef.current?.scrollTo({
          y: Math.max(commentListOffsetYRef.current + targetY - 24, 0),
          animated: true,
        });
      }
    };
    const scrollTimers = [120, 360, 700].map(delay =>
      setTimeout(scrollToHighlightedComment, delay),
    );

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedCommentId(null);
    }, COMMENT_HIGHLIGHT_DURATION);

    return () => {
      scrollTimers.forEach(clearTimeout);
    };
  }, [highlightedCommentId]);

  const postReplyTarget = useMemo(
    () => ({
      type: 'post',
      parentCommentId: null,
      nickname: post?.author?.nickname,
      content: post?.content,
    }),
    [post],
  );

  const showCommentLoginModal = () => {
    commentInputRef.current?.blur();
    showErrorModal({
      message: '댓글 작성은\n 로그인 후 사용해주세요',
      buttonText: '로그인하기',
      buttonText2: '취소',
      onPress: () => navigation.navigate('Login'),
      onPress2: () => {},
    });
  };

  const requireCommentLogin = () => {
    if (canWriteComment) {
      return true;
    }

    showCommentLoginModal();
    return false;
  };

  const handleFocusInput = () => {
    if (!requireCommentLogin()) {
      return;
    }

    if (editingTarget) {
      setIsCommentFocused(true);
      return;
    }

    if (!replyTarget) {
      setReplyTarget(postReplyTarget);
    }
    setIsCommentFocused(true);
  };

  const handlePressComment = item => {
    if (!requireCommentLogin()) {
      return;
    }

    setEditingTarget(null);
    setReplyTarget({
      type: 'comment',
      parentCommentId: item.commentId,
      nickname: item.author?.nickname,
      content: item.content,
    });
    setIsCommentFocused(true);
    commentInputRef.current?.focus();
  };

  const updateCommentInState = nextComment => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.commentId === nextComment.commentId) {
          return {...comment, ...nextComment};
        }

        if (!comment.replies?.length) {
          return comment;
        }

        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.commentId === nextComment.commentId
              ? {...reply, ...nextComment}
              : reply,
          ),
        };
      }),
    );
  };

  const clearEditingState = () => {
    setEditingTarget(null);
    setCommentValue('');
    setCommentImages([]);
    setIsCommentFocused(false);
    commentInputRef.current?.blur();
    Keyboard.dismiss();
  };

  const showCommentAlert = ({
    title,
    message,
    buttonText = '확인',
    buttonText2 = null,
    color = COLORS.primary_orange,
    onPress,
    onPress2,
  }) => {
    setCommentAlert({
      visible: true,
      title,
      message,
      buttonText,
      buttonText2,
      color,
      onPress: onPress ?? closeCommentAlert,
      onPress2: onPress2 ?? null,
    });
  };

  const closeCommentAlert = () => {
    setCommentAlert(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const handleStartEditComment = item => {
    setReplyTarget(null);
    setEditingTarget(item);
    setCommentValue(item.content ?? '');
    setCommentImages([]);
    setIsCommentFocused(true);
    commentInputRef.current?.focus();
  };

  const appendCommentToState = (nextComment, parentCommentId) => {
    if (parentCommentId) {
      setComments(prev =>
        prev.map(comment =>
          comment.commentId === parentCommentId
            ? {
                ...comment,
                replyCount: Number(comment.replyCount || 0) + 1,
                replies: [...(comment.replies ?? []), nextComment],
              }
            : comment,
        ),
      );
    } else {
      setComments(prev => [...prev, nextComment]);
    }

    setPost(prev =>
      prev
        ? {
            ...prev,
            commentCount: Number(prev.commentCount || 0) + 1,
          }
        : prev,
    );
  };

  const normalizeCommentImageToJpeg = async (asset, index) => {
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        asset.uri,
        1600,
        1600,
        'JPEG',
        90,
      );

      return {
        id: `${Date.now()}-${index}`,
        uri: resizedImage.uri,
        fileName: `comment-${Date.now()}-${index}.jpg`,
        fileSize: resizedImage.size || asset.fileSize || 1,
        type: JPEG_CONTENT_TYPE,
      };
    } catch (error) {
      console.warn('community comment image convert 실패:', error);

      return {
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        fileName: `comment-${Date.now()}-${index}.jpg`,
        fileSize: asset.fileSize || 1,
        type: JPEG_CONTENT_TYPE,
      };
    }
  };

  const handleAddCommentImages = async () => {
    if (editingTarget) {
      return;
    }

    const remainingCount = COMMENT_IMAGE_LIMITS.maxCount - commentImages.length;

    if (remainingCount <= 0) {
      showCommentAlert({
        title: '사진 첨부',
        message: `이미지는 최대 ${COMMENT_IMAGE_LIMITS.maxCount}장까지 추가할 수 있습니다.`,
      });
      return;
    }

    const result = await new Promise(resolve =>
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: remainingCount,
        },
        response => resolve(response),
      ),
    );

    if (result.didCancel || result.errorCode || !result.assets?.length) {
      return;
    }

    const selectedAssets = result.assets.filter(asset => asset.uri);
    const oversizedAsset = selectedAssets.find(
      asset =>
        Number(asset.fileSize || 0) >
        COMMENT_IMAGE_LIMITS.maxSingleFileSizeMb * MB,
    );

    if (oversizedAsset) {
      showCommentAlert({
        title: '사진 첨부',
        message: `이미지는 한 장당 최대 ${COMMENT_IMAGE_LIMITS.maxSingleFileSizeMb}MB까지 업로드할 수 있습니다.`,
      });
      return;
    }

    const currentTotalSize = commentImages.reduce(
      (total, image) => total + Number(image.fileSize || 0),
      0,
    );
    const selectedTotalSize = selectedAssets.reduce(
      (total, asset) => total + Number(asset.fileSize || 0),
      0,
    );

    if (
      currentTotalSize + selectedTotalSize >
      COMMENT_IMAGE_LIMITS.maxTotalFileSizeMb * MB
    ) {
      showCommentAlert({
        title: '사진 첨부',
        message: `이미지 전체 용량은 최대 ${COMMENT_IMAGE_LIMITS.maxTotalFileSizeMb}MB까지 업로드할 수 있습니다.`,
      });
      return;
    }

    const nextImages = await Promise.all(
      selectedAssets.map((asset, index) =>
        normalizeCommentImageToJpeg(asset, index),
      ),
    );

    const convertedOversizedImage = nextImages.find(
      image =>
        Number(image.fileSize || 0) >
        COMMENT_IMAGE_LIMITS.maxSingleFileSizeMb * MB,
    );

    if (convertedOversizedImage) {
      showCommentAlert({
        title: '사진 첨부',
        message: `이미지는 한 장당 최대 ${COMMENT_IMAGE_LIMITS.maxSingleFileSizeMb}MB까지 업로드할 수 있습니다.`,
      });
      return;
    }

    setCommentImages(prev => [...prev, ...nextImages]);
  };

  const handleRemoveCommentImage = imageId => {
    setCommentImages(prev => prev.filter(image => image.id !== imageId));
  };

  const uploadImageToS3 = async ({presignedUrl, uri, contentType}) => {
    const fileResponse = await fetch(uri);
    const blob = await fileResponse.blob();

    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {'Content-Type': contentType},
      body: blob,
    });
  };

  const getCommentImageFilename = (image, index) => {
    if (image.fileName?.toLowerCase().endsWith('.jpg')) {
      return image.fileName;
    }

    return `comment-${Date.now()}-${index}.jpg`;
  };

  const uploadCommentImages = async commentId => {
    if (commentImages.length === 0) {
      return [];
    }

    const presignTargets = commentImages.map((image, index) => ({
      filename: getCommentImageFilename(image, index),
      contentType: JPEG_CONTENT_TYPE,
      imageOrder: index,
      fileSizeBytes: Number(image.fileSize || 1),
    }));
    const presignedResponse = await communityApi.getCommentImagePresignedUrls(
      commentId,
      presignTargets,
    );
    const presignedImages = presignedResponse.data ?? [];

    await Promise.all(
      presignedImages.map(presignedImage => {
        const sourceImage = commentImages[presignedImage.imageOrder];

        if (!sourceImage) {
          throw new Error('COMMENT_IMAGE_SOURCE_MISSING');
        }

        return uploadImageToS3({
          presignedUrl: presignedImage.presignedUrl,
          uri: sourceImage.uri,
          contentType: JPEG_CONTENT_TYPE,
        });
      }),
    );

    return presignedImages.map(image => ({
      objectKey: image.objectKey,
      imageOrder: image.imageOrder,
      fileSizeBytes: image.fileSizeBytes,
    }));
  };

  const handleSubmitComment = async () => {
    const trimmedContent = commentValue.trim();

    if (!trimmedContent || isSubmittingComment || !postId) {
      return;
    }

    const role = useUserStore.getState().userRole;

    if (role !== 'USER' && role !== 'ADMIN') {
      showErrorModal({
        message: '댓글 작성은\n 로그인 후 사용해주세요',
        buttonText: '로그인하기',
        buttonText2: '취소',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    try {
      setIsSubmittingComment(true);

      if (editingTarget) {
        const response = await communityApi.updateComment(
          editingTarget.commentId,
          {content: trimmedContent},
        );

        updateCommentInState(response.data);
        clearEditingState();
        return;
      }

      const parentCommentId = replyTarget?.parentCommentId ?? null;

      if (hasCommentImages) {
        const draftResponse = await communityApi.createCommentDraft(postId, {
          parentCommentId,
          content: trimmedContent,
        });
        const commentId = draftResponse.data?.commentId;

        if (!commentId) {
          throw new Error('commentId가 없습니다.');
        }

        const uploadedImages = await uploadCommentImages(commentId);
        const publishResponse = await communityApi.publishComment(commentId, {
          images: uploadedImages,
        });

        appendCommentToState(publishResponse.data, parentCommentId);
      } else {
        const response = await communityApi.createComment(postId, {
          parentCommentId,
          content: trimmedContent,
        });

        appendCommentToState(response.data, parentCommentId);
      }

      setCommentValue('');
      setCommentImages([]);
      setReplyTarget(postReplyTarget);
      Keyboard.dismiss();
    } catch (error) {
      console.warn('createCommunityComment 실패:', error);
      showCommentAlert({
        title: '댓글 등록 실패',
        message: '댓글 등록에 실패했어요. 잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleLike = async () => {
    if (!postId || !post || isTogglingLike) {
      return;
    }

    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
      showErrorModal({
        message: '좋아요 기능은\n 로그인 후 사용해주세요',
        buttonText: '로그인하기',
        buttonText2: '취소',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    const wasLiked = Boolean(post.isLiked);
    const previousLikeCount = Number(post.likeCount || 0);
    const nextLikeCount = Math.max(
      0,
      previousLikeCount + (wasLiked ? -1 : 1),
    );

    setPost(prev =>
      prev
        ? {
            ...prev,
            isLiked: !wasLiked,
            likeCount: nextLikeCount,
          }
        : prev,
    );

    try {
      setIsTogglingLike(true);
      if (wasLiked) {
        await communityApi.unlikePost(postId);
      } else {
        await communityApi.likePost(postId);
      }
    } catch (error) {
      setPost(prev =>
        prev
          ? {
              ...prev,
              isLiked: wasLiked,
              likeCount: previousLikeCount,
            }
          : prev,
      );

      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        showErrorModal({
          message: '좋아요 기능은\n 로그인 후 사용해주세요',
          buttonText: '로그인하기',
          buttonText2: '취소',
          onPress: () => navigation.navigate('Login'),
          onPress2: () => {},
        });
        return;
      }

      console.warn(
        'toggleCommunityPostLike 실패:',
        error?.response?.data || error?.message,
      );
    } finally {
      setIsTogglingLike(false);
    }
  };

  const updateCommentLikeState = (commentId, nextIsLiked, nextLikeCount) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.commentId === commentId) {
          return {
            ...comment,
            isLiked: nextIsLiked,
            likeCount: nextLikeCount,
          };
        }

        if (!comment.replies?.length) {
          return comment;
        }

        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.commentId === commentId
              ? {
                  ...reply,
                  isLiked: nextIsLiked,
                  likeCount: nextLikeCount,
                }
              : reply,
          ),
        };
      }),
    );
  };

  const removeCommentFromState = item => {
    const isReply = Boolean(item.parentCommentId);
    const removedCount = isReply ? 1 : Number(item.replyCount || 0) + 1;

    setComments(prev => {
      if (!isReply) {
        return prev.filter(comment => comment.commentId !== item.commentId);
      }

      return prev.map(comment =>
        comment.commentId === item.parentCommentId
          ? {
              ...comment,
              replyCount: Math.max(0, Number(comment.replyCount || 0) - 1),
              replies: (comment.replies ?? []).filter(
                reply => reply.commentId !== item.commentId,
              ),
            }
          : comment,
      );
    });
    setPost(prev =>
      prev
        ? {
            ...prev,
            commentCount: Math.max(
              0,
              Number(prev.commentCount || 0) - removedCount,
            ),
          }
        : prev,
    );
  };

  const handleDeleteComment = item => {
    if (deletingCommentId) {
      return;
    }

    setCommentAlert({
      visible: true,
      title: '댓글 삭제',
      message: '댓글을 삭제할까요?',
      buttonText: '삭제',
      buttonText2: '취소',
      color: COLORS.semantic_red,
      onPress2: closeCommentAlert,
      onPress: async () => {
        closeCommentAlert();
        try {
          setDeletingCommentId(item.commentId);
          await communityApi.deleteComment(item.commentId);
          removeCommentFromState(item);
        } catch (error) {
          console.warn(
            'deleteCommunityComment 실패:',
            error?.response?.data || error?.message,
          );
          setCommentAlert({
            visible: true,
            title: '댓글 삭제 실패',
            message: '댓글 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.',
            buttonText: '확인',
            buttonText2: null,
            color: COLORS.primary_orange,
            onPress: closeCommentAlert,
            onPress2: null,
          });
        } finally {
          setDeletingCommentId(null);
        }
      },
    });
  };

  const handleToggleCommentLike = async item => {
    const wasLiked = Boolean(item.isLiked);
    const previousLikeCount = Number(item.likeCount || 0);
    const nextLikeCount = Math.max(
      0,
      previousLikeCount + (wasLiked ? -1 : 1),
    );

    updateCommentLikeState(item.commentId, !wasLiked, nextLikeCount);

    const success = await toggleFavorite({
      type: 'communityComment',
      id: item.commentId,
      isLiked: wasLiked,
    });

    if (!success) {
      updateCommentLikeState(item.commentId, wasLiked, previousLikeCount);
    }
  };

  const handleLoadMoreComments = async () => {
    if (isMoreCommentsLoading || commentsLast || !postId) {
      return;
    }

    try {
      setIsMoreCommentsLoading(true);
      const nextPage = commentPage + 1;
      const response = await communityApi.getComments(postId, {
        page: nextPage,
        size: COMMENT_PAGE_SIZE,
      });

      setComments(prev => [...prev, ...(response.data?.content ?? [])]);
      setCommentPage(nextPage);
      setCommentsLast(Boolean(response.data?.last));
    } catch (error) {
      console.warn('fetchCommunityComments 실패:', error);
    } finally {
      setIsMoreCommentsLoading(false);
    }
  };

  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);

    if (distanceFromBottom < 160) {
      handleLoadMoreComments();
    }
  };

  const handleLoadReplies = async commentId => {
    try {
      const response = await communityApi.getReplies(commentId);

      setComments(prev =>
        prev.map(comment =>
          comment.commentId === commentId
            ? {
                ...comment,
                replies: response.data ?? [],
                hasMoreReplies: false,
              }
            : comment,
        ),
      );
    } catch (error) {
      console.warn('fetchCommunityReplies 실패:', error);
    }
  };

  const renderPostImages = images => {
    if (!images?.length) {
      return null;
    }
    const sortedImages = [...images].sort(
      (a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0),
    );
    const imageModalItems = sortedImages.map((image, index) => ({
      id: image.imageId ?? image.objectKey ?? index,
      imageUrl: image.imageUrl,
    }));
    const openPostImageModal = index => {
      setModalImages(imageModalItems);
      setSelectedImageIndex(index);
      setImageModalVisible(true);
    };

    if (sortedImages.length === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.singlePostImage}
          onPress={() => openPostImageModal(0)}>
          <Image
            source={{uri: sortedImages[0].imageUrl}}
            style={styles.postImageFill}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.multiImageContainer}>
        {sortedImages.map((image, index) => (
          <TouchableOpacity
            key={image.imageId ?? index}
            activeOpacity={0.9}
            style={styles.multiPostImage}
            onPress={() => openPostImageModal(index)}>
            <Image
              source={{uri: image.imageUrl}}
              style={styles.postImageFill}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCommentImages = images => {
    if (!images?.length) {
      return null;
    }

    const sortedImages = [...images].sort(
      (a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0),
    );
    const imageModalItems = sortedImages.map((image, index) => ({
      id: image.imageId ?? image.objectKey ?? index,
      imageUrl: image.imageUrl,
    }));
    const openCommentImageModal = index => {
      setModalImages(imageModalItems);
      setSelectedImageIndex(index);
      setImageModalVisible(true);
    };

    if (sortedImages.length === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.singleCommentImageButton}
          onPress={() => openCommentImageModal(0)}>
          <Image
            source={{uri: sortedImages[0].imageUrl}}
            style={styles.singleCommentImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.commentImageList}>
        {sortedImages.map((image, index) => (
          <TouchableOpacity
            key={image.imageId ?? image.objectKey ?? index}
            activeOpacity={0.9}
            style={styles.commentImageButton}
            onPress={() => openCommentImageModal(index)}>
            <Image
              source={{uri: image.imageUrl}}
              style={styles.commentImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderActionRow = (
    item,
    {
      showLike = true,
      showComment = true,
      compact = false,
      likeable = false,
    } = {},
  ) => {
    if (!showLike && !showComment) {
      return null;
    }

    return (
      <View style={[styles.actionRow, compact && styles.commentActionRow]}>
        {showLike ? (
          <TouchableOpacity
            activeOpacity={likeable ? 0.8 : 1}
            disabled={!likeable}
            style={styles.actionItem}
            onPress={() =>
              item.commentId
                ? handleToggleCommentLike(item)
                : handleToggleLike()
            }>
            {likeable && item.isLiked ? (
              <FilledHeartIcon width={22} height={22} />
            ) : (
              <HeartIcon width={22} height={22} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.actionText]}>
              {item.likeCount ?? 0}
            </Text>
          </TouchableOpacity>
        ) : null}
        {showComment ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionItem}
            onPress={() => handlePressComment(item)}>
            <CommentIcon width={22} height={22} />
            <Text style={[FONTS.fs_14_regular, styles.actionText]}>
              {item.commentCount ?? item.replyCount ?? 0}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderCommentManageActions = item => {
    const isAdmin = currentUserRole === 'ADMIN';
    const canEdit = Boolean(item.isMine) || isAdmin;
    const canDelete = Boolean(item.isMine) || Boolean(post?.isMine) || isAdmin;

    if (!canEdit && !canDelete) {
      return null;
    }

    return (
      <View style={styles.commentManageRow}>
        {canEdit ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.commentManageButton}
            onPress={() => handleStartEditComment(item)}>
            <Text style={[FONTS.fs_13_medium, styles.commentManageText]}>
              수정
            </Text>
          </TouchableOpacity>
        ) : null}
        {canEdit && canDelete ? (
          <Text style={styles.commentManageDot}>·</Text>
        ) : null}
        {canDelete ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.commentManageButton}
            disabled={deletingCommentId === item.commentId}
            onPress={() => handleDeleteComment(item)}>
            <Text
              style={[
                FONTS.fs_13_medium,
                styles.commentManageText,
                styles.commentDeleteText,
              ]}>
              {deletingCommentId === item.commentId ? '삭제중' : '삭제'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderComment = comment => (
    <View
      key={comment.commentId}
      style={styles.commentBlock}
      onLayout={event => {
        commentLayoutMapRef.current[comment.commentId] =
          event.nativeEvent.layout.y;
      }}>
      {comment.replies?.length ? (
        <View style={styles.commentThreadConnector} />
      ) : null}

      <View
        style={[
          styles.commentSurface,
          highlightedCommentId === comment.commentId &&
            styles.highlightedCommentSurface,
        ]}>
        <View style={styles.commentContentRow}>
          <Avatar
            uri={comment.author?.profileImageUrl}
            size={40}
            iconSize={18}
            style={styles.commentAvatar}
          />

          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={[FONTS.fs_14_semibold, styles.commentNickname]}>
                {comment.author?.nickname}
              </Text>
              <Text style={[FONTS.fs_14_regular, styles.commentTime]}>
                {formatRelativeTime(comment.createdAt)}
              </Text>
              {isCommentEdited(comment) ? (
                <Text style={[FONTS.fs_12_regular, styles.editedText]}>
                  수정됨
                </Text>
              ) : null}
            </View>
            <Text style={[FONTS.fs_16_regular, styles.commentText]}>
              {comment.content}
            </Text>
            {renderCommentImages(comment.images)}
            <View
              style={[
                styles.commentMetaActions,
                comment.images?.length && styles.commentMetaActionsWithImages,
              ]}>
              {renderActionRow(comment, {compact: true, likeable: true})}
              {renderCommentManageActions(comment)}
            </View>
          </View>
        </View>
      </View>

      {comment.replies?.length ? (
        <View
          style={styles.replySection}
          onLayout={event => {
            replySectionLayoutMapRef.current[comment.commentId] =
              (commentLayoutMapRef.current[comment.commentId] ?? 0) +
              event.nativeEvent.layout.y;
          }}>
          <View style={styles.replyList}>
            {comment.replies.map(reply => (
              <View
                key={reply.commentId}
                style={[
                  styles.replyRow,
                  highlightedCommentId === reply.commentId &&
                    styles.highlightedReplyRow,
                ]}
                onLayout={event => {
                  commentLayoutMapRef.current[reply.commentId] =
                    (replySectionLayoutMapRef.current[comment.commentId] ??
                      commentLayoutMapRef.current[comment.commentId] ??
                      0) + event.nativeEvent.layout.y;
                }}>
                <Avatar
                  uri={reply.author?.profileImageUrl}
                  size={40}
                  iconSize={18}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text style={[FONTS.fs_14_semibold, styles.commentNickname]}>
                      {reply.author?.nickname}
                    </Text>
                    <Text style={[FONTS.fs_14_regular, styles.commentTime]}>
                      {formatRelativeTime(reply.createdAt)}
                    </Text>
                    {isCommentEdited(reply) ? (
                      <Text style={[FONTS.fs_12_regular, styles.editedText]}>
                        수정됨
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[FONTS.fs_16_regular, styles.commentText]}>
                    {reply.content}
                  </Text>
                  {renderCommentImages(reply.images)}
                  <View
                    style={[
                      styles.commentMetaActions,
                      reply.images?.length && styles.commentMetaActionsWithImages,
                    ]}>
                    {renderActionRow(reply, {
                      showComment: false,
                      compact: true,
                      likeable: true,
                    })}
                    {renderCommentManageActions(reply)}
                  </View>
                </View>
              </View>
            ))}
            {comment.hasMoreReplies ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.replyMoreButton}
                onPress={() => handleLoadReplies(comment.commentId)}>
                <Text style={[FONTS.fs_14_medium, styles.replyMoreText]}>
                  대댓글 더보기
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={undefined}>
      <Header
        title={post?.categoryDisplayName || ''}
        onPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <Loading title="게시글을 불러오는 중입니다..." />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}>
          <View style={styles.postHeader}>
            <Avatar
              uri={post?.author?.profileImageUrl}
              size={32}
              iconSize={16}
              style={styles.postAvatar}
            />
            <Text style={[FONTS.fs_16_medium, styles.postNickname]}>
              {post?.author?.nickname}
            </Text>
            <Text style={[FONTS.fs_14_regular, styles.postTime]}>
              {formatRelativeTime(post?.createdAt)}
            </Text>
          </View>

          <Text style={[FONTS.fs_16_medium, styles.postTitle]}>
            {post?.title}
          </Text>
          <Text style={[FONTS.fs_16_regular, styles.postContent]}>
            {post?.content}
          </Text>

          {renderPostImages(post.images)}
          {renderActionRow(post, {likeable: true})}

          {shouldShowAd ? (
            <View style={styles.adBannerContainer}>
              <BannerAd
                unitId={communityDetailBannerAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              />
            </View>
          ) : null}

          <View
            style={styles.commentList}
            onLayout={event => {
              commentListOffsetYRef.current = event.nativeEvent.layout.y;
            }}>
            {comments.map(renderComment)}
          </View>
          {isMoreCommentsLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.grayscale_500}
              style={styles.commentFooterLoading}
            />
          ) : null}
        </ScrollView>
        </TouchableWithoutFeedback>
      )}

      <View
        style={[
          styles.commentBottomBar,
          keyboardHeight > 0 && {bottom: keyboardHeight},
        ]}>
        {editingTarget ? (
          <View style={styles.replyTargetBox}>
            <View style={styles.replyTargetHeader}>
              <Text
                style={[FONTS.fs_14_regular, styles.replyTargetTitle]}
                numberOfLines={1}>
                댓글 수정 중
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={clearEditingState}>
                <Text style={[FONTS.fs_14_medium, styles.replyTargetCancel]}>
                  취소
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[FONTS.fs_14_regular, styles.replyTargetContent]}
              numberOfLines={1}>
              {editingTarget.content}
            </Text>
          </View>
        ) : isCommentFocused && replyTarget ? (
          <View style={styles.replyTargetBox}>
            <View style={styles.replyTargetHeader}>
              <Text
                style={[FONTS.fs_14_regular, styles.replyTargetTitle]}
                numberOfLines={1}>
                {replyTarget.nickname}_님에게 답글 남기는 중
              </Text>
            </View>
            <Text
              style={[FONTS.fs_14_regular, styles.replyTargetContent]}
              numberOfLines={1}>
              {replyTarget.content}
            </Text>
          </View>
        ) : null}

        {!editingTarget && hasCommentImages ? (
          <View style={styles.commentImagePreviewSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.commentImagePreviewList}>
              {commentImages.map(image => (
                <View key={image.id} style={styles.commentImagePreviewItem}>
                  <Image
                    source={{uri: image.uri}}
                    style={styles.commentImagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.commentImageRemoveButton}
                    onPress={() => handleRemoveCommentImage(image.id)}>
                    <XIcon width={14} height={14} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View
          style={[
            styles.commentInputBar,
            keyboardHeight > 0 && styles.commentInputBarFocused,
          ]}>
          {!isCommentFocused ? (
            <Avatar uri={currentUserPhotoUrl} size={32} iconSize={14} />
          ) : null}
          <TextInput
            ref={commentInputRef}
            style={[FONTS.fs_14_regular, styles.commentInput]}
            placeholder={
              editingTarget ? '댓글을 수정해주세요.' : '댓글을 입력해주세요.'
            }
            placeholderTextColor={COLORS.grayscale_400}
            value={commentValue}
            maxLength={COMMENT_MAX_LENGTH}
            editable={canWriteComment}
            onChangeText={setCommentValue}
            onPressIn={() => {
              if (!canWriteComment) {
                showCommentLoginModal();
              }
            }}
            onFocus={handleFocusInput}
            onBlur={() => setIsCommentFocused(false)}
          />
          {!editingTarget ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.photoButton}
              onPress={handleAddCommentImages}>
              <PhotoIcon width={18} height={18} />
            </TouchableOpacity>
          ) : null}
          {hasCommentValue ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.sendButton}
              onPress={handleSubmitComment}>
              <Text style={[FONTS.fs_20_semibold, styles.sendButtonText]}>
                ↑
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <AlertModal
        visible={commentAlert.visible}
        title={commentAlert.title}
        message={commentAlert.message}
        buttonText={commentAlert.buttonText}
        buttonText2={commentAlert.buttonText2}
        color={commentAlert.color}
        onPress={commentAlert.onPress}
        onPress2={commentAlert.onPress2}
        onRequestClose={closeCommentAlert}
      />

      <CommunityImageModal
        visible={imageModalVisible}
        images={modalImages}
        selectedImageIndex={selectedImageIndex}
        onClose={() => setImageModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default CommunityDetail;
