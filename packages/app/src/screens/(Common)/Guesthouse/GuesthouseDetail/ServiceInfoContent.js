import {useTranslation} from 'react-i18next';
import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import useAmenityStore from '@stores/amenityStore';

const CATEGORY_TITLES = {
  PUBLIC: 'common.accommodationCommonFacilities',
  PUBLIC_FACILITY: 'common.accommodationCommonFacilities',
  COMMON: 'common.accommodationCommonFacilities',
  COMMON_FACILITY: 'common.accommodationCommonFacilities',
  ROOM: 'common.inRoomFacilities',
  ROOM_FACILITY: 'common.inRoomFacilities',
  PRIVATE: 'common.inRoomFacilities',
  SERVICE: 'common.otherFacilitiesAndServices',
  ETC: 'common.otherFacilitiesAndServices',
};

const getCategoryTitle = (category, t) => {
  if (!category) {
    return t('common.otherFacilitiesAndServices');
  }

  return (
    (CATEGORY_TITLES[category] ? t(CATEGORY_TITLES[category]) : null) ??
    (category.includes('ROOM')
      ? t('common.inRoomFacilities')
      : category.includes('SERVICE')
      ? t('common.otherFacilitiesAndServices')
      : t('common.accommodationCommonFacilities'))
  );
};

const normalizeAmenity = (amenity, index) => ({
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
  category:
    typeof amenity === 'object' ? amenity?.category ?? 'SERVICE' : 'SERVICE',
});

const ServiceInfoContent = ({selectedAmenities = []}) => {
  const {t} = useTranslation();
  const amenities = useAmenityStore(state => state.amenities);

  const selectedNames = useMemo(
    () =>
      selectedAmenities
        .map(amenity => {
          if (typeof amenity === 'string') {
            return amenity;
          }
          return (
            amenity?.amenityType ??
            amenity?.amenityName ??
            amenity?.name ??
            null
          );
        })
        .filter(Boolean),
    [selectedAmenities],
  );

  const groupedAmenities = useMemo(() => {
    const amenitySource =
      amenities.length > 0
        ? amenities
        : selectedAmenities.map(normalizeAmenity);

    return amenitySource.reduce((acc, amenity) => {
      const categoryTitle = getCategoryTitle(amenity.category, t);

      if (!acc[categoryTitle]) {
        acc[categoryTitle] = [];
      }

      acc[categoryTitle].push(amenity);
      return acc;
    }, {});
  }, [amenities, selectedAmenities, t]);

  const renderSection = (title, items) => (
    <View key={title} style={styles.section}>
      <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>{title}</Text>
      <View style={styles.tagWrapper}>
        {items.map(item => {
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
                  isSelected && styles.selectedTagText,
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

  return (
    <View style={styles.container}>
      {Object.entries(groupedAmenities).map(([title, items]) =>
        renderSection(title, items),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 28,
    paddingBottom: 60,
  },
  title: {
    color: COLORS.grayscale_800,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
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
  selectedTagText: {
    color: COLORS.primary_orange,
  },
});

export default ServiceInfoContent;
