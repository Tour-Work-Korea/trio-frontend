import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ComingSoonImg from '@assets/images/coming_soon.svg';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

const Meet = () => {
  return (
    <View style={styles.container}>
      <ComingSoonImg />
      <Text style={[FONTS.fs_18_bold, styles.headerText]}>모임 서비스는 ver.2 런칭 예정 ⚙️</Text>
      <Text style={[FONTS.fs_18_regular, styles.text]}>
        지금은 수리 중이에요{'\n'}
        조금만 기다려주세요!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  headerText: {
    marginVertical: 12,
    color: COLORS.grayscale_500,
  },
  text: {
    color: COLORS.grayscale_500,
    lineHeight: 24,
  },
});

export default Meet;
