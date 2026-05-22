import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
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

const Community = () => {
  const navigation = useNavigation();
  const sortButtonRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const chipLayouts = useRef([]);

  const [selectedSort, setSelectedSort] = useState(sortChips[0]);
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0]);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 116,
    left: 16,
  });

  const [scrollWidth, setScrollWidth] = useState(0);

  const isStaffSelected = selectedCategory?.contentType === 'RECRUIT';

  const tabs = useMemo(
    () => categories.map(cat => ({...cat, key: cat.id ?? cat.code})),
    [categories],
  );

  const {
    pagerRef,
    activeIndex,
    isActive,
    onTabPress,
    onPagerLayout,
    onMomentumScrollEnd,
    pageWidth,
  } = useSwipeTabs({
    tabs,
    initialKey: selectedCategory?.id ?? selectedCategory?.code,
    onChange: (key, index) => {
      setSelectedCategory(categories[index]);
    },
  });

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

  const onScrollLayout = event => {
    setScrollWidth(event.nativeEvent.layout.width);
  };

  const centerChip = useCallback(
    index => {
      const layout = chipLayouts.current[index];
      if (!layout || scrollWidth <= 0) {
        return;
      }

      const {x, width} = layout;
      const targetX = x - scrollWidth / 2 + width / 2;

      categoryScrollRef.current?.scrollTo({
        x: Math.max(0, targetX),
        y: 0,
        animated: true,
      });
    },
    [scrollWidth],
  );

  useEffect(() => {
    if (activeIndex >= 0) {
      centerChip(activeIndex);
    }
  }, [activeIndex, centerChip]);

  return (
    <View style={styles.container}>
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
            ref={categoryScrollRef}
            style={styles.categoryScroll}
            horizontal
            onLayout={onScrollLayout}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipContainer}>
            {categories.map((category, index) => {
              const selected = selectedCategory?.code === category.code;

              return (
                <TouchableOpacity
                  key={category.id ?? category.code}
                  activeOpacity={0.8}
                  onPress={() => onTabPress(index)}
                  onLayout={event => {
                    const {x, width} = event.nativeEvent.layout;
                    chipLayouts.current[index] = {x, width};
                  }}
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

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={onPagerLayout}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}>
        {categories.map(category => {
          const isCurrentActive = isActive(category.id ?? category.code);

          return (
            <View
              key={category.id ?? category.code}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                width: pageWidth > 0 ? pageWidth : '100%',
              }}>
              {category.contentType === 'RECRUIT' ? (
                <Staff isActive={isCurrentActive} />
              ) : (
                <CommunityPostList
                  category={category}
                  selectedSort={selectedSort}
                  isActive={isCurrentActive}
                />
              )}
            </View>
          );
        })}
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
    </View>
  );
};

export default Community;
