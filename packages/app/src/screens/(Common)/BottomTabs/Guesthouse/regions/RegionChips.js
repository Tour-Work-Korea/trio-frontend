import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {useGuesthouseRegionStore} from './store';

const SYMBOLS = {JEJU: '🌴 ', BUSAN: '🌊 '};

export default function RegionChips({value, onChange, inset = true}) {
  const regions = useGuesthouseRegionStore(state => state.regions);
  const loadRegions = useGuesthouseRegionStore(state => state.loadRegions);
  useEffect(() => {
    loadRegions();
  }, [loadRegions]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.row, inset && styles.inset]}>
      {regions.map(item => (
        <TouchableOpacity
          key={item.code}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityLabel={item.displayName}
          accessibilityState={{
            selected: value === item.code,
            checked: value === item.code,
          }}
          onPress={() => onChange(item.code)}
          style={[styles.chip, value === item.code && styles.selected]}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.text,
              value === item.code && styles.selectedText,
            ]}>
            {SYMBOLS[item.code]}
            {item.displayName}
          </Text>
          {item.code === 'BUSAN' && (
            <Text style={[FONTS.fs_10_semibold, styles.badge]}>NEW</Text>
          )}
        </TouchableOpacity>
      ))}
      {!regions.some(item => item.code === 'MOKPO') && (
        <TouchableOpacity
          disabled
          accessibilityRole="button"
          accessibilityState={{disabled: true}}
          accessibilityLabel="목포, 오픈 예정"
          style={[styles.chip, styles.disabled]}>
          <Text style={[FONTS.fs_14_medium, styles.disabledText]}>⚓ 목포</Text>
          <Text style={[FONTS.fs_10_regular, styles.comingSoon]}>
            오픈 예정
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flexGrow: 0, flexShrink: 0, marginBottom: 10},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  inset: {paddingHorizontal: 20},
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selected: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.secondary_orange,
  },
  text: {color: COLORS.grayscale_600},
  selectedText: {color: COLORS.primary_orange},
  badge: {
    fontSize: 10,
    color: COLORS.grayscale_0,
    backgroundColor: COLORS.primary_orange,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  disabled: {borderStyle: 'dashed', backgroundColor: COLORS.grayscale_100},
  disabledText: {color: COLORS.grayscale_400},
  comingSoon: {
    fontSize: 10,
    color: COLORS.grayscale_400,
    backgroundColor: COLORS.grayscale_200,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});
