import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

import HeartIcon from '@assets/images/heart_empty.svg';
import FilledHeartIcon from '@assets/images/heart_filled.svg';

export default function PostProfileSection({
  title,
  guesthouseName,
  guesthouseImgUrl,
  toggleFavorite,
  isLiked,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => toggleFavorite(isLiked)}>
            {isLiked ? (
              <FilledHeartIcon width={20} height={20} />
            ) : (
              <HeartIcon width={20} height={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 12,
        }}>
        <Image
          source={{uri: guesthouseImgUrl}}
          width={30}
          height={30}
          style={styles.profileImg}
          resizeMode="cover"
        />
        <Text style={{...FONTS.fs_14_semibold}}>{guesthouseName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    flexDirection: 'column',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 6,
  },
  title: {
    ...FONTS.fs_18_semibold,
    color: COLORS.black,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
  },
  likeCount: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_700,
  },
});
