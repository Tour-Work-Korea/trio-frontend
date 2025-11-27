import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import styles from './Home.styles';

const {width} = Dimensions.get('window');
const BANNER_WIDTH = width * 0.9;
const BANNER_HEIGHT = 120;

export default function Banner({banners = []}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const openBannerLink = useCallback(async url => {
    if (!url || typeof url !== 'string') return;
    const safeUrl = url.trim();
    if (!/^https?:\/\//i.test(safeUrl)) return;
    try {
      const can = await Linking.canOpenURL(safeUrl);
      if (can) await Linking.openURL(safeUrl);
    } catch {
      console.warn('링크 열기 실패');
    }
  }, []);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const AUTO_SLIDE_INTERVAL = 4000; // 4초마다 슬라이드
    const SLIDE_DURATION = 1000; // 전환 애니메이션 1초

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % banners.length;

        Animated.timing(scrollX, {
          toValue: next * width,
          duration: SLIDE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();

        return next;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length, scrollX]);

  // 애니메이션된 스크롤 동기화
  useEffect(() => {
    const listener = scrollX.addListener(({value}) => {
      scrollRef.current?.scrollTo({x: value, animated: false});
    });
    return () => scrollX.removeListener(listener);
  }, [scrollX]);

  if (!banners.length) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{width}}>
        {banners.map((item, index) => (
          <View
            key={item?.id ?? index}
            style={{
              width,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => openBannerLink(item?.link)}
              style={{
                width: BANNER_WIDTH,
                height: BANNER_HEIGHT,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <Image
                source={{uri: item.url}}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        ))}
      </Animated.ScrollView>

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
