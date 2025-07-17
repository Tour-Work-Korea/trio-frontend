import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import LeftArrow from '@assets/images/chevron_left_black.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function RecruitHeaderSection({tags, guesthouseName}) {
  const navigation = useNavigation();
  return (
    <View>
      <View
        style={[styles.mainImage, {backgroundColor: COLORS.grayscale_200}]}
      />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <LeftArrow width={28} height={28} />
        </TouchableOpacity>
        <View style={styles.guesthouseButton}>
          <Text style={styles.guesthoustText}>{guesthouseName}</Text>
        </View>
        <View style={{width: 28}} />
      </View>

      <View style={styles.tagContainer}>
        {tags?.map((tag, index) => (
          <View key={tag.id || index} style={styles.tagBox}>
            <Text style={[FONTS.fs_12_medium, styles.tagText]}>
              {tag.hashtag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainImage: {
    width: '100%',
    height: 280,
  },
  headerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: COLORS.modal_background,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  guesthouseButton: {
    backgroundColor: COLORS.grayscale_900,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  guesthoustText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_0,
  },
  tagContainer: {
    position: 'absolute',
    flexDirection: 'row',
    right: 20,
    bottom: 14,
    gap: 8,
  },
  tagBox: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
});
