import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  InteractionManager,
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

import Avatar from '@components/Avatar';
import Header from '@components/Header';
import Loading from '@components/Loading';
import AlertModal from '@components/modals/AlertModal';
import AppImage from '@components/AppImage';
import RecruitTapSection from '@screens/(Common)/Employ/EmployDetail/RecruitTapSection';
import userEmployApi from '@utils/api/userEmployApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {openWebLink} from '@utils/openWebLink';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import HeartIcon from '@assets/images/heart_black.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import CommentIcon from '@assets/images/chat_black.svg';
import styles from './CommunityStaffDetail.styles';

const COMMENT_MAX_LENGTH = 300;
const COMMENT_PAGE_SIZE = 20;
const COMMENT_INPUT_MIN_HEIGHT = 44;
const COMMENT_INPUT_MAX_HEIGHT = 88;
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const URL_TEXT_REGEX = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i;
const TRAILING_URL_PUNCTUATION_REGEX = /[.,!?;:)\]}]+$/;

const formatMonthDay = value => {
  if (!value) {
    return '';
  }

  const [datePart] = value.split('T');
  const [, month, day] = datePart.split('-');
  return `${month}/${day}`;
};

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

const getAuthorName = author => author?.name || author?.nickname || '';

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

const getCommentPageContent = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.content ?? [];
};

const getNormalizedUrl = url => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
};

const renderTextWithLinks = text => {
  if (!text) {
    return null;
  }

  return text.split(URL_SPLIT_REGEX).map((part, index) => {
    if (!URL_TEXT_REGEX.test(part)) {
      return part;
    }

    const trailingPunctuation = part.match(TRAILING_URL_PUNCTUATION_REGEX)?.[0];
    const linkText = trailingPunctuation
      ? part.slice(0, -trailingPunctuation.length)
      : part;

    return (
      <React.Fragment key={`${linkText}-${index}`}>
        <Text
          style={styles.detailLinkText}
          suppressHighlighting
          onPress={() => openWebLink(getNormalizedUrl(linkText))}>
          {linkText}
        </Text>
        {trailingPunctuation ?? ''}
      </React.Fragment>
    );
  });
};

const CommunityStaffDetail = ({route}) => {
  const navigation = useNavigation();
  const userRole = useUserStore(state => state.userRole);
  const currentUserPhotoUrl = useUserStore(
    state => state.userProfile?.photoUrl,
  );
  const {id} = route.params ?? {};
  const scrollViewRef = useRef(null);
  const commentInputRef = useRef(null);
  const commentLoadInteractionRef = useRef(null);
  const hasUserScrolledCommentsRef = useRef(false);
  const [recruit, setRecruit] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const [commentsLast, setCommentsLast] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreCommentsLoading, setIsMoreCommentsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingTarget, setEditingTarget] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [commentInputHeight, setCommentInputHeight] = useState(
    COMMENT_INPUT_MIN_HEIGHT,
  );
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
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

  const hasCommentValue = commentValue.trim().length > 0;
  const canUseRecruitComment = userRole === 'USER';
  const shouldShowApplyButton = keyboardHeight <= 0 && !isCommentFocused;
  const postReplyTarget = useMemo(
    () => ({
      type: 'post',
      parentCommentId: null,
      nickname: recruit?.guesthouseName,
      content: recruit?.recruitTitle,
    }),
    [recruit],
  );

  const closeCommentAlert = () => {
    setCommentAlert(prev => ({
      ...prev,
      visible: false,
    }));
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

  const showCommentLoginModal = () => {
    commentInputRef.current?.blur();
    showErrorModal({
      message: '댓글 작성은\n로그인 후 사용해주세요',
      buttonText: '로그인하기',
      buttonText2: '취소',
      onPress: () => navigation.navigate('Login'),
      onPress2: () => {},
    });
  };

  const requireCommentLogin = () => {
    if (canUseRecruitComment) {
      return true;
    }

    showCommentLoginModal();
    return false;
  };

  const fetchRecruitComments = useCallback(
    async page => {
      const response = await userEmployApi.getRecruitComments(id, {
        page,
        size: COMMENT_PAGE_SIZE,
      });

      return response.data;
    },
    [id],
  );

  const loadInitialComments = useCallback(async () => {
    try {
      const commentPageResponse = await fetchRecruitComments(0);

      setComments(getCommentPageContent(commentPageResponse));
      setCommentPage(0);
      setCommentsLast(Boolean(commentPageResponse?.last ?? true));
    } catch (error) {
      console.warn('fetchRecruitComments 실패:', error);
    }
  }, [fetchRecruitComments]);

  const fetchRecruitDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      hasUserScrolledCommentsRef.current = false;
      commentLoadInteractionRef.current?.cancel?.();

      const recruitResponse = await userEmployApi.getRecruitById(id, true);

      setRecruit(recruitResponse.data);
      setComments([]);
      setCommentPage(0);
      setCommentsLast(true);

      commentLoadInteractionRef.current =
        InteractionManager.runAfterInteractions(loadInitialComments);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '스탭 공고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        buttonText: '확인',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, loadInitialComments]);

  useEffect(() => {
    fetchRecruitDetail();

    return () => {
      commentLoadInteractionRef.current?.cancel?.();
    };
  }, [fetchRecruitDetail]);

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
    };
  }, []);

  const renderTags = hashtags => {
    if (!hashtags?.length) {
      return null;
    }

    return (
      <View style={styles.tagRow}>
        {hashtags.slice(0, 3).map((tag, index) => {
          const tagLabel = tag?.hashtag ?? tag;

          return (
            <View key={`${tagLabel}-${index}`} style={styles.tag}>
              <Text style={[FONTS.fs_12_medium, styles.tagText]}>
                {tagLabel}
              </Text>
            </View>
          );
        })}
      </View>
    );
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
      return;
    }

    setComments(prev => [...prev, nextComment]);
  };

  const clearEditingState = () => {
    setEditingTarget(null);
    setCommentValue('');
    setCommentInputHeight(COMMENT_INPUT_MIN_HEIGHT);
    setIsCommentFocused(false);
    commentInputRef.current?.blur();
    Keyboard.dismiss();
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

  const handleDismissCommentInput = () => {
    if (!isCommentFocused && keyboardHeight <= 0) {
      return false;
    }

    setIsCommentFocused(false);
    commentInputRef.current?.blur();
    Keyboard.dismiss();
    return false;
  };

  const handleChangeCommentText = text => {
    if (!canUseRecruitComment) {
      return;
    }

    setCommentValue(text);
  };

  const handleCommentInputContentSizeChange = event => {
    if (Platform.OS === 'web') {
      return;
    }

    const nextHeight = Math.min(
      Math.max(event.nativeEvent.contentSize.height, COMMENT_INPUT_MIN_HEIGHT),
      COMMENT_INPUT_MAX_HEIGHT,
    );

    setCommentInputHeight(nextHeight);
  };

  const handlePressComment = item => {
    if (!requireCommentLogin()) {
      return;
    }

    setEditingTarget(null);
    setReplyTarget({
      type: 'comment',
      parentCommentId: item.commentId,
      nickname: getAuthorName(item.author),
      content: item.content,
    });
    setIsCommentFocused(true);
    commentInputRef.current?.focus();
  };

  const handleStartEditComment = item => {
    setReplyTarget(null);
    setEditingTarget(item);
    setCommentValue(item.content ?? '');
    setIsCommentFocused(true);
    commentInputRef.current?.focus();
  };

  const handleSubmitComment = async () => {
    const trimmedContent = commentValue.trim();

    if (!trimmedContent || isSubmittingComment || !id) {
      return;
    }

    if (!canUseRecruitComment) {
      showCommentLoginModal();
      return;
    }

    const parentCommentId = replyTarget?.parentCommentId ?? null;

    try {
      setIsSubmittingComment(true);

      if (editingTarget) {
        const response = await userEmployApi.updateRecruitComment(
          editingTarget.commentId,
          {content: trimmedContent},
        );

        updateCommentInState(response.data);
        clearEditingState();
        return;
      }

      const response = await userEmployApi.createRecruitComment(id, {
        parentCommentId,
        content: trimmedContent,
      });

      appendCommentToState(response.data, parentCommentId);
      setCommentValue('');
      setCommentInputHeight(COMMENT_INPUT_MIN_HEIGHT);
      setReplyTarget(postReplyTarget);
      Keyboard.dismiss();
    } catch (error) {
      console.warn(
        'createRecruitComment 실패:',
        error?.response?.data || error?.message,
      );
      showCommentAlert({
        title: editingTarget ? '댓글 수정 실패' : '댓글 등록 실패',
        message: editingTarget
          ? '댓글 수정에 실패했어요. 잠시 후 다시 시도해 주세요.'
          : '댓글 등록에 실패했어요. 잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setIsSubmittingComment(false);
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

  const handleToggleCommentLike = async item => {
    if (!canUseRecruitComment) {
      showErrorModal({
        message: '좋아요 기능은\n로그인 후 사용해주세요',
        buttonText: '로그인하기',
        buttonText2: '취소',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    const wasLiked = Boolean(item.isLiked);
    const previousLikeCount = Number(item.likeCount || 0);
    const nextLikeCount = Math.max(0, previousLikeCount + (wasLiked ? -1 : 1));

    updateCommentLikeState(item.commentId, !wasLiked, nextLikeCount);

    try {
      const response = await userEmployApi.toggleRecruitCommentLike(
        item.commentId,
      );
      const serverLiked = response.data;

      if (typeof serverLiked === 'boolean' && serverLiked !== !wasLiked) {
        updateCommentLikeState(
          item.commentId,
          serverLiked,
          Math.max(0, previousLikeCount + (serverLiked ? 1 : -1)),
        );
      }
    } catch (error) {
      updateCommentLikeState(item.commentId, wasLiked, previousLikeCount);
      console.warn(
        'toggleRecruitCommentLike 실패:',
        error?.response?.data || error?.message,
      );
    }
  };

  const removeCommentFromState = item => {
    const isReply = Boolean(item.parentCommentId);

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
          await userEmployApi.deleteRecruitComment(item.commentId);
          removeCommentFromState(item);
        } catch (error) {
          console.warn(
            'deleteRecruitComment 실패:',
            error?.response?.data || error?.message,
          );
          showCommentAlert({
            title: '댓글 삭제 실패',
            message: '댓글 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.',
          });
        } finally {
          setDeletingCommentId(null);
        }
      },
    });
  };

  const handleLoadMoreComments = async () => {
    if (
      isMoreCommentsLoading ||
      commentsLast ||
      !id ||
      !hasUserScrolledCommentsRef.current
    ) {
      return;
    }

    try {
      setIsMoreCommentsLoading(true);
      const nextPage = commentPage + 1;
      const response = await fetchRecruitComments(nextPage);

      setComments(prev => [...prev, ...getCommentPageContent(response)]);
      setCommentPage(nextPage);
      setCommentsLast(Boolean(response?.last));
    } catch (error) {
      console.warn('fetchRecruitComments 실패:', error);
    } finally {
      setIsMoreCommentsLoading(false);
    }
  };

  const handleScrollBeginDrag = () => {
    hasUserScrolledCommentsRef.current = true;
    Keyboard.dismiss();
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
      const response = await userEmployApi.getRecruitCommentReplies(commentId);

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
      console.warn('fetchRecruitCommentReplies 실패:', error);
    }
  };

  const handleApply = () => {
    if (userRole !== 'USER') {
      showErrorModal({
        message: '지원하기는\n알바 로그인 후 사용해주세요',
        buttonText: '로그인하기',
        buttonText2: '취소',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    navigation.navigate('ApplicantInfo', {
      recruitId: recruit?.recruitId,
      recruitTitle: recruit?.recruitTitle,
      guesthouseName: recruit?.guesthouseName,
      recruitEnd: recruit?.recruitEnd,
      entryStartDate: recruit?.entryStartDate,
      entryEndDate: recruit?.entryEndDate,
    });
  };

  const renderActionRow = (item, {showComment = true} = {}) => (
    <View style={styles.commentActionRow}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.actionItem}
        onPress={() => handleToggleCommentLike(item)}>
        {item.isLiked ? (
          <FilledHeartIcon width={22} height={22} />
        ) : (
          <HeartIcon width={22} height={22} />
        )}
        <Text style={[FONTS.fs_14_regular, styles.actionText]}>
          {item.likeCount ?? 0}
        </Text>
      </TouchableOpacity>
      {showComment ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionItem}
          onPress={() => handlePressComment(item)}>
          <CommentIcon width={22} height={22} />
          <Text style={[FONTS.fs_14_regular, styles.actionText]}>
            {item.replyCount ?? 0}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderCommentManageActions = item => {
    if (!item.isMine) {
      return null;
    }

    return (
      <View style={styles.commentManageRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.commentManageButton}
          onPress={() => handleStartEditComment(item)}>
          <Text style={[FONTS.fs_13_medium, styles.commentManageText]}>
            수정
          </Text>
        </TouchableOpacity>
        <Text style={styles.commentManageDot}>·</Text>
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
      </View>
    );
  };

  const renderComment = comment => (
    <View key={comment.commentId} style={styles.commentBlock}>
      {comment.replies?.length ? (
        <View style={styles.commentThreadConnector} />
      ) : null}

      <View style={styles.commentSurface}>
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
                {getAuthorName(comment.author)}
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
            <View style={styles.commentMetaActions}>
              {renderActionRow(comment)}
              {renderCommentManageActions(comment)}
            </View>
          </View>
        </View>
      </View>

      {comment.replies?.length ? (
        <View style={styles.replySection}>
          <View style={styles.replyList}>
            {comment.replies.map(reply => (
              <View key={reply.commentId} style={styles.replyRow}>
                <Avatar
                  uri={reply.author?.profileImageUrl}
                  size={40}
                  iconSize={18}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text
                      style={[FONTS.fs_14_semibold, styles.commentNickname]}>
                      {getAuthorName(reply.author)}
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
                  <View style={styles.commentMetaActions}>
                    {renderActionRow(reply, {showComment: false})}
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

  const imageUrl =
    recruit?.profileSummary?.profileImageUrl ||
    recruit?.recruitImages?.find(image => image.isThumbnail)?.recruitImageUrl ||
    recruit?.recruitImages?.[0]?.recruitImageUrl;
  const deadline = formatMonthDay(recruit?.recruitEnd);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={undefined}>
      <Header title="스탭" onPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading title="스탭 공고를 불러오는 중입니다..." />
        </View>
      ) : (
        <TouchableWithoutFeedback
          onPress={handleDismissCommentInput}
          accessible={false}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onStartShouldSetResponderCapture={handleDismissCommentInput}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.content}>
            <View style={styles.postHeader}>
              {imageUrl ? (
                <AppImage uri={imageUrl} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <Text
                style={[FONTS.fs_14_medium, styles.guesthouseName]}
                numberOfLines={1}>
                {recruit?.guesthouseName}
              </Text>
              {!!deadline && (
                <Text style={[FONTS.fs_14_regular, styles.deadline]}>
                  ~{deadline}
                </Text>
              )}
            </View>

            <Text style={[FONTS.fs_14_medium, styles.recruitTitle]}>
              {recruit?.recruitTitle}
            </Text>

            {!!recruit?.recruitShortDescription && (
              <Text style={[FONTS.fs_14_regular, styles.shortDescription]}>
                {recruit.recruitShortDescription}
              </Text>
            )}

            {renderTags(recruit?.hashtags)}

            <View style={styles.tabSection}>
              <RecruitTapSection recruit={recruit} />
            </View>

            {!!recruit?.recruitDetail && (
              <View style={styles.detailSection}>
                <Text style={[FONTS.fs_16_semibold, styles.detailTitle]}>
                  상세 정보
                </Text>
                <Text style={[FONTS.fs_14_regular, styles.detailText]}>
                  {renderTextWithLinks(recruit.recruitDetail)}
                </Text>
              </View>
            )}

            <View style={styles.commentList}>
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

      {!isLoading && (
        <View
          style={[
            styles.bottomContainer,
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
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setReplyTarget(null)}>
                  <Text style={[FONTS.fs_14_medium, styles.replyTargetCancel]}>
                    취소
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[FONTS.fs_14_regular, styles.replyTargetContent]}
                numberOfLines={1}>
                {replyTarget.content}
              </Text>
            </View>
          ) : null}

          <View style={styles.bottomInputRow}>
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
                style={[
                  FONTS.fs_14_regular,
                  styles.commentInput,
                  {height: commentInputHeight},
                ]}
                placeholder={
                  editingTarget
                    ? '댓글을 수정해주세요.'
                    : '댓글을 입력해주세요.'
                }
                placeholderTextColor={COLORS.grayscale_400}
                value={commentValue}
                maxLength={COMMENT_MAX_LENGTH}
                multiline
                blurOnSubmit={false}
                onChangeText={handleChangeCommentText}
                onContentSizeChange={handleCommentInputContentSizeChange}
                onPressIn={() => {
                  if (!canUseRecruitComment) {
                    showCommentLoginModal();
                  }
                }}
                onFocus={handleFocusInput}
                onBlur={() => setIsCommentFocused(false)}
              />
              {hasCommentValue ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.sendButton}
                  disabled={isSubmittingComment}
                  onPress={handleSubmitComment}>
                  <Text style={[FONTS.fs_20_semibold, styles.sendButtonText]}>
                    ↑
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {shouldShowApplyButton ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.inlineApplyButton}
                onPress={handleApply}>
                <Text style={[FONTS.fs_14_semibold, styles.inlineApplyText]}>
                  지원하기
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />

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
    </KeyboardAvoidingView>
  );
};

export default CommunityStaffDetail;
