import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import EditIcon from '@assets/images/edit_gray.svg';

const ApplicantTag = ({tags, isEditable = false, onEditTags = () => {}}) => {
  const {t} = useTranslation();
  return (
    <View>
      <View style={styles.sectionBox}>
        <View style={styles.titleBox}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{t('common.tag')}</Text>
            <Text style={styles.subTitleText}>
              {t('employ.threeKeywordsThatDescribeMe')}
            </Text>
          </View>
          {isEditable ? (
            <TouchableOpacity
              onPress={() => {
                onEditTags();
              }}>
              <EditIcon width={24} />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        <View style={styles.tagContainer}>
          {tags?.map((item, idx) => (
            <Text key={idx} style={styles.tag}>
              {item.hashtag}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 20,
  },
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  subTitleText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
  },
});
export default ApplicantTag;
