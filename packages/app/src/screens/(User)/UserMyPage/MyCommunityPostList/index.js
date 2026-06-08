import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import styles from './MyCommunityPostList.styles';
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

const MyCommunityPostList = () => {
  const navigation = useNavigation();
  const listRef = useRef(null);
  const postsLengthRef = useRef(0);
  const pageRef = useRef(0);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    postsLengthRef.current = posts.length;
  }, [posts.length]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchMyPosts = useCallback(async (pageToFetch = 0, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsMoreLoading(true);
      } else {
        setIsInitialLoading(true);
      }

      const response = await communityApi.getMyPosts({
        page: pageToFetch,
        size: PAGE_SIZE,
      });
      const {content = [], last = true, number = pageToFetch} =
        response.data ?? {};

      setPosts(prev => (pageToFetch === 0 ? content : [...prev, ...content]));
      setPage(number);
      setHasNext(!last);
    } catch (error) {
      setHasNext(false);
      console.warn('fetchMyCommunityPosts 실패:', error);
    } finally {
      if (isLoadMore) {
        setIsMoreLoading(false);
      } else {
        setIsInitialLoading(false);
      }
    }
  }, []);

  const refreshVisibleMyPosts = useCallback(async () => {
    const lastLoadedPage = pageRef.current;
    const pages = Array.from({length: lastLoadedPage + 1}, (_, index) => index);

    try {
      const results = await Promise.all(
        pages.map(pageToFetch =>
          communityApi.getMyPosts({
            page: pageToFetch,
            size: PAGE_SIZE,
          }),
        ),
      );
      const nextPosts = results.flatMap(
        response => response.data?.content ?? [],
      );
      const lastPageData = results[results.length - 1]?.data;

      setPosts(nextPosts);
      setPage(lastPageData?.number ?? lastLoadedPage);
      setHasNext(!lastPageData?.last);
    } catch (error) {
      console.warn('refreshMyCommunityPosts 실패:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (postsLengthRef.current === 0) {
        setHasNext(true);
        setPage(0);
        fetchMyPosts(0, false);
        return;
      }

      refreshVisibleMyPosts();
    }, [fetchMyPosts, refreshVisibleMyPosts]),
  );

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || !hasNext) {
      return;
    }

    fetchMyPosts(page + 1, true);
  };

  const handleEditPost = async postId => {
    if (editingPostId) {
      return;
    }

    try {
      setEditingPostId(postId);
      const response = await communityApi.getPostDetail(postId);

      navigation.navigate('CommunityWrite', {
        mode: 'edit',
        post: response.data,
      });
    } catch (error) {
      console.warn(
        'fetchCommunityPostForEdit 실패:',
        error?.response?.data || error?.message,
      );
      Alert.alert('게시글 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setEditingPostId(null);
    }
  };

  const handleDeletePost = postId => {
    if (deletingPostId) {
      return;
    }

    Alert.alert('게시글 삭제', '게시글을 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingPostId(postId);
            await communityApi.deletePost(postId);
            setPosts(prev => prev.filter(post => post.postId !== postId));
          } catch (error) {
            console.warn(
              'deleteCommunityPost 실패:',
              error?.response?.data || error?.message,
            );
            Alert.alert('게시글 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.');
          } finally {
            setDeletingPostId(null);
          }
        },
      },
    ]);
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

  const renderPost = ({item}) => (
    <View style={styles.postContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('CommunityDetail', {postId: item.postId})
        }>
        <View style={styles.postHeader}>
          <Avatar
            uri={item.author?.profileImageUrl}
            size={30}
            iconSize={30}
            style={styles.avatar}
          />
          <Text style={[FONTS.fs_16_medium, styles.nickname]}>
            {item.author?.nickname}
          </Text>
          <Text style={[FONTS.fs_14_regular, styles.time]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>

        <Text style={[FONTS.fs_16_medium, styles.postTitle]}>
          {item.title}
        </Text>
        <Text
          style={[FONTS.fs_16_regular, styles.postContent]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.content}
        </Text>
      </TouchableOpacity>

      {renderPostImages(item.images)}

      <View style={styles.postActions}>
        <View style={styles.postStats}>
          <View style={styles.actionItem}>
            <HeartIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_regular, styles.actionText]}>
              {item.likeCount}
            </Text>
          </View>
          <View style={styles.actionItem}>
            <CommentIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_regular, styles.actionText]}>
              {item.commentCount}
            </Text>
          </View>
        </View>

        <View style={styles.manageActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.manageButton}
            disabled={editingPostId === item.postId}
            onPress={() => handleEditPost(item.postId)}>
            <Text style={[FONTS.fs_14_medium, styles.manageButtonText]}>
              {editingPostId === item.postId ? '불러오는 중' : '수정'}
            </Text>
          </TouchableOpacity>
          <View style={styles.manageDivider} />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.manageButton}
            disabled={deletingPostId === item.postId}
            onPress={() => handleDeletePost(item.postId)}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.manageButtonText,
                styles.deleteButtonText,
              ]}>
              {deletingPostId === item.postId ? '삭제중' : '삭제'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="내가 쓴 글" onPress={() => navigation.goBack()} />
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={item => item.postId.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isInitialLoading ? (
            <Loading title="내가 쓴 글을 불러오는 중입니다..." />
          ) : (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              아직 작성한 글이 없어요.
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

export default MyCommunityPostList;
