import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import HeartIcon from '@assets/images/heart_empty.svg';
import FilledHeartIcon from '@assets/images/heart_filled.svg';

export default function PostProfileSection({
  title,
  tags,
  guesthouseName,
  guesthouseImgUrl,
  toggleFavorite,
  isLiked,
}) {
  const navigation = useNavigation();
  const tagList = useMemo(() => {
    if (typeof tags !== 'string') return [];

    return tags
      .replace(/,/g, ' ') // 콤마를 공백으로 통일
      .split(/\s+/) // 연속 공백 포함해서 공백 기준으로 split
      .map(s => s.trim())
      .filter(Boolean); // 빈 문자열 제거
  }, [tags]);
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
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 12,
        }}
        onPress={() => navigation.navigate('HostProfilePage')}
      >
        <Image
          source={{uri: guesthouseImgUrl}}
          width={30}
          height={30}
          style={styles.profileImg}
          resizeMode="cover"
        />
        <View>
          <Text style={{...FONTS.fs_14_semibold}}>{guesthouseName}</Text>
          <View style={{flexDirection: 'row', gap: 4}}>
            {tagList.map((el, id) => (
              <Text
                key={id}
                style={{...FONTS.fs_12_medium, color: COLORS.grayscale_400}}>
                {el}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
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
