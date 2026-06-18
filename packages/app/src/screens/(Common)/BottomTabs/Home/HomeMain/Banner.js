import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
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
import { COLORS } from '@trio/app/src/constants/colors';
import { FONTS } from '@trio/app/src/constants/fonts';

const { width } = Dimensions.get('window');
const BANNER_HORIZONTAL_PADDING = 36;
const BANNER_HEIGHT = 120;

const getBannerImageUrl = item => {
  const url =
    item?.url
    ?? item?.adminImageUrl
    ?? item?.imageUrl
    ?? item?.bannerImageUrl
    ?? item?.thumbnailUrl;

  return typeof url === 'string' && url.trim().length > 0
    ? url.trim()
    : null;
};

export default function Banner({ banners = [] }) {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(width);
  const scrollRef = useRef(null);
  const pageWidth = layoutWidth || width;
  const bannerWidth = Math.max(0, pageWidth - BANNER_HORIZONTAL_PADDING);

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
      scrollRef.current?.scrollTo({ x: next * pageWidth, animated: true });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length, currentIndex, pageWidth]);

  const handleScrollEnd = useCallback(event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / pageWidth);
    setCurrentIndex(nextIndex);
  }, [pageWidth]);

  if (!banners.length) {
    return null;
  }

  return (
    <View
      style={styles.bannerContainer}
      onLayout={event => {
        const nextWidth = event?.nativeEvent?.layout?.width;

        if (nextWidth > 0 && Math.abs(nextWidth - layoutWidth) > 1) {
          setLayoutWidth(nextWidth);
        }
      }}>
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
        style={[{ width: pageWidth }, styles.horizontalList]}>
        {banners.map((item, index) => {
          const imageUrl = getBannerImageUrl(item);

          return (
          <View
            key={item?.id ?? index}
            style={{
              width: pageWidth,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handlePressBanner(item)}
              style={{
                width: bannerWidth,
                height: BANNER_HEIGHT,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : null}
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: COLORS.modal_background,
                }}>
                <Text
                  style={[{
                    color: COLORS.grayscale_0,
                  }, FONTS.fs_14_medium]}>
                  {index + 1} <Text style={{color: COLORS.grayscale_400}}>/ {banners.length}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
