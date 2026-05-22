import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import Avatar from '@components/Avatar';
import AlertModal from '@components/modals/AlertModal';
import FullScreenImageModal from '@components/modals/FullScreenImageModal';
import Loading from '@components/Loading';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {toggleFavorite} from '@utils/toggleFavorite';
import {COLORS} from '@constants/colors';
import styles from './Community.styles';

import HeartIcon from '@assets/images/heart_black.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import CommentIcon from '@assets/images/chat_black.svg';

const PAGE_SIZE = 10;
const sortCodeMap = {
  최신순: 'LATEST',
  등록순: 'OLDEST',
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

const CommunityPostList = ({category, selectedSort, isActive}) => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadedSort, setLoadedSort] = useState(null);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchPosts = useCallback(
    async (pageToFetch = 0, isLoadMore = false, isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const response = await communityApi.getPosts({
          ...(category?.code ? {categoryCode: category.code} : {}),
          sort: sortCodeMap[selectedSort],
          page: pageToFetch,
          size: PAGE_SIZE,
        });
        const {content = [], last = true, number = pageToFetch} =
          response.data ?? {};

        setPosts(prev => (pageToFetch === 0 ? content : [...prev, ...content]));
        setPage(number);
        setHasNext(!last);
        if (pageToFetch === 0) {
          setLoadedSort(selectedSort);
        }
      } catch (error) {
        setHasNext(false);
        console.warn('fetchCommunityPosts 실패:', error);

        const role = useUserStore.getState().userRole;
        if (role !== 'USER') {
          showErrorModal({
            message: '커뮤니티는\n로그인 후 이용할 수 있어요',
            buttonText2: '취소',
            buttonText: '로그인하기',
            onPress: () => navigation.navigate('Login'),
            onPress2: () => {},
          });
        } else {
          setErrorModal({
            visible: true,
            message: '커뮤니티 글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
            buttonText: '확인',
          });
        }
      } finally {
        if (isRefresh) {
          setIsRefreshing(false);
        } else if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [category, selectedSort, navigation],
  );

  useFocusEffect(
    useCallback(() => {
      if (!isActive) {
        return;
      }

      // If list is empty or the sort has changed, reload page 0
      if (posts.length === 0 || loadedSort !== selectedSort) {
        fetchPosts(0, false, false);
      }
    }, [isActive, selectedSort, loadedSort, posts.length, fetchPosts]),
  );

  const handleRefresh = () => {
    fetchPosts(0, false, true);
  };

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || isRefreshing || !hasNext) {
      return;
    }

    fetchPosts(page + 1, true, false);
  };

  const handleToggleLike = item => {
    const nextLikeCount = Math.max(
      0,
      Number(item.likeCount || 0) + (item.isLiked ? -1 : 1),
    );

    toggleFavorite({
      type: 'communityPost',
      id: item.postId,
      isLiked: item.isLiked,
      setList: setPosts,
    });

    setPosts(prev =>
      prev?.map(post =>
        post.postId === item.postId
          ? {
              ...post,
              likeCount: nextLikeCount,
            }
          : post,
      ),
    );
  };

  const handleOpenImageModal = (postItem, index) => {
    const sortedImages = [...(postItem.images ?? [])].sort(
      (a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0),
    );
    const mappedImages = sortedImages.map(img => ({
      id: img.imageId ?? img.id,
      imageUrl: img.imageUrl,
    }));
    setModalImages(mappedImages);
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  const renderPostImages = (images, postItem) => {
    if (!images?.length) {
      return null;
    }
    const sortedImages = [...images].sort(
      (a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0),
    );

    if (sortedImages.length === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleOpenImageModal(postItem, 0)}>
          <Image
            source={{uri: sortedImages[0].imageUrl}}
            style={styles.singlePostImage}
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
        contentContainerStyle={styles.multiImageContainer}>
        {sortedImages.map((image, index) => (
          <TouchableOpacity
            key={image.imageId ?? index}
            activeOpacity={0.9}
            onPress={() => handleOpenImageModal(postItem, index)}>
            <Image
              source={{uri: image.imageUrl}}
              style={styles.multiPostImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
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
            iconSize={16}
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

      {renderPostImages(item.images, item)}

      <View style={styles.postActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionItem}
          onPress={() => handleToggleLike(item)}>
          {item.isLiked ? (
            <FilledHeartIcon width={20} height={20} />
          ) : (
            <HeartIcon width={20} height={20} />
          )}
          <Text style={[FONTS.fs_14_regular, styles.actionText]}>
            {item.likeCount}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionItem}>
          <CommentIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_regular, styles.actionText]}>
            {item.commentCount}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.postId.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary_orange}
          />
        }
        ListEmptyComponent={
          isInitialLoading ? (
            <Loading title="커뮤니티 글을 불러오는 중입니다..." />
          ) : (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              아직 등록된 글이 없어요.
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

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />

      <FullScreenImageModal
        visible={imageModalVisible}
        images={modalImages}
        initialIndex={selectedImageIndex}
        onClose={() => setImageModalVisible(false)}
      />
    </View>
  );
};

export default CommunityPostList;
