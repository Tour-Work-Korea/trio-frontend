import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FONTS} from '@constants/fonts';

import AllIcon from '@assets/images/wlogo_blue_left.svg';
import XBtn from '@assets/images/x_gray.svg';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import hostEmployApi from '@utils/api/hostEmployApi';
import ButtonScarlet from '@components/ButtonScarlet';
import commonApi from '@utils/api/commonApi';

const {height} = Dimensions.get('window');

export default function EmployFilterModal({
  visible,
  onClose,
  initialFilters,
  onApply,
}) {
  const [tags, setTags] = useState();
  const [regionsData, setRegionsData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSubRegions, setSelectedSubRegions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchHashtags();
    if (visible) {
      setSelectedSubRegions(initialFilters.regions);
      setSelectedTags(initialFilters.tags);
    }
  }, [visible, initialFilters]);

  useEffect(() => {
    const checkDirty = () => {
      const isDirtyNow = !isEqualToInitialState();
      setIsDirty(isDirtyNow);
    };
    checkDirty();
  }, [selectedSubRegions, selectedTags]);

  // 초기화 버튼 활성화 여부
  const isEqualToInitialState = (next = {}) => {
    return selectedSubRegions.length === 0 && selectedTags.length === 0
      ? true
      : false;
  };

  const currentSubRegions =
    regionsData.find(r => r.name === selectedRegion)?.subRegions || [];

  // 큰 지역 전환
  const handleRegionPress = regionName => {
    setSelectedRegion(regionName);
  };
  // 작은 지역 선택
  const handleSubRegionPress = subRegion => {
    const isSelected = selectedSubRegions.some(r => r.id === subRegion.id);
    if (isSelected) {
      setSelectedSubRegions(prev => prev.filter(r => r.id !== subRegion.id));
    } else {
      setSelectedSubRegions(prev => [...prev, subRegion]);
    }
  };

  // 큰 지역
  const renderRegionItem = region => (
    <TouchableOpacity
      key={region.name}
      style={[
        styles.regionItem,
        selectedRegion === region.name && styles.regionItemSelected,
      ]}
      onPress={() => handleRegionPress(region.name)}>
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.regionText,
          selectedRegion === region.name && styles.regionTextSelected,
        ]}>
        {region.name}
      </Text>
    </TouchableOpacity>
  );

  // 세부 지역
  const renderSubRegionItem = subRegion => {
    const isSelected = selectedSubRegions.some(r => r.id === subRegion.id);
    return (
      <TouchableOpacity
        key={subRegion.id}
        style={styles.subRegionItem}
        onPress={() => handleSubRegionPress(subRegion)}>
        <View
          style={[
            styles.imagePlaceholder,
            isSelected ? styles.subRegionItemSelected : '',
          ]}>
          <AllIcon width={36} height={36} />
        </View>
        <Text
          style={[
            FONTS.fs_14_medium,
            styles.subRegionText,
            isSelected ? styles.subRegionTextSelected : '',
          ]}>
          {subRegion.displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  //해시태그 조회
  const fetchHashtags = async () => {
    try {
      const response = await hostEmployApi.getHostHashtags();
      setTags(response.data);
    } catch (error) {
      console.warn('해시태그 조회 실패:', error);
    }
  };

  //지역 조회
  const fetchLocations = async () => {
    try {
      const response = await commonApi.getLocations(); // 실제 호출하는 API 명
      const locations = response.data;

      // "JEJU_"로 시작하는 것과 나머지를 나눔
      const jejuSubRegions = locations.filter(loc =>
        loc.name.startsWith('JEJU_'),
      );
      const otherRegions = locations.filter(
        loc => !loc.name.startsWith('JEJU_'),
      );

      const formattedRegions = [
        {
          name: '제주',
          subRegions: jejuSubRegions,
        },
        {
          name: '기타',
          subRegions: otherRegions,
        },
      ];

      setRegionsData(formattedRegions);
      setSelectedRegion('제주'); // 초기 선택값
    } catch (error) {
      console.warn('지역 조회 실패:', error);
    }
  };

  // 초기화
  const handleReset = () => {
    setSelectedSubRegions([]);
    setSelectedTags([]);
    setIsDirty(false);
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>필터</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          <View>
            {/* 지역 선택 */}
            <View style={styles.regionContainer}>
              <View style={styles.leftRegionList}>
                {regionsData.map(renderRegionItem)}
              </View>
              <View style={styles.rightSubRegionGrid}>
                {currentSubRegions.map(renderSubRegionItem)}
              </View>
            </View>

            <View style={styles.devide} />

            {/* 해시태그 선택 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                키워드
              </Text>
              <View style={styles.tagSelectRow}>
                {tags?.map(tag => {
                  const isSelected = selectedTags.some(t => t.id === tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedTags(prev =>
                            prev.filter(t => t.id !== tag.id),
                          );
                        } else {
                          setSelectedTags(prev => [...prev, tag]);
                        }
                      }}
                      style={styles.tagOptionContainer}>
                      <Text
                        style={[
                          styles.tagOptionText,
                          FONTS.fs_14_medium,
                          isSelected && styles.tagOptionSelectedText,
                          isSelected && FONTS.fs_14_semibold,
                        ]}>
                        {tag.hashtag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
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
                title="채용공고 보기"
                onPress={() => {
                  onApply({
                    tags: selectedTags,
                    regions: selectedSubRegions,
                  });
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    // alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },
  // 지역 선택
  regionContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 16,
    flexDirection: 'row',
  },
  leftRegionList: {
    alignSelf: 'flex-start',
    width: 80,
    backgroundColor: COLORS.grayscale_100,
    padding: 4,
    borderRadius: 12,
  },
  regionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionItemSelected: {
    backgroundColor: COLORS.grayscale_0,
  },
  regionText: {
    color: COLORS.grayscale_900,
  },
  regionTextSelected: {
    color: COLORS.primary_blue,
    fontWeight: '600',
  },
  rightSubRegionGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    marginLeft: 20,
  },
  subRegionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRegionText: {
    marginTop: 4,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  EXimagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.grayscale_300,
    borderRadius: 12,
  },
  subRegionItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary_orange,
    borderRadius: 12,
  },
  subRegionTextSelected: {color: COLORS.primary_orange},

  //태그
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {},
  devide: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
  }, // 태그 , 시설/서비스
  tagSelectRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    alignContent: 'center',
  },
  tagOptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 2,
  },
});
