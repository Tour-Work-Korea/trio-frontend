import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { publicFacilities, roomFacilities, services } from '@data/guesthouseOptions';

import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseAmenitiesModal = ({ visible, onClose, onSelect, shouldResetOnClose }) => {
  // 현재 선택된 amenity id 집합
  const [selectedIds, setSelectedIds] = useState(new Set());

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 모달 열릴 때 마지막 적용 값 복원
  useEffect(() => {
    if (visible) {
      if (appliedData && appliedData.length > 0) {
        setSelectedIds(new Set(appliedData));
      } else {
        // 아무것도 적용된 적 없으면 초기상태
        setSelectedIds(new Set());
      }
    }
  }, [visible, appliedData]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData && appliedData.length > 0) {
        // 마지막 적용값 복원
        setSelectedIds(new Set(appliedData));
      } else {
        // 처음 상태로 초기화
        setSelectedIds(new Set());
      }
    }
    onClose();
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    const ids = Array.from(selectedIds);
    // 현재 상태 저장
    setAppliedData(ids);

    onSelect(ids);
    onClose();
  };

  // 버튼 비활성화
  const isApplyDisabled = selectedIds.size === 0;

  // 어매니티
  const renderGroup = (title, items) => (
    <View style={styles.groupWrap}>
      <Text style={[FONTS.fs_16_medium, styles.groupTitle]}>{title}</Text>
      <View style={styles.grid}>
        {items.map(opt => {
          const active = selectedIds.has(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => toggleSelect(opt.id)}
              style={styles.pill}
            >
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.pillText,
                  active && styles.pillTextActive,
                  active && FONTS.fs_14_semibold,
                ]}
                numberOfLines={1}
              >
                {opt.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <TouchableWithoutFeedback onPress={handleModalClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              편의시설 및 서비스
            </Text>
            <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
          >
            {/* 편의시설 및 서비스 */}
            <View style={styles.body}>
              <Text style={[FONTS.fs_12_medium, { color: COLORS.primary_orange, marginBottom: 12 }]}>
                제공하는 편의시설과 서비스를 모두 선택해주세요
              </Text>

              <View style={styles.amenitiesContainer}>
                {renderGroup('숙소 공용시설', publicFacilities)}
                {renderGroup('객실 내 시설', roomFacilities)}
                {renderGroup('기타시설 및 서비스', services)}
              </View>
              
            </View>
          </ScrollView>

          {/* 등록하기 버튼 */}
          <ButtonScarlet
            title={'적용하기'}
            onPress={handleConfirm}
            disabled={isApplyDisabled}
            style={{ marginBottom: 16 }}
          />
          
        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default GuesthouseAmenitiesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  XBtn: {
    position: 'absolute',
    right: 0,
  },

  // 내용
  body: {
    flex: 1,
    marginBottom: 100,
  },

  // 그룹
  amenitiesContainer: {
    gap: 20,
  },
  groupWrap: {
    
  },
  groupTitle: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    gap: 4,
  },

  // 옵션 pill
  pill: {
    width: '48%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: COLORS.grayscale_400,
  },
  pillTextActive: {
    color: COLORS.primary_orange,
  },

  
});