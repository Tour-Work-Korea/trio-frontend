import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import LeftArrow from '@assets/images/chevron_left_black.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function PostHeaderSection({tags, title, images}) {
  const navigation = useNavigation();
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // tags: "#제주시,#뚜벅이" 또는 "#제주시  #뚜벅이" → ["#제주시", "#뚜벅이"]
  const tagList = useMemo(() => {
    if (typeof tags !== 'string') return [];

    return tags
      .replace(/,/g, ' ') // 콤마를 공백으로 통일
      .split(/\s+/) // 연속 공백 포함해서 공백 기준으로 split
      .map(s => s.trim())
      .filter(Boolean); // 빈 문자열 제거
  }, [tags]);

  useEffect(() => {
    const thumb = images?.find(i => i.isThumbnail)?.imgUrl;
    setThumbnailUrl(thumb || images?.[0]?.imgUrl || '');
  }, [images]);

  return (
    <View>
      <Image
        source={{uri: thumbnailUrl}}
        style={[styles.mainImage, {backgroundColor: COLORS.grayscale_200}]}
        resizeMode="cover"
      />

      <View style={styles.tagContainer}>
        {tagList.map((tag, index) => (
          <View key={`${tag}-${index}`} style={styles.tagBox}>
            <Text style={[FONTS.fs_12_medium, styles.tagText]}>{tag}</Text>
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
    maxWidth: '70%',
    backgroundColor: COLORS.grayscale_900,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  guesthouseText: {
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
