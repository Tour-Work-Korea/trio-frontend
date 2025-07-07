import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import React, {useEffect, useState} from 'react';
import {Image, LogBox, StyleSheet} from 'react-native';
import {Text} from 'react-native-gesture-handler';
import {View} from 'react-native-reanimated/lib/typescript/Animated';
import {SafeAreaView} from 'react-native-safe-area-context';

const loadingImages = [
  require('@assets/images/loading_1.svg'),
  require('@assets/images/loading_2.svg'),
  require('@assets/images/loading_4.svg'),
  require('@assets/images/loading_2.svg'),
  require('@assets/images/loading_3.svg'),
  require('@assets/images/loading_5.svg'),
  require('@assets/images/loading_3.svg'),
  require('@assets/images/loading_4.svg'),
  require('@assets/images/loading_1.svg'),
];

export default function Loading({title}) {
  const [imageNumber, setImageNumber] = useState(0);

  useEffect(() => {
    let count = 0;
    let countInterval = setInterval(() => {
      setImageNumber(count++ % 9);
    }, 1000 / 20);
    return () => clearInterval(countInterval);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingBox}>
        <Image
          source={loadingImages[imageNumber]}
          key={imageNumber}
          width={108}
        />
        <Text style={styles.text}>{title}</Text>
      </View>
    </SafeAreaView>
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
