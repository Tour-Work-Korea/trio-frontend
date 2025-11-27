import React, {useRef, useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {meetScales, stayTypes, meetTags} from '@data/meetOptions';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';

import XBtn from '@assets/images/x_gray.svg';

const {height} = Dimensions.get('window');

const tabList = [
  {key: 'price', label: '가격 범위'},
  {key: 'scale', label: '규모'},
  {key: 'stay', label: '숙박 여부'},
  {key: 'tags', label: '시설/서비스'},
];

const MeetFilterModal = ({visible, onClose, onApply}) => {
  const scrollViewRef = useRef();

  const [sectionPositions, setSectionPositions] = useState({});
  const [activeTab, setActiveTab] = useState('price');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedScale, setSelectedScale] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedTags, setSelectedTags] = useState(meetTags.map(tag => tag.id));

  const [initialState, setInitialState] = useState({
    priceRange: [0, 1000000],
    scale: null,
    stay: null,
    tags: meetTags.map(tag => tag.id),
  });

  const isDirty =
    priceRange[0] !== initialState.priceRange[0] ||
    priceRange[1] !== initialState.priceRange[1] ||
    selectedScale !== initialState.scale ||
    selectedStay !== initialState.stay ||
    selectedTags.length !== initialState.tags.length ||
    !selectedTags.every(t => initialState.tags.includes(t));

  // 현재 영역 감지
  const handleScroll = e => {
    const y = e.nativeEvent.contentOffset.y;

    const entries = Object.entries(sectionPositions);
    let currentTab = activeTab;

    for (let i = 0; i < entries.length; i++) {
      const [key, positionY] = entries[i];
      const nextPositionY = entries[i + 1]?.[1] ?? Infinity;

      if (y >= positionY && y < nextPositionY) {
        currentTab = key;
        break;
      }
    }

    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  };

  // 탭 클릭 → 스크롤 이동
  const handleTabPress = key => {
    const y = sectionPositions[key];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({y, animated: true});
    }
  };

  // 초기화
  const handleReset = () => {
    setPriceRange([0, 1000000]);
    setSelectedScale(null);
    setSelectedStay(null);
    setSelectedTags(meetTags.map(tag => tag.id));

    setInitialState({
      priceRange: [0, 1000000],
      scale: null,
      stay: null,
      tags: meetTags.map(tag => tag.id),
    });
  };

  const toggleTag = id => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold]}>필터</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 탭 */}
          <View style={styles.tabRow}>
            {tabList.map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}>
                <Text
                  style={[
                    FONTS.fs_16_regular,
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                    activeTab === tab.key && FONTS.fs_16_semibold,
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 부문 */}
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            contentContainerStyle={{paddingBottom: 120}}>
            {/* 가격 범위 */}
            <View
              onLayout={e => {
                const y = e.nativeEvent.layout?.y;
                if (y != null)
                  setSectionPositions(prev => ({...prev, price: y}));
              }}
              style={styles.section}>
              <View style={styles.priceSectionHeader}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  가격 범위
                </Text>
              </View>
              <View style={styles.priceMultislider}>
                <MultiSlider
                  values={priceRange}
                  min={0}
                  max={1000000}
                  step={10000}
                  sliderLength={300}
                  onValuesChange={values => {
                    setPriceRange(values);
                  }}
                  selectedStyle={styles.sliderSelected}
                  unselectedStyle={styles.sliderUnselected}
                  markerStyle={styles.sliderMarker}
                />
              </View>
              <View style={styles.priceRangeTextContainer}>
                <View style={styles.priceTextContainer}>
                  <Text style={[FONTS.fs_14_medium, styles.priceTitle]}>
                    최소 금액
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={[FONTS.fs_14_medium, styles.priceText]}>
                      {priceRange[0].toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceTextContainer}>
                  <Text style={[FONTS.fs_14_medium, styles.priceTitle]}>
                    최대 금액
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={[FONTS.fs_14_medium, styles.priceText]}>
                      {priceRange[1].toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.devide} />

            {/* 규모 */}
            <View
              onLayout={e => {
                const y = e.nativeEvent.layout?.y;
                if (y != null)
                  setSectionPositions(prev => ({...prev, scale: y}));
              }}
              style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                규모
              </Text>
              <View style={styles.optionRow}>
                {meetScales.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionBox,
                      selectedScale === opt.id && styles.optionBoxSelected,
                    ]}
                    onPress={() => setSelectedScale(opt.id)}>
                    <Text
                      style={[
                        FONTS.fs_14_semibold,
                        styles.optionText,
                        selectedScale === opt.id && styles.optionTextSelected,
                      ]}>
                      {opt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.devide} />

            {/* 숙박 여부 */}
            <View
              onLayout={e => {
                const y = e.nativeEvent.layout?.y;
                if (y != null)
                  setSectionPositions(prev => ({...prev, stay: y}));
              }}
              style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                숙박 여부
              </Text>
              <View style={styles.optionRow}>
                {stayTypes.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.optionBox}
                    onPress={() => setSelectedStay(opt.id)}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.optionText,
                        selectedStay === opt.id && styles.optionTextSelected,
                      ]}>
                      {opt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.devide} />

            {/* 태그 */}
            <View
              onLayout={e => {
                const y = e.nativeEvent.layout?.y;
                if (y != null)
                  setSectionPositions(prev => ({...prev, tags: y}));
              }}
              style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                시설/서비스
              </Text>
              <View style={styles.optionRow}>
                {meetTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={styles.optionBox}
                      onPress={() => toggleTag(tag.id)}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}>
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.devide} />
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.sticky}>
            <View style={styles.resetButton}>
              <ButtonWhite
                title="초기화"
                onPress={handleReset}
                disabled={!isDirty}
              />
            </View>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="이벤트 보기"
                onPress={() => {
                  const next = {
                    priceRange,
                    selectedScale,
                    selectedStay,
                    selectedTags,
                  };
                  onApply(next);
                  setInitialState({
                    priceRange,
                    scale: selectedScale,
                    stay: selectedStay,
                    tags: selectedTags,
                  });
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MeetFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },

  // 탭
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_300,
    marginTop: 20,
  },
  tabText: {
    paddingBottom: 12,
    color: COLORS.grayscale_600,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },

  // 선택 섹션
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {},
  devide: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
  },

  // 가격
  priceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceSubtitle: {
    color: COLORS.grayscale_500,
  },
  // 가격 슬라이더
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
    width: 18,
    height: 18,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 4,
  },
  // 가격 출력
  priceRangeTextContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 4,
  },
  priceTextContainer: {
    flex: 1,
  },
  priceTitle: {
    marginBottom: 4,
  },
  priceContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 12,
    borderRadius: 20,
  },
  priceText: {},

  // 규모, 숙박여부, 태그
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    alignContent: 'center',
  },
  optionBox: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  optionText: {
    textAlign: 'center',
    color: COLORS.grayscale_400,
  },
  optionTextSelected: {
    color: COLORS.primary_orange,
  },

  // 하단 버튼
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 3,
  },
});
