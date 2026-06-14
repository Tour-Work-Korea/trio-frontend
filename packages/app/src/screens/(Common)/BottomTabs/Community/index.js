import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import AlertModal from '@components/modals/AlertModal';
import Modal from '@components/modals/AdaptiveModal';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import useSwipeTabs from '@hooks/useSwipeTabs';
import styles from './Community.styles';
import Staff from './Staff';
import CommunityPostList from './CommunityPostList';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import PlusIcon from '@assets/images/plus_black.svg';

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

const withAllCategory = categories => [
  allCategory,
  ...categories.filter(category => category.code !== allCategory.code),
];

const getCategoryKey = category =>
  String(category?.id ?? category?.code ?? category?.displayName ?? 'ALL');

const Community = () => {
  const navigation = useNavigation();
  const sortButtonRef = useRef(null);
  const [selectedSort, setSelectedSort] = useState(sortChips[0]);
  const [categories, setCategories] = useState(defaultCategories);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 116,
    left: 16,
  });
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const categoryTabs = useMemo(
    () =>
      categories.map(category => ({
        ...category,
        key: getCategoryKey(category),
      })),
    [categories],
  );

  const {
    pagerRef,
    activeIndex,
    isActive,
    onTabPress,
    pageWidth,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs: categoryTabs,
    initialKey: getCategoryKey(defaultCategories[0]),
  });

  const activeCategory = categoryTabs[activeIndex] ?? categoryTabs[0];
  const isStaffSelected = activeCategory?.contentType === 'RECRUIT';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await communityApi.getCategories();
        const nextCategories = Array.isArray(response.data)
          ? withAllCategory(response.data)
          : defaultCategories;

        setCategories(nextCategories);
      } catch (error) {
        console.warn('fetchCommunityCategories 실패:', error);
        setErrorModal({
          visible: true,
          message: '커뮤니티 카테고리를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          buttonText: '확인',
        });
      }
    };

    fetchCategories();
  }, []);

  const handleSelectSort = sort => {
    setSelectedSort(sort);
    setSortVisible(false);
  };

  const handleToggleSortMenu = useCallback(() => {
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
  }, [sortVisible]);

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

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
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
            {categoryTabs.map((category, index) => {
              const selected = activeIndex === index;

              return (
                <TouchableOpacity
                  key={category.key}
                  activeOpacity={0.8}
                  onPress={() => onTabPress(index)}
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
      </View>
    ),
    [
      activeIndex,
      categoryTabs,
      handleToggleSortMenu,
      onTabPress,
      selectedSort,
      sortVisible,
    ],
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onLayout={onPagerLayout}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}>
        {categoryTabs.map(category => (
          <View
            key={category.key}
            style={[styles.page, pageWidth > 0 && {width: pageWidth}]}>
            {category.contentType === 'RECRUIT' ? (
              <Staff isActive={isActive(category.key)} />
            ) : (
              <CommunityPostList
                category={category}
                selectedSort={selectedSort}
                isActive={isActive(category.key)}
                contentContainerStyle={styles.pageListContent}
              />
            )}
          </View>
        ))}
      </ScrollView>

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
