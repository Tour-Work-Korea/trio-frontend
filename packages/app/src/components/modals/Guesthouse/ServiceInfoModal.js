import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import useAmenityStore from '@stores/amenityStore';

import XBtn from '@assets/images/x_gray.svg';

const CATEGORY_TITLES = {
  PUBLIC: '숙소 공용시설',
  PUBLIC_FACILITY: '숙소 공용시설',
  COMMON: '숙소 공용시설',
  COMMON_FACILITY: '숙소 공용시설',
  ROOM: '객실 내 시설',
  ROOM_FACILITY: '객실 내 시설',
  PRIVATE: '객실 내 시설',
  SERVICE: '기타시설 및 서비스',
  ETC: '기타시설 및 서비스',
};

const getCategoryTitle = category => {
  if (!category) return '기타시설 및 서비스';

  return CATEGORY_TITLES[category] ?? (
    category.includes('ROOM')
      ? '객실 내 시설'
      : category.includes('SERVICE')
        ? '기타시설 및 서비스'
        : '숙소 공용시설'
  );
};

const ServiceInfoModal = ({ visible, onClose, selectedAmenities = [] }) => {
  const amenities = useAmenityStore(state => state.amenities);
  const selectedNames = selectedAmenities
    .map((amenity) => {
      if (typeof amenity === 'string') return amenity;
      return amenity?.amenityType ?? amenity?.amenityName ?? amenity?.name ?? null;
    })
    .filter(Boolean);

  const amenitySource = amenities.length > 0
    ? amenities
    : selectedAmenities.map((amenity, index) => ({
        id: typeof amenity === 'object' ? amenity?.id ?? index : index,
        name:
          typeof amenity === 'string'
            ? amenity
            : amenity?.name ?? amenity?.amenityName ?? amenity?.amenityType ?? '',
        amenityName:
          typeof amenity === 'string'
            ? amenity
            : amenity?.amenityName ?? amenity?.name ?? amenity?.amenityType ?? '',
        amenityType:
          typeof amenity === 'string'
            ? amenity
            : amenity?.amenityType ?? amenity?.amenityName ?? amenity?.name ?? '',
        category: typeof amenity === 'object' ? amenity?.category ?? 'SERVICE' : 'SERVICE',
      }));

  const groupedAmenities = amenitySource.reduce((acc, amenity) => {
    const categoryTitle = getCategoryTitle(amenity.category);

    if (!acc[categoryTitle]) {
      acc[categoryTitle] = [];
    }

    acc[categoryTitle].push(amenity);
    return acc;
  }, {});

  const renderSection = (title, items) => (
    <View key={title} style={styles.section}>
      <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>{title}</Text>
      <View style={styles.tagWrapper}>
        {items.map((item) => {
          const itemKey = String(item.id ?? item.name);
          const isSelected =
            selectedNames.includes(item.amenityType) ||
            selectedNames.includes(item.amenityName) ||
            selectedNames.includes(item.name);
          return (
            <View key={itemKey} style={styles.tag}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tagText,
                  isSelected && { color: COLORS.primary_orange },
                  isSelected && FONTS.fs_14_semibold,
                ]}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const content = (
    <View style={styles.overlay}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.backdrop}
        onPress={onClose}
      />
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={[FONTS.fs_20_semibold, styles.title]}>
            편의시설 및 서비스
          </Text>
          <TouchableOpacity
            activeOpacity={1} style={styles.XButton} onPress={onClose}>
            <XBtn width={24} height={24}/>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {Object.entries(groupedAmenities).map(([title, items]) =>
            renderSection(title, items)
          )}
        </ScrollView>
      </View>
    </View>
  );

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return <View style={styles.androidOverlayHost}>{content}</View>;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={onClose}>
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  androidOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.modal_background,
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    maxHeight: '80%',
    minHeight: '40%',
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 12,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
  },
  XButton: {
  },

  // 각 섹션
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
  },
  tagWrapper: {
    marginTop: 12,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 4,
  },
  tag: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: 10,
    width: '48%',
    marginBottom: 4,
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
});

export default ServiceInfoModal;
