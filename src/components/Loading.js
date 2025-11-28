import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React from 'react';
import {StyleSheet} from 'react-native';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';

export default function Loading({title}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <LottieView
        source={require('@assets/lottie/loading.json')}
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
    backgroundColor: COLORS.white,
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
