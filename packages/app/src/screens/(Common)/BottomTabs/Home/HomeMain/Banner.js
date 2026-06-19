import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  Linking,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Home.styles';
import { COLORS } from '@trio/app/src/constants/colors';
import { FONTS } from '@trio/app/src/constants/fonts';

const { width } = Dimensions.get('window');
const BANNER_HORIZONTAL_PADDING = 36;
const BANNER_HEIGHT = 120;
const AUTO_SLIDE_INTERVAL = 4000;
const SLIDE_DURATION = 350;
const SWIPE_TRIGGER_DISTANCE = 40;
const SWIPE_TRIGGER_VELOCITY = 0.35;
const PRESS_SUPPRESS_DELAY = 250;

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
  const [nextIndex, setNextIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next');
  const [layoutWidth, setLayoutWidth] = useState(width);
  const slideX = useRef(new Animated.Value(0)).current;
  const isAnimatingRef = useRef(false);
  const isSwipingRef = useRef(false);
  const didSwipeRef = useRef(false);
  const pageWidth = layoutWidth || width;
  const bannerWidth = Math.max(0, pageWidth - BANNER_HORIZONTAL_PADDING);
  const activeBanner = banners[currentIndex] ?? banners[0];
  const nextBanner = nextIndex === null ? null : banners[nextIndex];
  const activeImageUrl = getBannerImageUrl(activeBanner);
  const nextImageUrl = getBannerImageUrl(nextBanner);

  const renderBannerImage = imageUrl =>
    imageUrl ? (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    ) : null;

  const clearSwipePressSuppress = useCallback(() => {
    setTimeout(() => {
      didSwipeRef.current = false;
    }, PRESS_SUPPRESS_DELAY);
  }, []);

  const getIncomingIndex = useCallback((index, direction) => {
    if (direction === 'prev') {
      return (index - 1 + banners.length) % banners.length;
    }

    return (index + 1) % banners.length;
  }, [banners.length]);

  const finishSlide = useCallback((incomingIndex, direction, duration = SLIDE_DURATION) => {
    if (banners.length <= 1 || isAnimatingRef.current || bannerWidth <= 0) {
      return;
    }

    isAnimatingRef.current = true;
    setSlideDirection(direction);
    setNextIndex(incomingIndex);

    Animated.timing(slideX, {
      toValue: direction === 'next' ? -bannerWidth : bannerWidth,
      duration,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        setCurrentIndex(incomingIndex);
      }

      setNextIndex(null);
      slideX.setValue(0);
      isAnimatingRef.current = false;
      isSwipingRef.current = false;
      clearSwipePressSuppress();
    });
  }, [bannerWidth, banners.length, clearSwipePressSuppress, slideX]);

  const resetSlide = useCallback(() => {
    Animated.spring(slideX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 18,
    }).start(() => {
      setNextIndex(null);
      isSwipingRef.current = false;
      clearSwipePressSuppress();
    });
  }, [clearSwipePressSuppress, slideX]);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > 8
          && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

        return banners.length > 1 && isHorizontalSwipe;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > 8
          && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

        return banners.length > 1 && isHorizontalSwipe;
      },
      onPanResponderGrant: () => {
        if (isAnimatingRef.current) {
          return;
        }

        isSwipingRef.current = true;
        didSwipeRef.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (isAnimatingRef.current || banners.length <= 1 || bannerWidth <= 0) {
          return;
        }

        const direction = gestureState.dx < 0 ? 'next' : 'prev';
        const incomingIndex = getIncomingIndex(currentIndex, direction);
        const clampedDx = Math.max(-bannerWidth, Math.min(bannerWidth, gestureState.dx));

        setSlideDirection(direction);
        setNextIndex(incomingIndex);
        slideX.setValue(clampedDx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimatingRef.current || banners.length <= 1) {
          return;
        }

        const direction = gestureState.dx < 0 ? 'next' : 'prev';
        const shouldChange =
          Math.abs(gestureState.dx) > SWIPE_TRIGGER_DISTANCE
          || Math.abs(gestureState.vx) > SWIPE_TRIGGER_VELOCITY;

        if (!shouldChange) {
          resetSlide();
          return;
        }

        finishSlide(getIncomingIndex(currentIndex, direction), direction, 220);
      },
      onPanResponderTerminate: resetSlide,
    }),
  [
    bannerWidth,
    banners.length,
    currentIndex,
    finishSlide,
    getIncomingIndex,
    resetSlide,
    slideX,
  ]);

  const handlePressBanner = useCallback(async item => {
    if (didSwipeRef.current || isSwipingRef.current) {
      didSwipeRef.current = false;
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
    if (currentIndex >= banners.length) {
      setCurrentIndex(0);
      setNextIndex(null);
      slideX.setValue(0);
      isAnimatingRef.current = false;
    }
  }, [banners.length, currentIndex, slideX]);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      if (isAnimatingRef.current) {
        return;
      }

      finishSlide(getIncomingIndex(currentIndex, 'next'), 'next');
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length, currentIndex, finishSlide, getIncomingIndex]);

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
          width: pageWidth,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          {...panResponder.panHandlers}
          style={{
            width: bannerWidth,
            height: BANNER_HEIGHT,
            borderRadius: 10,
            overflow: 'hidden',
          }}>
          <Animated.View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: [
                {
                  translateX: slideX,
                },
              ],
            }}>
            {renderBannerImage(activeImageUrl)}
          </Animated.View>
          {nextIndex !== null && (
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: [
                  {
                    translateX: Animated.add(
                      slideX,
                      slideDirection === 'next' ? bannerWidth : -bannerWidth,
                    ),
                  },
                ],
              }}>
              {renderBannerImage(nextImageUrl)}
            </Animated.View>
          )}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handlePressBanner(activeBanner)}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          />
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
              {(nextIndex ?? currentIndex) + 1} <Text style={{color: COLORS.grayscale_400}}>/ {banners.length}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
