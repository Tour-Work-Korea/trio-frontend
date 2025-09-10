import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function RecruitDescriptionSection({description}) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailTitle}>상세 정보</Text>
      <View style={styles.detailContentContainer}>
        <Text style={styles.detailContent}>{description}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  detailSection: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  detailTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_800,
  },
  detailContentContainer: {
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    borderRadius: 8,
  },
  detailContent: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_700,
  },
});
