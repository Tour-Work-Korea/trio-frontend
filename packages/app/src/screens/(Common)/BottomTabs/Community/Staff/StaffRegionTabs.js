import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {useGuesthouseRegionStore} from '@screens/(Common)/BottomTabs/Guesthouse/regions/store';

const StaffRegionTabs = ({value, onChange}) => {
  const regions = useGuesthouseRegionStore(state => state.regions);
  const loadRegions = useGuesthouseRegionStore(state => state.loadRegions);

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_14_semibold, styles.label]}>지역</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.tabs}>
        {regions.map(region => {
          const selected = value === region.code;

          return (
            <TouchableOpacity
              key={region.code}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityLabel={region.displayName}
              accessibilityState={{selected, checked: selected}}
              onPress={() => onChange(region.code)}
              style={[styles.tab, selected && styles.selectedTab]}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tabText,
                  selected && styles.selectedTabText,
                ]}>
                {region.displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  label: {
    color: COLORS.grayscale_700,
    marginRight: 12,
  },
  scroll: {
    flex: 1,
  },
  tabs: {
    gap: 6,
    paddingRight: 20,
  },
  tab: {
    minWidth: 54,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  selectedTab: {
    backgroundColor: COLORS.secondary_orange,
  },
  tabText: {
    color: COLORS.grayscale_600,
  },
  selectedTabText: {
    color: COLORS.primary_orange,
  },
});

export default StaffRegionTabs;
