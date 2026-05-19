import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import Avatar from '@components/Avatar';
import AlertModal from '@components/modals/AlertModal';
import Loading from '@components/Loading';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {toggleFavorite} from '@utils/toggleFavorite';
import {COLORS} from '@constants/colors';
import styles from './Community.styles';
import Staff from './Staff';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import HeartIcon from '@assets/images/heart_black.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import CommentIcon from '@assets/images/chat_black.svg';

const PAGE_SIZE = 10;
const sortChips = ['최신순', '등록순'];
const allCategory = {
  id: 'ALL',
  code: null,
  displayName: '전체',
  contentType: 'COMMUNITY',
};
const defaultCategories = [
  allCategory,
  {
    id: 'GUESTHOUSE_RECOMMEND',
    code: 'GUESTHOUSE_RECOMMEND',
    displayName: '게하추천',
    contentType: 'COMMUNITY',
  },
  {id: 'FOOD', code: 'FOOD', displayName: '맛집', contentType: 'COMMUNITY'},
  {id: 'CAFE', code: 'CAFE', displayName: '카페', contentType: 'COMMUNITY'},
  {
    id: 'COMPANION',
    code: 'COMPANION',
    displayName: '동행',
    contentType: 'COMMUNITY',
  },
  {id: 'STAFF', code: 'STAFF', displayName: '스탭', contentType: 'RECRUIT'},
];

const sortCodeMap = {
  최신순: 'LATEST',
  등록순: 'OLDEST',
};

const withAllCategory = categories => [
  allCategory,
  ...categories.filter(category => category.code !== allCategory.code),
];

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

const Community = () => {
  const navigation = useNavigation();
  const sortButtonRef = useRef(null);
  const [selectedSort, setSelectedSort] = useState(sortChips[0]);
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0]);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 116,
    left: 16,
  });
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const isStaffSelected = selectedCategory?.contentType === 'RECRUIT';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await communityApi.getCategories();
        const nextCategories = Array.isArray(response.data)
          ? withAllCategory(response.data)
          : defaultCategories;

        setCategories(nextCategories);
        setSelectedCategory(prev => {
          const matchedCategory = nextCategories.find(
            category => category.code === prev?.code,
          );

          return matchedCategory ?? nextCategories[0] ?? defaultCategories[0];
        });
      } catch (error) {
        console.warn('fetchCommunityCategories 실패:', error);
      }
    };

    fetchCategories();
  }, []);

  const fetchPosts = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      if (selectedCategory?.contentType === 'RECRUIT') {
        return;
      }

      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const response = await communityApi.getPosts({
          ...(selectedCategory?.code
            ? {categoryCode: selectedCategory.code}
            : {}),
          sort: sortCodeMap[selectedSort],
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
        if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [navigation, selectedCategory, selectedSort],
  );

  useFocusEffect(
    useCallback(() => {
      if (isStaffSelected) {
        setPosts([]);
        setHasNext(false);
        setPage(0);
        return;
      }

      setPosts([]);
      setHasNext(true);
      setPage(0);
      fetchPosts(0, false);
    }, [fetchPosts, isStaffSelected]),
  );

  const handleSelectSort = sort => {
    setSelectedSort(sort);
    setSortVisible(false);
  };

  const handleToggleSortMenu = () => {
    if (sortVisible) {
      setSortVisible(false);
      return;
    }

    sortButtonRef.current?.measureInWindow?.((x, y, width, height) => {
      setSortMenuPosition({
        top: y + height + 6,
        left: x,
      });
    });
    setSortVisible(true);
  };

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || !hasNext || isStaffSelected) {
      return;
    }

    fetchPosts(page + 1, true);
  };

  const handlePressWrite = () => {
    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
      showErrorModal({
        message: '글쓰기는\n 로그인 후 사용해주세요',
        buttonText2: '취소',
        buttonText: '로그인하기',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    navigation.navigate('CommunityWrite');
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

      {renderPostImages(item.images)}

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

  const renderHeader = () => (
    <>
      <Text style={[FONTS.fs_20_semibold, styles.title]}>커뮤니티</Text>

      <View style={styles.filterRow}>
        <View style={styles.sortWrapper}>
          <TouchableOpacity
            ref={sortButtonRef}
            activeOpacity={0.8}
            style={styles.sortChip}
            onPress={handleToggleSortMenu}>
            <Text style={[FONTS.fs_14_medium, styles.sortChipText]}>
              {selectedSort}
            </Text>
            {sortVisible ? (
              <ChevronUp width={16} height={16} />
            ) : (
              <ChevronDown width={16} height={16} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.categoryScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipContainer}>
          {categories.map(category => {
            const selected = selectedCategory?.code === category.code;

            return (
              <TouchableOpacity
                key={category.id ?? category.code}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(category)}
                style={[styles.chip, selected && styles.selectedChip]}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.chipText,
                    selected && styles.selectedChipText,
                  ]}>
                    {category.displayName}
                  </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {isStaffSelected ? (
        <>
          <View style={styles.staffHeader}>{renderHeader()}</View>
          <Staff />
        </>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.postId.toString()}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
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
      )}

      {!isStaffSelected && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.writeButton}
          onPress={handlePressWrite}>
          <PlusIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.writeButtonText]}>
            글쓰기
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={sortVisible}
        transparent
        animationType="none"
        onRequestClose={() => setSortVisible(false)}>
        <View style={styles.sortOverlay}>
          <Pressable
            style={styles.sortOverlayBackdrop}
            onPress={() => setSortVisible(false)}
          />
          <View style={[styles.floatingSortMenu, sortMenuPosition]}>
            {sortChips.map(sort => (
              <TouchableOpacity
                key={sort}
                activeOpacity={0.8}
                style={styles.sortMenuItem}
                onPress={() => handleSelectSort(sort)}>
                <Text
                  style={[
                    FONTS.fs_16_medium,
                    styles.sortMenuText,
                    selectedSort === sort && styles.selectedSortMenuText,
                  ]}>
                  {sort}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default Community;
