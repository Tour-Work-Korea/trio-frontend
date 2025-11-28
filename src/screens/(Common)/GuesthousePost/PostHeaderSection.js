import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function PostHeaderSection({images}) {
  const [thumbnailUrl, setThumbnailUrl] = useState('');

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
});
