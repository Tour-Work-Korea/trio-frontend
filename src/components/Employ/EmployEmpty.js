import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import ApplyLogo from '@assets/images/wa_blue_apply.svg';
import ArrowRight from '@assets/images/arrow_right_white.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

export default function EmployEmpty({
  title,
  subTitle = null,
  buttonText = null,
  onPress = null,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <ApplyLogo width={187} />
        <View style={styles.textBox}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subTitle}</Text>
        </View>
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
          <ArrowRight width={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBox: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  textBox: {
    gap: 4,
  },
  titleText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
    textAlign: 'center',
  },
  subtitleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_500,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 10,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    alignItems: 'center',
  },
  buttonText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_0,
  },
});
