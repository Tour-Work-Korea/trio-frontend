import React from 'react';
import {StyleSheet, View} from 'react-native';

import ApplyLogo from '@assets/images/wa_blue_apply.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import AdaptiveText from '@components/AdaptiveText';

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
          <AdaptiveText variant="title" style={styles.titleText}>
            {title}
          </AdaptiveText>
          <AdaptiveText variant="body" style={styles.subtitleText}>
            {subTitle}
          </AdaptiveText>
        </View>
        {/* <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
          <ArrowRight width={24} />
        </TouchableOpacity> */}
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
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
    textAlign: 'center',
  },
  subtitleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_500,
    textAlign: 'center',
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
