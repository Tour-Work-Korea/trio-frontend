import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Home.styles';
import {
  getHomeHorizontalScrollProps,
  shouldIgnoreHomeHorizontalPress,
} from './webScroll';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const BANNER_HEIGHT = 120;

export default function Banner({ banners = [] }) {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handlePressBanner = useCallback(async item => {
    if (shouldIgnoreHomeHorizontalPress()) {
      return;
    }

    const detailHtml = item?.detailHtml;

    if (
      detailHtml &&
      typeof detailHtml === 'string' &&
      detailHtml.trim().length > 0
    ) {
      navigation.navigate('TemporaryEventBanner', {
        bannerHtml: detailHtml,
        banner: item,
      });
      return;
    }

    if (Number(item?.id) === 22) {
      navigation.navigate('TemporaryEventBanner', { banner: item });
      return;
    }

    const url = item?.link;
    if (!url || typeof url !== 'string') {
      return;
    }
    const safeUrl = url.trim();
    if (!/^https?:\/\//i.test(safeUrl)) {
      return;
    }
    try {
      const can = await Linking.canOpenURL(safeUrl);
      if (can) {
        await Linking.openURL(safeUrl);
      }
    } catch {
      console.warn('링크 열기 실패');
    }
  }, [navigation]);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const AUTO_SLIDE_INTERVAL = 4000; // 4초마다 슬라이드

    const timer = setInterval(() => {
      const next = (currentIndex + 1) % banners.length;
      setCurrentIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length, currentIndex]);

  const handleScrollEnd = useCallback(event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / width);
    setCurrentIndex(nextIndex);
  }, []);

  if (!banners.length) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        {...getHomeHorizontalScrollProps()}
        ref={scrollRef}
        horizontal
        pagingEnabled
        directionalLockEnabled
        nestedScrollEnabled
        alwaysBounceVertical={false}
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        style={[{ width }, styles.horizontalList]}>
        {banners.map((item, index) => (
          <View
            key={item?.id ?? index}
            style={{
              width,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handlePressBanner(item)}
              style={{
                width: BANNER_WIDTH,
                height: BANNER_HEIGHT,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <Image
                source={{ uri: item.url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicatorRow}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={styles.indicatorDot(currentIndex === index)}
          />
        ))}
      </View>
    </View>
  );
}
