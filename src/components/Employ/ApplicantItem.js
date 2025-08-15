import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';

const ApplicantItem = ({
  item,
  onPress,
  handleDeletePosting = null,
  isRemovable = false,
}) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <View style={styles.postingCard}>
        <View style={{flexDirection: 'row', gap: 10, alignItems: 'flex-start'}}>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={{width: 80, height: 80, borderRadius: 4}}
          />

          <View style={styles.rightCol}>
            <View>
              <Text style={styles.guestHouseText}>{item?.guesthouseName}</Text>
              <Text style={styles.title}>{item?.recruitTitle}</Text>
            </View>
            <View style={[styles.titleRow]}>
              <Text
                style={[styles.detailText, styles.leftEllipsis]}
                numberOfLines={1}
                ellipsizeMode="tail">
                제주시 애월리 20002-7
              </Text>
              <Text style={styles.detailText}>3주 이상</Text>
            </View>
          </View>
        </View>

        <View style={[styles.titleRow, styles.fullWidth, {marginTop: 10}]}>
          <Text style={styles.detailText}>공고날짜: 2025. 05. 12</Text>
          {isRemovable ? (
            <View style={styles.iconsContainer}>
              <TouchableOpacity
                onPress={() => handleDeletePosting(item.recruitId)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.deleteButton}>마감요청</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{width: 1}} />
          )}
        </View>
      </View>
      <View style={styles.divider} />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  postingCard: {
    marginBottom: 8,
    backgroundColor: COLORS.grayscale_0,
    padding: 12,
  },
  guestHouseText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
  },
  rightCol: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
  },

  leftEllipsis: {
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
  detailText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  icon: {
    width: 24,
    height: 24,
    color: COLORS.grayscale_500,
  },
  deleteButton: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary_orange,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  addButtonLocation: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  addButtonText: {
    color: COLORS.grayscale_0,
    marginRight: 10,
  },
  divider: {
    borderWidth: 0.4,
    borderColor: COLORS.grayscale_300,
    marginVertical: 4,
  },
});

export default ApplicantItem;
