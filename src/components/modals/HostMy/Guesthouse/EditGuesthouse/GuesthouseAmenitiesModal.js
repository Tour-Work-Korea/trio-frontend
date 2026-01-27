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
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { publicFacilities, roomFacilities, services } from '@constants/guesthouseOptions';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseAmenitiesModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,

  defaultSelected = [],
  guesthouseId,
}) => {
  // 현재 선택된 amenity id 집합
  const [selectedIds, setSelectedIds] = useState(new Set());

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  const [saving, setSaving] = useState(false);

  // 모달 열릴 때 마지막 적용 값 복원
  useEffect(() => {
    if (!visible) return;
    // shouldResetOnClose=false 이고 이전에 적용했던 값이 있으면 그걸 우선
    const base = (appliedData && appliedData.length > 0 && !shouldResetOnClose)
      ? appliedData
      : defaultSelected;

    setSelectedIds(new Set(Array.isArray(base) ? base : []));
  }, [visible, appliedData, shouldResetOnClose, defaultSelected]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 단순 닫기
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      // 닫을 때는 마지막 적용값이 있으면 복원, 없으면 비움
      const base = (appliedData && appliedData.length > 0) ? appliedData : [];
      setSelectedIds(new Set(base));
    }
    onClose();
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = async () => {
    const ids = Array.from(selectedIds);
    const payload = ids.map(id => ({ amenityId: id, count: 1 }));

    try {
      setSaving(true);

      // guesthouseId가 있을 때만 서버 업데이트
      if (guesthouseId) {
        await hostGuesthouseApi.updateGuesthouseAmenities(guesthouseId, payload);
        Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });
      }

      // 성공 시 마지막 적용값/부모 콜백 반영
      setAppliedData(ids);
      onSelect(ids);  // 부모에서 기존대로 ids 받아서 상태 갱신
      onClose();
    } catch (e) {
      Toast.show({ type: 'error', text1: '수정 중 오류가 발생했어요.', position: 'top' });
      onClose();
    } finally {
      setSaving(false);
    }
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