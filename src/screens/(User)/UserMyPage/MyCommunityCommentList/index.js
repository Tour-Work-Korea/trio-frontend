import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import Avatar from '@components/Avatar';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import communityApi from '@utils/api/communityApi';
import styles from './MyCommunityCommentList.styles';
import HeartIcon from '@assets/images/heart_black.svg';
import CommentIcon from '@assets/images/chat_black.svg';

const PAGE_SIZE = 10;

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
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  const date = new Date(dateTime);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}.${day}`;
};

const MyCommunityCommentList = () => {
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const fetchMyComments = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const response = await communityApi.getMyComments({
          page: pageToFetch,
          size: PAGE_SIZE,
        });
        const {content = [], last = true, number = pageToFetch} =
          response.data ?? {};

        setComments(prev =>
          pageToFetch === 0 ? content : [...prev, ...content],
        );
        setPage(number);
        setHasNext(!last);
      } catch (error) {
        setHasNext(false);
        console.warn('fetchMyCommunityComments 실패:', error);
      } finally {
        if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      setComments([]);
      setHasNext(true);
      setPage(0);
      fetchMyComments(0, false);
    }, [fetchMyComments]),
  );

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || !hasNext) {
      return;
    }

    fetchMyComments(page + 1, true);
  };

  const handlePressComment = item => {
    navigation.navigate('CommunityDetail', {
      postId: item.postSummary?.postId,
      commentAnchor: item.anchor,
    });
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
        nestedScrollEnabled
        directionalLockEnabled
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

  const renderCommentItem = ({item}) => {
    const post = item.postSummary;
    const commentTypeText = item.commentType === 'REPLY' ? '내 답글' : '내 댓글';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.itemContainer}
        onPress={() => handlePressComment(item)}>
        <View style={styles.postSummary}>
          <View style={styles.postHeader}>
            <Avatar
              uri={post?.author?.profileImageUrl}
              size={30}
              iconSize={30}
              style={styles.avatar}
            />
            <Text style={[FONTS.fs_16_medium, styles.nickname]}>
              {post?.author?.nickname}
            </Text>
            <Text style={[FONTS.fs_14_regular, styles.postTime]}>
              {formatRelativeTime(post?.createdAt)}
            </Text>
          </View>
          <Text
            style={[FONTS.fs_16_medium, styles.postTitle]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {post?.title}
          </Text>
          <Text
            style={[FONTS.fs_14_regular, styles.postContent]}
            numberOfLines={2}
            ellipsizeMode="tail">
            {post?.content}
          </Text>

          {renderPostImages(post?.images)}

          <View style={styles.postActions}>
            <View style={styles.actionItem}>
              <HeartIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_regular, styles.actionText]}>
                {post?.likeCount}
              </Text>
            </View>
            <View style={styles.actionItem}>
              <CommentIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_regular, styles.actionText]}>
                {post?.commentCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.commentPreview}>
          <View style={styles.commentMetaRow}>
            <Text style={[FONTS.fs_14_medium, styles.commentType]}>
              {commentTypeText}
            </Text>
            <Text
              style={[FONTS.fs_14_regular, styles.targetText]}
              numberOfLines={1}>
              {item.targetAuthorNickname}_님에게 남김
            </Text>
          </View>
          <Text
            style={[FONTS.fs_14_regular, styles.commentContent]}
            numberOfLines={2}
            ellipsizeMode="tail">
            {item.myCommentContent}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="내가 쓴 댓글" onPress={() => navigation.goBack()} />
      <FlatList
        data={comments}
        keyExtractor={item => item.commentId.toString()}
        renderItem={renderCommentItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isInitialLoading ? (
            <Loading title="내가 쓴 댓글을 불러오는 중입니다..." />
          ) : (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              아직 작성한 댓글이 없어요.
            </Text>
          )
        }
        ListFooterComponent={
          isMoreLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.grayscale_500}
              style={styles.footerLoading}
            />
          ) : null
        }
      />
    </View>
  );
};

export default MyCommunityCommentList;
