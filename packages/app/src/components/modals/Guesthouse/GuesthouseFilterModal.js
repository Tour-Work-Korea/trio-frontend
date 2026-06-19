import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import XBtn from '@assets/images/x_gray.svg';
import CheckIcon from '@assets/images/check20_orange.svg';

const {height, width} = Dimensions.get('window');
const MIN_PRICE = 10000;
const MAX_PRICE = 1000000;
const CONTENT_OPTIONS = [
  '포틀럭',
  '독서',
  '디너파티',
  // '서핑/레저',
  '프로그램',
  '쉼',
];
const ROOM_TYPE_OPTIONS = ['일반 객실', '도미토리'];
const SORT_OPTIONS = [
  {label: '추천 순', value: 'RECOMMEND'},
  {label: '낮은 가격 순', value: 'LOW_PRICE'},
  {label: '높은 가격 순', value: 'HIGH_PRICE'},
  {label: '찜 많은 순', value: 'LIKE_COUNT'},
];
const TAB_LIST = [
  {key: 'sort', label: '정렬'},
  {key: 'content', label: '콘텐츠'},
  {key: 'price', label: '가격 범위'},
  {key: 'room', label: '객실 유형'},
];

const GuesthouseFilterModal = ({
  visible,
  onClose,
  initialFilters,
  selectedSort = 'RECOMMEND',
  onApply,
  onCountRequest,
  resultCount,
}) => {
  const [activeTab, setActiveTab] = useState('sort');
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [nextSort, setNextSort] = useState(selectedSort);
  const scrollViewRef = useRef(null);
  const [sectionPositions, setSectionPositions] = useState({});
  const [displayResultCount, setDisplayResultCount] = useState(resultCount);

  useEffect(() => {
    if (!visible || !initialFilters) {
      return;
    }

    setActiveTab('sort');
    setPriceRange([
      initialFilters.minPrice ?? MIN_PRICE,
      Math.min(initialFilters.maxPrice ?? MAX_PRICE, MAX_PRICE),
    ]);
    setSelectedRoomType(initialFilters.roomType || null);
    setSelectedTags(initialFilters.tags || []);
    setNextSort(selectedSort);
  }, [initialFilters, selectedSort, visible]);

  useEffect(() => {
    setDisplayResultCount(resultCount);
  }, [resultCount]);

  useEffect(() => {
    if (!visible || !onCountRequest) {
      return;
    }

    const timer = setTimeout(() => {
      onCountRequest({
        tags: selectedTags,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        roomType: selectedRoomType,
        facility: initialFilters?.facility || [],
        onlyAvailable: initialFilters?.onlyAvailable || false,
      })
        .then(count => {
          if (typeof count === 'number') {
            setDisplayResultCount(count);
          }
        })
        .catch(error => {
          console.warn('필터 결과 개수 조회 실패', error);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    initialFilters,
    onCountRequest,
    priceRange,
    selectedRoomType,
    selectedTags,
    visible,
  ]);

  const isDirty = useMemo(() => {
    return (
      nextSort !== 'RECOMMEND' ||
      priceRange[0] !== MIN_PRICE ||
      priceRange[1] !== MAX_PRICE ||
      Boolean(selectedRoomType) ||
      selectedTags.length > 0
    );
  }, [nextSort, priceRange, selectedRoomType, selectedTags.length]);

  const handleReset = () => {
    setNextSort('RECOMMEND');
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedRoomType(null);
    setSelectedTags([]);
  };

  const toggleValue = (value, setter) => {
    setter(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value],
    );
  };

  const applyFilters = () => {
    onApply({
      tags: selectedTags,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      roomType: selectedRoomType,
      facility: initialFilters?.facility || [],
      onlyAvailable: initialFilters?.onlyAvailable || false,
      sortBy: nextSort,
    });
  };

  const setSectionPosition = (key, y) => {
    setSectionPositions(prev => ({...prev, [key]: y}));
  };

  const handleTabPress = key => {
    const y = sectionPositions[key];
    setActiveTab(key);

    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({y, animated: true});
    }
  };

  const handleScroll = event => {
    const y = event.nativeEvent.contentOffset.y;
    const entries = TAB_LIST
      .map(tab => [tab.key, sectionPositions[tab.key]])
      .filter(([, position]) => position !== undefined);

    let currentTab = activeTab;

    for (let i = 0; i < entries.length; i += 1) {
      const [key, positionY] = entries[i];
      const nextPositionY = entries[i + 1]?.[1] ?? Infinity;

      if (y >= positionY - 12 && y < nextPositionY - 12) {
        currentTab = key;
        break;
      }
    }

    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  };

  const renderChip = ({label, selected, onPress}) => (
    <TouchableOpacity
      key={label}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}>
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortSection = () => (
    <View
      style={styles.section}
      onLayout={event => setSectionPosition('sort', event.nativeEvent.layout.y)}>
      <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>정렬</Text>
      <View style={styles.optionList}>
        {SORT_OPTIONS.map(option => {
          const selected = nextSort === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              style={styles.sortOption}
              onPress={() => setNextSort(option.value)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.sortText,
                  selected && styles.sortTextSelected,
                  selected && FONTS.fs_14_semibold,
                ]}>
                {option.label}
              </Text>
              {selected && <CheckIcon width={20} height={20} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderContentSection = () => (
    <View
      style={styles.section}
      onLayout={event =>
        setSectionPosition('content', event.nativeEvent.layout.y)
      }>
      <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>콘텐츠</Text>
      <View style={styles.chipRow}>
        {CONTENT_OPTIONS.map(option =>
          renderChip({
            label: option,
            selected: selectedTags.includes(option),
            onPress: () => toggleValue(option, setSelectedTags),
          }),
        )}
      </View>
    </View>
  );

  const renderPriceSection = () => (
    <View
      style={styles.section}
      onLayout={event => setSectionPosition('price', event.nativeEvent.layout.y)}>
      <View style={styles.priceSectionHeader}>
        <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
          가격 범위
        </Text>
        <Text style={[FONTS.fs_12_medium, styles.priceSubtitle]}>
          성인 1, 1박 기준
        </Text>
      </View>
      <View style={styles.priceMultislider}>
        <MultiSlider
          values={priceRange}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={10000}
          sliderLength={Math.min(width - 60, 360)}
          onValuesChange={setPriceRange}
          selectedStyle={styles.sliderSelected}
          unselectedStyle={styles.sliderUnselected}
          markerStyle={styles.sliderMarker}
        />
      </View>
      <View style={styles.priceRangeTextContainer}>
        <View style={styles.priceTextContainer}>
          <Text style={[FONTS.fs_14_medium, styles.priceTitle]}>최소 금액</Text>
          <View style={styles.priceContainer}>
            <Text style={[FONTS.fs_14_medium, styles.priceText]}>
              {priceRange[0].toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.priceTextContainer}>
          <Text style={[FONTS.fs_14_medium, styles.priceTitle]}>최대 금액</Text>
          <View style={styles.priceContainer}>
            <Text style={[FONTS.fs_14_medium, styles.priceText]}>
              {priceRange[1].toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRoomSection = () => (
    <View
      style={styles.section}
      onLayout={event => setSectionPosition('room', event.nativeEvent.layout.y)}>
      <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>객실 유형</Text>
      <View style={styles.chipRow}>
        {ROOM_TYPE_OPTIONS.map(option =>
          renderChip({
            label: option,
            selected: selectedRoomType === option,
            onPress: () =>
              setSelectedRoomType(prev => (prev === option ? null : option)),
          }),
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold]}>필터</Text>
            <TouchableOpacity activeOpacity={1} style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            {TAB_LIST.map(tab => {
              const selected = activeTab === tab.key;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={tab.key}
                  onPress={() => handleTabPress(tab.key)}>
                  <Text
                    style={[
                      FONTS.fs_16_regular,
                      styles.tabText,
                      selected && styles.tabTextActive,
                      selected && FONTS.fs_16_semibold,
                    ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.content}>
            {renderSortSection()}
            <View style={styles.divider} />
            {renderContentSection()}
            <View style={styles.divider} />
            {renderPriceSection()}
            <View style={styles.divider} />
            {renderRoomSection()}
          </ScrollView>

          <View style={styles.sticky}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isDirty}
              style={[styles.resetButton, !isDirty && styles.resetButtonDisabled]}
              onPress={handleReset}>
              <Text
                style={[
                  FONTS.fs_16_semibold,
                  styles.resetText,
                  !isDirty && styles.resetTextDisabled,
                ]}>
                초기화
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.confirmButton}
              onPress={applyFilters}>
              <Text style={[FONTS.fs_16_semibold, styles.confirmText]}>
                {typeof displayResultCount === 'number'
                  ? `${displayResultCount}개 게스트하우스 보기`
                  : '게스트하우스 보기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GuesthouseFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.78,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_300,
  },
  tabText: {
    paddingBottom: 14,
    color: COLORS.grayscale_600,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },
  content: {
    paddingBottom: 120,
  },
  section: {
    paddingVertical: 28,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 16,
  },
  optionList: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 14,
  },
  sortText: {
    color: COLORS.grayscale_500,
  },
  sortTextSelected: {
    color: COLORS.primary_orange,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: COLORS.grayscale_100,
  },
  chipSelected: {
    backgroundColor: COLORS.primary_orange,
  },
  chipText: {
    color: COLORS.grayscale_800,
  },
  chipTextSelected: {
    color: COLORS.grayscale_0,
  },
  priceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  priceSubtitle: {
    color: COLORS.grayscale_500,
  },
  priceMultislider: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderSelected: {
    backgroundColor: COLORS.grayscale_900,
    height: 4,
  },
  sliderUnselected: {
    backgroundColor: COLORS.grayscale_200,
    height: 4,
  },
  sliderMarker: {
    backgroundColor: COLORS.secondary_blue,
    width: 20,
    height: 20,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 4,
  },
  priceRangeTextContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  priceTextContainer: {
    flex: 1,
  },
  priceTitle: {
    marginBottom: 8,
  },
  priceContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
  },
  priceText: {
    color: COLORS.grayscale_900,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
  },
  resetButtonDisabled: {
    backgroundColor: COLORS.grayscale_200,
  },
  resetText: {
    color: COLORS.grayscale_700,
  },
  resetTextDisabled: {
    color: COLORS.grayscale_400,
  },
  confirmButton: {
    flex: 3,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary_orange,
  },
  confirmText: {
    color: COLORS.grayscale_0,
  },
});
