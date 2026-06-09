import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import loadingAnimation from '@assets/lottie/loading.json';

export default function Loading({title}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.grayscale_0,
      }}>
      <LottieView
        source={loadingAnimation}
        style={{width: 187, height: 90}}
        autoPlay
        loop
      />
      <Text style={styles.text}>{title ? title : '로딩 중...'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grayscale_0,
    flex: 1,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column',
    gap: 20,
  },
  text: {
    ...FONTS.fs_16_semibold,
    color: COLORS.primary_blue,
  },
});
