import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import EditIcon from '@assets/images/edit_gray.svg';

const ApplicantSelfIntroduction = ({
  text = '',
  isEditable = false,
  onEditSelfIntro = () => {},
}) => {
  return (
    <View style={styles.sectionBox}>
      <View style={styles.titleBox}>
        <Text style={styles.titleText}>자기소개</Text>
        {isEditable ? (
          <TouchableOpacity onPress={onEditSelfIntro}>
            <EditIcon width={24} />
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
      <Text style={styles.titleLength}>
        <Text style={{color: COLORS.primary_orange}}>
          {text?.length?.toLocaleString()}
        </Text>
        /1,000
      </Text>

      <TouchableOpacity
        activeOpacity={isEditable ? 0.8 : 1}
        disabled={!isEditable}
        style={styles.introductionCard}
        onPress={onEditSelfIntro}>
        <Text style={styles.introductionText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
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
  titleLength: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
  introductionCard: {
    padding: 12,
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
    maxHeight: 450,
  },
  introductionText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
});
export default ApplicantSelfIntroduction;
