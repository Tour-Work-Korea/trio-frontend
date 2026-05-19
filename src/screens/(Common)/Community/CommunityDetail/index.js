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

import Avatar from '@components/Avatar';
import Header from '@components/Header';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import styles from './CommunityDetail.styles';
import HeartIcon from '@assets/images/heart_black.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import CommentIcon from '@assets/images/chat_black.svg';
import {COLORS} from '@constants/colors';

const COMMENT_MAX_LENGTH = 300;
const COMMENT_PAGE_SIZE = 20;

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

const CommunityDetail = ({route}) => {
  const navigation = useNavigation();
  const {postId} = route.params ?? {};
  const currentUserPhotoUrl = useUserStore(
    state => state.userProfile?.photoUrl,
  );
  const commentInputRef = useRef(null);
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
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const shouldShowAd = useMemo(() => Math.random() < 0.25, []);
  const hasCommentValue = commentValue.trim().length > 0;

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        const response = await communityApi.getPostDetail(postId, {
          commentPage: 0,
          commentSize: COMMENT_PAGE_SIZE,
        });

        setPost(response.data);
        setComments(response.data?.comments ?? []);
        setCommentPage(0);
        setCommentsLast(Boolean(response.data?.commentsLast));
      } catch (error) {
        console.warn('fetchCommunityPostDetail 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

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

  const postReplyTarget = useMemo(
    () => ({
      type: 'post',
      parentCommentId: null,
      nickname: post?.author?.nickname,
      content: post?.content,
    }),
    [post],
  );

  const handleFocusInput = () => {
    if (!replyTarget) {
      setReplyTarget(postReplyTarget);
    }
    setIsCommentFocused(true);
  };

  const handlePressComment = item => {
    setReplyTarget({
      type: 'comment',
      parentCommentId: item.commentId,
      nickname: item.author?.nickname,
      content: item.content,
    });
    setIsCommentFocused(true);
    commentInputRef.current?.focus();
  };

  const handleSubmitComment = async () => {
    const trimmedContent = commentValue.trim();

    if (!trimmedContent || isSubmittingComment || !postId) {
      return;
    }

    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
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
      const parentCommentId = replyTarget?.parentCommentId ?? null;
      const response = await communityApi.createComment(postId, {
        parentCommentId,
        content: trimmedContent,
      });
      const nextComment = response.data;

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
      setCommentValue('');
      setReplyTarget(postReplyTarget);
      Keyboard.dismiss();
    } catch (error) {
      console.warn('createCommunityComment 실패:', error);
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

    if (sortedImages.length === 1) {
      return (
        <Image
          source={{uri: sortedImages[0].imageUrl}}
          style={styles.singlePostImage}
          resizeMode="cover"
        />
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.multiImageContainer}>
        {sortedImages.map((image, index) => (
          <Image
            key={image.imageId ?? index}
            source={{uri: image.imageUrl}}
            style={styles.multiPostImage}
            resizeMode="cover"
          />
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
        {/* 댓글 좋아요 API 연동 전까지 숨김 */}
        {showLike ? (
          <TouchableOpacity
            activeOpacity={likeable ? 0.8 : 1}
            disabled={!likeable}
            style={styles.actionItem}
            onPress={handleToggleLike}>
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

  const renderComment = comment => (
    <View key={comment.commentId} style={styles.commentBlock}>
      {comment.replies?.length ? (
        <View style={styles.commentThreadConnector} />
      ) : null}

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
          </View>
          <Text style={[FONTS.fs_16_regular, styles.commentText]}>
            {comment.content}
          </Text>
          {renderActionRow(comment, {showLike: false, compact: true})}
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
                    <Text style={[FONTS.fs_14_semibold, styles.commentNickname]}>
                      {reply.author?.nickname}
                    </Text>
                    <Text style={[FONTS.fs_14_regular, styles.commentTime]}>
                      {formatRelativeTime(reply.createdAt)}
                    </Text>
                  </View>
                  <Text style={[FONTS.fs_16_regular, styles.commentText]}>
                    {reply.content}
                  </Text>
                  {renderActionRow(reply, {
                    showLike: false,
                    showComment: false,
                    compact: true,
                  })}
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

          <View style={styles.commentList}>{comments.map(renderComment)}</View>
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
        {isCommentFocused && replyTarget ? (
          <View style={styles.replyTargetBox}>
            <Text
              style={[FONTS.fs_14_regular, styles.replyTargetTitle]}
              numberOfLines={1}>
              {replyTarget.nickname}_님에게 답글 남기는 중
            </Text>
            <Text
              style={[FONTS.fs_14_regular, styles.replyTargetContent]}
              numberOfLines={1}>
              {replyTarget.content}
            </Text>
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
            placeholder="댓글을 입력해주세요."
            placeholderTextColor={COLORS.grayscale_400}
            value={commentValue}
            maxLength={COMMENT_MAX_LENGTH}
            onChangeText={setCommentValue}
            onFocus={handleFocusInput}
            onBlur={() => setIsCommentFocused(false)}
          />
          {hasCommentValue ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.sendButton}
              onPress={handleSubmitComment}>
              <Text style={[FONTS.fs_20_semibold, styles.sendButtonText]}>
                ↑
              </Text>
            </TouchableOpacity>
          ) : null /* 댓글 사진 API 연동 전까지 사진 버튼 숨김 */}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommunityDetail;
