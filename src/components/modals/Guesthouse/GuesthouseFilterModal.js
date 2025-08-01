// 태그 말고 나머지도 값 주고 받을 때 닫기 눌러도 유지 안되게 확인
import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import { COLORS } from "@constants/colors";
import { FONTS } from "@constants/fonts";
import { guesthouseTags } from '@data/guesthouseTags';
import { roomTypes, filterServices } from '@data/guesthouseOptions';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';

import UnChecked from '@assets/images/check_gray.svg';
import Checked from '@assets/images/check_orange.svg';
import XBtn from '@assets/images/x_gray.svg';

const { height } = Dimensions.get("window");

const tabList = [
  { key: "price", label: "가격 범위" },
  { key: "type", label: "숙소 유형" },
  { key: "room", label: "객실 유형" },
  { key: "facility", label: "시설/서비스" },
];

const GuesthouseFilterModal = ({ visible, onClose, initialFilters, onApply }) => {
  const [sectionPositions, setSectionPositions] = useState({});
  const [activeTab, setActiveTab] = useState("price");

  const [priceRange, setPriceRange] = useState([10000, 10000000]);
  const [selectedRoomType, setSelectedRoomType] = useState([]);
  const [selectedFacilityNames, setSelectedFacilityNames] = useState([]);
  const [selectedType, setSelectedType] = useState(guesthouseTags); 
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    if (visible && initialFilters) {
      setPriceRange([initialFilters.minPrice, initialFilters.maxPrice]);
      setSelectedRoomType(initialFilters.roomType || []);
      setSelectedFacilityNames(initialFilters.facility || []);
      setSelectedType(initialFilters.tags || guesthouseTags);
      setOnlyAvailable(initialFilters.onlyAvailable || false);
      setIsDirty(false);
    }
  }, [visible, initialFilters]);

  useEffect(() => {
    const checkDirty = () => {
        const isDirtyNow = !isEqualToInitialState();
        setIsDirty(isDirtyNow);
    };
    checkDirty();
  }, [priceRange, selectedRoomType, selectedFacilityNames, selectedType, onlyAvailable]);

  // 초기화 버튼 활성화 여부
  const isEqualToInitialState = (next = {}) => {
    const selectedTypeIds = (next.selectedType ?? selectedType)
      .map(tag => tag.id)
      .sort((a, b) => a - b);
    const initialTagIds = guesthouseTags
      .map(tag => tag.id)
      .sort((a, b) => a - b);

    const selectedFacilityNamesSet = new Set(next.selectedFacilityNames ?? selectedFacilityNames);
    const initialFacilityNamesSet = new Set();

    return (
      (next.priceRange ?? priceRange)[0] === 10000 &&
      (next.priceRange ?? priceRange)[1] === 10000000 &&
      (next.selectedRoomType ?? selectedRoomType).length === 0 &&
      (next.onlyAvailable ?? onlyAvailable) === false &&
      JSON.stringify(selectedTypeIds) === JSON.stringify(initialTagIds) &&
      JSON.stringify([...selectedFacilityNamesSet]) === JSON.stringify([...initialFacilityNamesSet])
    );
  };

  // 초기화 버튼 enable/disable
  const [isDirty, setIsDirty] = useState(false);

  const scrollViewRef = useRef();
  const sectionRefs = {
    price: useRef(),
    type: useRef(),
    room: useRef(),
    facility: useRef(),
  };

  // 현재 영역 감지
  const handleScroll = (e) => {
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
  const handleTabPress = (key) => {
    const y = sectionPositions[key];
    if (y !== undefined) {
        scrollViewRef.current?.scrollTo({ y, animated: true });
    }
  };

  // 초기화
  const handleReset = () => {
    setPriceRange([10000, 10000000]);
    setSelectedRoomType([]); 
    setSelectedFacilityNames([]);
    setSelectedType(guesthouseTags);
    setOnlyAvailable(false);
    setIsDirty(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold]}>필터</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 탭 */}
          <View style={styles.tabRow}>
            {tabList.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
              >
                <Text
                  style={[
                    FONTS.fs_16_regular,
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                    activeTab === tab.key && FONTS.fs_16_semibold,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 본문 */}
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* 가격 범위 */}
            <View 
              ref={sectionRefs.price} 
              style={styles.section}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y;
                setSectionPositions(prev => ({ ...prev, price: y }));
              }}
            >
              <View style={styles.priceSectionHeader}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>가격 범위</Text>
                <Text style={[FONTS.fs_12_medium, styles.priceSubtitle]}>성인 1, 1박 기준</Text>
              </View>
              <View style={styles.priceMultislider}>
                <MultiSlider
                    values={priceRange}
                    min={10000}
                    max={10000000}
                    step={10000}
                    sliderLength={300}
                    onValuesChange={(values) => {
                        setPriceRange(values);
                        setIsDirty(true);
                    }}
                    selectedStyle={styles.sliderSelected}
                    unselectedStyle={styles.sliderUnselected}
                    markerStyle={styles.sliderMarker}
                />
              </View>
              {/* 선택된 가격 범위 출력 */}
              <View style={styles.priceRangeTextContainer}>
                <View style={styles.priceTextContainer}>
                    <Text style={[FONTS.fs_14_medium, styles.priceTitle]}>최소 금액</Text>
                    <View style={styles.priceContainer}>
                        <Text style={[FONTS.fs_14_medium, styles.priceText]}>{priceRange[0].toLocaleString()}</Text>
                    </View>
                </View>
                <View style={styles.priceTextContainer}>
                    <Text style={[FONTS.fs_14_medium, styles.priceTitle]}>최대 금액</Text>
                    <View style={styles.priceContainer}>
                        <Text style={[FONTS.fs_14_medium, styles.priceText]}>{priceRange[1].toLocaleString()}</Text>
                    </View>
                </View>
              </View>
            </View>
            
            <View  style={styles.devide}/>

            {/* 숙소유형 */}
            <View 
              ref={sectionRefs.type} 
              style={styles.section}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y;
                setSectionPositions(prev => ({ ...prev, type: y }));
              }}
            >
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>숙소 유형</Text>
                <View style={styles.tagSelectRow}>
                  {guesthouseTags.map((tag) => {
                    const isSelected = selectedType.some(t => t.id === tag.id);
                    return (
                        <TouchableOpacity
                          key={tag.id}
                          onPress={() => {
                              if (isSelected) {
                                setSelectedType(prev => prev.filter(t => t.id !== tag.id));
                              } else {
                                setSelectedType(prev => [...prev, tag]);
                              }
                              setIsDirty(true);
                          }}
                          style={styles.tagOptionContainer}
                        >
                            <Text
                                style={[
                                styles.tagOptionText,
                                FONTS.fs_14_medium,
                                isSelected && styles.tagOptionSelectedText,
                                isSelected && FONTS.fs_14_semibold,
                                ]}
                            >
                                {tag.hashtag}
                            </Text>
                        </TouchableOpacity>
                    );
                    })}
                </View>
            </View>

            <View  style={styles.devide}/>

            {/* 객실유형 */}
            <View 
              ref={sectionRefs.room} 
              style={styles.section}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y;
                setSectionPositions(prev => ({ ...prev, room: y }));
              }}
            >
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>객실 유형</Text>
              <View style={styles.roomSelectRow}>
                {roomTypes.map((room) => {
                const isSelected = selectedRoomType.includes(room);
                return (
                    <TouchableOpacity
                    key={room}
                    onPress={() => {
                        if (isSelected) {
                        setSelectedRoomType(prev => prev.filter(item => item !== room));
                        } else {
                        setSelectedRoomType(prev => [...prev, room]);
                        }
                        setIsDirty(true);
                    }}
                    style={[
                        styles.roomContainer,
                        isSelected && styles.roomSelectedContainer,
                    ]}
                    >
                    <Text
                        style={[
                        styles.roomOptionText,
                        FONTS.fs_14_medium,
                        isSelected && styles.roomOptionSelectedText,
                        ]}
                    >
                        {room}
                    </Text>
                    </TouchableOpacity>
                );
                })}
              </View>
            </View>

            <View  style={styles.devide}/>

            {/* 시설/서비스 */}
            <View 
              ref={sectionRefs.facility} 
              style={styles.section}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y;
                setSectionPositions(prev => ({ ...prev, facility: y }));
              }}
            >
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>시설/서비스</Text>
              <View style={styles.tagSelectRow}>
                {filterServices.map((facility) => {
                const isSelected = selectedFacilityNames.includes(facility.name);
                return (
                    <TouchableOpacity
                      key={facility.name}
                      onPress={() => {
                          if (isSelected) {
                            setSelectedFacilityNames(prev => prev.filter(name => name !== facility.name));
                          } else {
                            setSelectedFacilityNames(prev => [...prev, facility.name]);
                          }
                          setIsDirty(true);
                      }}
                      style={styles.tagOptionContainer}
                    >
                    <Text
                        style={[
                            styles.tagOptionText,
                            FONTS.fs_14_medium,
                            isSelected && styles.tagOptionSelectedText,
                            isSelected && FONTS.fs_14_semibold,
                        ]}
                    >
                        {facility.name}
                    </Text>
                    </TouchableOpacity>
                );
                })}
              </View>
            </View>

            <View  style={styles.devide}/>

            {/* 예약 가능 게하 보기 */}
            <View style={styles.checkBoxSection}>
                <TouchableOpacity
                    onPress={() => {
                    setOnlyAvailable(prev => !prev);
                    setIsDirty(true);
                    }}
                    style={[
                        onlyAvailable ? styles.checkedContainer : styles.uncheckedContainer,
                    ]}
                >
                    {onlyAvailable ? <Checked width={24} height={24} /> : <UnChecked width={24} height={24} />}
                </TouchableOpacity>
                <Text style={[FONTS.fs_14_medium]}>예약 가능한 게스트하우스만 볼래요.</Text>
            </View>

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
                title="게스트하우스 보기"
                onPress={() => {
                    const amenityIds = filterServices
                      .filter(f => selectedFacilityNames.includes(f.name))
                      .flatMap(f => f.id);
                    onApply({
                    tags: selectedType,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    roomType: selectedRoomType, // 아직 api로 보내지는 않음
                    facility: amenityIds,
                    onlyAvailable,
                    });
                }}
              />
            </View>
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
    justifyContent: "flex-end",
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
    flexDirection: "row",
    justifyContent: "space-around",
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
  sectionTitle: {
  },
  devide: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
  },

  // 가격
  priceSectionHeader: {
    flexDirection: "row",
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
    flexDirection: "row",
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
  priceText:{
  },

  // 태그 , 시설/서비스
  tagSelectRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    alignContent: 'center',
  },
  tagOptionContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    padding: 10,
    width: '48%',
  },
  tagOptionText: {
    color: COLORS.grayscale_400,
  },
  tagOptionSelectedText: {
    color: COLORS.primary_orange,
  },

  // 객실 유형
  roomSelectRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  roomContainer: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  roomSelectedContainer: {
    backgroundColor: COLORS.primary_orange,
  },
  roomOptionText: {
    color: COLORS.grayscale_800,
  },
  roomOptionSelectedText: {
    color: COLORS.grayscale_0,
  },

  // 하단 선택 박스
  checkBoxSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  uncheckedContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 4,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedContainer: {
    borderColor: COLORS.primary_orange,
    borderWidth: 1,
    borderRadius: 4,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  // 하단 버튼
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "white",
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
