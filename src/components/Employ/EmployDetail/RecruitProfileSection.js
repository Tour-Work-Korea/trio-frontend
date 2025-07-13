import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {
  employDetailDeeplink,
  copyDeeplinkToClipboard,
} from '@utils/deeplinkGenerator';

import Share from '@assets/images/share_gray.svg';
import HeartIcon from '@assets/images/heart_empty.svg';
import FilledHeartIcon from '@assets/images/heart_filled.svg';
export default function RecruitProfileSection({recruit, toggleFavorite}) {
  return (
    <>
      {/* 공고 제목 및 정보 */}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={{flex: 1}}>
            <Text style={styles.title}>{recruit?.recruitTitle}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => toggleFavorite(recruit.liked)}>
              {recruit.liked ? (
                <FilledHeartIcon width={20} height={20} />
              ) : (
                <HeartIcon width={20} height={20} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const deepLinkUrl = employDetailDeeplink(recruit.recruitId);
                copyDeeplinkToClipboard(deepLinkUrl);
                Alert.alert('복사가 완료되었습니다. 바로 공유해볼까요?');
              }}>
              <Share width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.location}>{recruit?.location}</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {recruit?.recruitShortDescription}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flexDirection: 'column',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    ...FONTS.fs_20_semibold,
    color: COLORS.black,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  location: {
    ...FONTS.fs_14_regular,
    color: COLORS.black,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
  },
  description: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_700,
  },
});
