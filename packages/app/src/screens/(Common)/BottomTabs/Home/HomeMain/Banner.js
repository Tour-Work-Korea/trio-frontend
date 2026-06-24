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
import { COLORS } from '@trio/app/src/constants/colors';
import { FONTS } from '@trio/app/src/constants/fonts';

const { width } = Dimensions.get('window');
const BANNER_HORIZONTAL_PADDING = 36;
const BANNER_HEIGHT = 120;
const AUTO_SLIDE_INTERVAL = 4000;

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
  const isDraggingRef = useRef(false);
  const scrollEndTimeoutRef = useRef(null);
  const previousBannerCountRef = useRef(banners.length);
  const hasPositionedInitialPageRef = useRef(false);
  const bannerAreaWidth = Math.max(
    0,
    (layoutWidth || width) - BANNER_HORIZONTAL_PADDING,
  );
  const previousPageWidthRef = useRef(bannerAreaWidth);
  const pageWidth = bannerAreaWidth;
  const isLoopEnabled = banners.length > 1;
  const loopedBanners = isLoopEnabled
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : banners;

  const renderBannerImage = imageUrl =>
    imageUrl ? (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    ) : null;

  const scrollToPage = useCallback((pageIndex, animated = true) => {
    if (pageWidth <= 0) {
      return;
    }

    scrollRef.current?.scrollTo({
      x: pageIndex * pageWidth,
      y: 0,
      animated,
    });
  }, [pageWidth]);

  const scrollToBannerIndex = useCallback((index, animated = true) => {
    scrollToPage(isLoopEnabled ? index + 1 : index, animated);
  }, [isLoopEnabled, scrollToPage]);

  const handleMomentumScrollEnd = useCallback(event => {
    if (pageWidth <= 0) {
      return;
    }

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
      scrollEndTimeoutRef.current = null;
    }

    isDraggingRef.current = false;
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / pageWidth);

    if (!isLoopEnabled) {
      setCurrentIndex(0);
      return;
    }

    if (pageIndex <= 0) {
      const lastIndex = banners.length - 1;

      setCurrentIndex(lastIndex);
      scrollToPage(banners.length, false);
      return;
    }

    if (pageIndex >= banners.length + 1) {
      setCurrentIndex(0);
      scrollToPage(1, false);
      return;
    }

    setCurrentIndex(pageIndex - 1);
  }, [banners.length, isLoopEnabled, pageWidth, scrollToPage]);

  const handlePressBanner = useCallback(async item => {
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
    const didBannerCountChange = previousBannerCountRef.current !== banners.length;
    previousBannerCountRef.current = banners.length;

    if (!banners.length) {
      hasPositionedInitialPageRef.current = false;
      return;
    }

    if (currentIndex >= banners.length) {
      setCurrentIndex(0);
      scrollToBannerIndex(0, false);
      hasPositionedInitialPageRef.current = true;
      return;
    }

    if (didBannerCountChange || !hasPositionedInitialPageRef.current) {
      scrollToBannerIndex(currentIndex, false);
      hasPositionedInitialPageRef.current = true;
    }
  }, [banners.length, currentIndex, scrollToBannerIndex]);

  useEffect(() => () => {
    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (Math.abs(previousPageWidthRef.current - pageWidth) <= 1) {
      return;
    }

    previousPageWidthRef.current = pageWidth;
    scrollToBannerIndex(currentIndex, false);
  }, [currentIndex, pageWidth, scrollToBannerIndex]);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      if (isDraggingRef.current) {
        return;
      }

      if (isLoopEnabled && currentIndex === banners.length - 1) {
        scrollToPage(banners.length + 1);
        return;
      }

      const nextIndex = (currentIndex + 1) % banners.length;

      setCurrentIndex(nextIndex);
      scrollToBannerIndex(nextIndex);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [
    banners.length,
    currentIndex,
    isLoopEnabled,
    scrollToBannerIndex,
    scrollToPage,
  ]);

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
      <View
        style={{
          width: bannerAreaWidth,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 10,
        }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          bounces={false}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            if (scrollEndTimeoutRef.current) {
              clearTimeout(scrollEndTimeoutRef.current);
              scrollEndTimeoutRef.current = null;
            }
            isDraggingRef.current = true;
          }}
          onMomentumScrollBegin={() => {
            if (scrollEndTimeoutRef.current) {
              clearTimeout(scrollEndTimeoutRef.current);
              scrollEndTimeoutRef.current = null;
            }
          }}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={event => {
            if (scrollEndTimeoutRef.current) {
              clearTimeout(scrollEndTimeoutRef.current);
            }

            scrollEndTimeoutRef.current = setTimeout(() => {
              handleMomentumScrollEnd(event);
            }, 120);
          }}
          style={{
            width: bannerAreaWidth,
            height: BANNER_HEIGHT,
          }}>
          {loopedBanners.map((banner, index) => (
            <View
              key={`${banner?.id ?? 'home-banner'}-${index}`}
              style={{
                width: pageWidth,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => handlePressBanner(banner)}
                style={{
                  width: bannerAreaWidth,
                  height: BANNER_HEIGHT,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                {renderBannerImage(getBannerImageUrl(banner))}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: bannerAreaWidth,
            height: BANNER_HEIGHT,
          }}>
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
              {currentIndex + 1} <Text style={{color: COLORS.grayscale_400}}>/ {banners.length}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
