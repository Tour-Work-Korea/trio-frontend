import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet} from 'react-native';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import LoadingImg1 from '@assets/images/loading_1.svg';
import LoadingImg2 from '@assets/images/loading_2.svg';
import LoadingImg3 from '@assets/images/loading_3.svg';
import LoadingImg4 from '@assets/images/loading_4.svg';
import LoadingImg5 from '@assets/images/loading_5.svg';

const loadingImages = [
  LoadingImg1,
  LoadingImg2,
  LoadingImg4,
  LoadingImg2,
  LoadingImg3,
  LoadingImg5,
  LoadingImg3,
  LoadingImg4,
  LoadingImg1,
];

export default function Loading({title}) {
  // const [imageNumber, setImageNumber] = useState(0);

  // useEffect(() => {
  //   let count = 0;
  //   let countInterval = setInterval(() => {
  //     setImageNumber(count++ % 9);
  //   }, 500);
  //   return () => clearInterval(countInterval);
  // }, []);
  // const ImageComponent = loadingImages[imageNumber];
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
      <Text style={styles.text}>{title}</Text>
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
