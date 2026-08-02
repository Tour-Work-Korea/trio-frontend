import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import XIcon from '@assets/images/x_gray.svg';
import AppImage, {prefetchImageUrls} from '@components/AppImage';

const {width: FALLBACK_SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_CLOSE_DISTANCE = Platform.select({
  ios: 96,
  android: 112,
  default: 88,
});
const SWIPE_CLOSE_VELOCITY = Platform.select({
  ios: -0.72,
  android: -0.82,
  default: -0.68,
});
const SWIPE_INTENT_DISTANCE = 8;
const SWIPE_VERTICAL_RATIO = 1.15;
const SWIPE_CLOSE_MIN_DURATION = 520;
const SWIPE_CLOSE_MAX_DURATION = 720;

const getImageUrl = image =>
  image?.imageUrl ??
  image?.guesthouseImageUrl ??
  image?.roomImageUrl ??
  image?.partyImageUrl ??
  image?.url ??
  image?.adminImageUrl ??
  image?.thumbnailUrl ??
  image;

const ImageModal = ({
  visible,
  images = [],
  selectedImageIndex = 0,
  onClose,
  onImageIndexChange,
  enableSwipeToClose = true,
  sourceRect,
  sourceBorderRadius = 0,
  fallbackDismissMode = 'slide',
}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const pageWidth = screenWidth || FALLBACK_SCREEN_WIDTH;
  const pageHeight = screenHeight;
  const listRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const isClosingRef = useRef(false);
  const touchStartRef = useRef(null);
  const swipeY = useRef(new Animated.Value(0)).current;
  const swipeChrome = useRef(new Animated.Value(0)).current;
  const returnProgress = useRef(new Animated.Value(0)).current;
  const closeFade = useRef(new Animated.Value(1)).current;
  const swipePositionRef = useRef(0);
  const returnProgressRef = useRef(0);
  const imageAspectRatiosRef = useRef(new Map());
  const imageList = useMemo(
    () => (Array.isArray(images) ? images : []),
    [images],
  );
  const imageUrlsKey = imageList.map(getImageUrl).join('\u0001');
  const safeSelectedImageIndex = Number.isFinite(selectedImageIndex)
    ? selectedImageIndex
    : 0;
  const requestedInitialIndex =
    imageList.length > 0
      ? Math.min(Math.max(safeSelectedImageIndex, 0), imageList.length - 1)
      : 0;
  const openingIndexRef = useRef(requestedInitialIndex);
  const wasVisibleRef = useRef(false);

  if (visible && !wasVisibleRef.current) {
    openingIndexRef.current = requestedInitialIndex;
  }
  wasVisibleRef.current = visible;

  const initialIndex = visible
    ? Math.min(openingIndexRef.current, Math.max(imageList.length - 1, 0))
    : requestedInitialIndex;
  const initialImageUrl = getImageUrl(imageList[initialIndex]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPresented, setIsPresented] = useState(visible);
  const [activeImageAspectRatio, setActiveImageAspectRatio] = useState(null);
  const swipeToCloseEnabled = enableSwipeToClose && Platform.OS !== 'web';
  const activeSourceIndex =
    Platform.OS === 'android' && imageList.length > 0
      ? (initialIndex + currentIndex) % imageList.length
      : currentIndex;
  const sourceRectMatchesActiveImage =
    !Number.isFinite(sourceRect?.imageIndex) ||
    sourceRect.imageIndex === activeSourceIndex;
  const visibleSourceWidth = Math.max(
    0,
    Math.min(sourceRect?.x + sourceRect?.width, pageWidth) -
      Math.max(sourceRect?.x, 0),
  );
  const visibleSourceHeight = Math.max(
    0,
    Math.min(sourceRect?.y + sourceRect?.height, pageHeight) -
      Math.max(sourceRect?.y, 0),
  );
  const sourceRectIsVisible =
    visibleSourceWidth >= sourceRect?.width * 0.6 &&
    visibleSourceHeight >= sourceRect?.height * 0.6;
  const hasSourceRect =
    sourceRectMatchesActiveImage &&
    sourceRectIsVisible &&
    Number.isFinite(sourceRect?.x) &&
    Number.isFinite(sourceRect?.y) &&
    sourceRect?.width > 0 &&
    sourceRect?.height > 0;
  const finishClose = useCallback(() => {
    if (!isClosingRef.current) {
      return;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    isClosingRef.current = false;
    setIsPresented(false);
    onClose?.();
  }, [onClose]);
  const resetSwipeAnimation = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    Animated.parallel([
      Animated.spring(swipeY, {
        toValue: 0,
        useNativeDriver: false,
        isInteraction: false,
        stiffness: Platform.OS === 'android' ? 280 : 240,
        damping: Platform.OS === 'android' ? 30 : 26,
        mass: 0.85,
      }),
      Animated.spring(swipeChrome, {
        toValue: 0,
        useNativeDriver: false,
        isInteraction: false,
        stiffness: Platform.OS === 'android' ? 280 : 240,
        damping: Platform.OS === 'android' ? 30 : 26,
        mass: 0.85,
      }),
      Animated.spring(returnProgress, {
        toValue: 0,
        useNativeDriver: false,
        isInteraction: false,
        stiffness: 240,
        damping: 26,
        mass: 0.85,
      }),
      Animated.timing(closeFade, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
        isInteraction: false,
      }),
    ]).start(({finished}) => {
      if (finished) {
        swipePositionRef.current = 0;
        returnProgressRef.current = 0;
      }
    });
  }, [closeFade, returnProgress, swipeChrome, swipeY]);
  const animateClose = useCallback(
    (velocity = 0) => {
      if (isClosingRef.current) {
        return;
      }

      isClosingRef.current = true;
      const closeTarget = -Math.max(screenHeight, 600) * 1.08;
      const remainingDistance = Math.abs(
        closeTarget - swipePositionRef.current,
      );
      const velocityBoost = Math.min(Math.abs(velocity) * 24, 36);
      const slideDuration = Math.max(
        SWIPE_CLOSE_MIN_DURATION,
        Math.min(
          SWIPE_CLOSE_MAX_DURATION,
          460 + remainingDistance * 0.16 - velocityBoost,
        ),
      );
      const returnDuration = Math.max(
        300,
        Math.min(
          520,
          260 + (1 - returnProgressRef.current) * 260 - velocityBoost,
        ),
      );
      const shouldFadeClose = !hasSourceRect && fallbackDismissMode === 'fade';
      const duration = shouldFadeClose
        ? 380
        : hasSourceRect
        ? returnDuration
        : slideDuration;

      closeTimeoutRef.current = setTimeout(finishClose, duration + 120);
      if (hasSourceRect) {
        Animated.parallel([
          Animated.timing(swipeY, {
            toValue: 0,
            duration,
            easing: Easing.bezier(0.2, 0.68, 0.28, 1),
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(swipeChrome, {
            toValue: 120,
            duration,
            easing: Easing.bezier(0.2, 0.68, 0.28, 1),
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(returnProgress, {
            toValue: 1,
            duration,
            easing: Easing.bezier(0.2, 0.68, 0.28, 1),
            useNativeDriver: false,
            isInteraction: false,
          }),
        ]).start(({finished}) => {
          if (finished) {
            finishClose();
          }
        });
        return;
      }

      if (shouldFadeClose) {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(swipeY, {
              toValue: Math.min(swipePositionRef.current, -24),
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
              isInteraction: false,
            }),
            Animated.timing(returnProgress, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
              isInteraction: false,
            }),
          ]),
          Animated.timing(closeFade, {
            toValue: 0,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
            isInteraction: false,
          }),
        ]).start(({finished}) => {
          if (finished) {
            finishClose();
          }
        });
        return;
      }

      Animated.parallel([
        Animated.timing(swipeY, {
          toValue: closeTarget,
          duration,
          easing: Easing.bezier(0.22, 0.45, 0.25, 1),
          useNativeDriver: false,
          isInteraction: false,
        }),
        Animated.timing(swipeChrome, {
          toValue: Math.abs(closeTarget),
          duration,
          easing: Easing.bezier(0.22, 0.45, 0.25, 1),
          useNativeDriver: false,
          isInteraction: false,
        }),
      ]).start(({finished}) => {
        if (finished) {
          finishClose();
        }
      });
    },
    [
      finishClose,
      fallbackDismissMode,
      hasSourceRect,
      closeFade,
      returnProgress,
      screenHeight,
      swipeChrome,
      swipeY,
    ],
  );
  const updateSwipeAnimation = useCallback(
    dy => {
      const nextPosition = Math.min(dy, 0);
      swipePositionRef.current = nextPosition;
      swipeY.setValue(nextPosition);
      swipeChrome.setValue(Math.abs(nextPosition));
      if (hasSourceRect) {
        const nextProgress = Math.min(
          Math.abs(nextPosition) / Math.max(screenHeight * 0.55, 320),
          0.72,
        );
        returnProgressRef.current = nextProgress;
        returnProgress.setValue(nextProgress);
      }
    },
    [hasSourceRect, returnProgress, screenHeight, swipeChrome, swipeY],
  );
  const closeIfSwipeUp = useCallback(
    ({dx = 0, dy = 0, vy = 0}) => {
      const isMostlyVertical =
        Math.abs(dy) > Math.abs(dx) * SWIPE_VERTICAL_RATIO;

      if (dy <= -SWIPE_CLOSE_DISTANCE && isMostlyVertical) {
        animateClose(vy);
        return true;
      }

      if (vy <= SWIPE_CLOSE_VELOCITY && isMostlyVertical) {
        animateClose(vy);
        return true;
      }

      resetSwipeAnimation();
      return false;
    },
    [animateClose, resetSwipeAnimation],
  );
  const dragImageOpacity = swipeY.interpolate({
    inputRange: [-Math.max(screenHeight * 0.78, 480), -160, 0],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });
  const imageViewportWidth =
    Platform.OS === 'web'
      ? Math.max(Math.min(pageWidth - 48, 1200), 1)
      : Math.max(pageWidth - 24, 1);
  const imageViewportHeight =
    Platform.OS === 'web'
      ? Math.max(pageHeight - 104, 1)
      : Math.max(pageHeight - 122, 1);
  const displayAspectRatio = activeImageAspectRatio;
  const imageDisplayWidth = displayAspectRatio
    ? Math.min(imageViewportWidth, imageViewportHeight * displayAspectRatio)
    : imageViewportWidth;
  const imageDisplayHeight = displayAspectRatio
    ? Math.min(imageViewportHeight, imageViewportWidth / displayAspectRatio)
    : imageViewportHeight;
  const imageViewportCenterY = 88 + imageViewportHeight / 2;
  const returnTranslateX = returnProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      hasSourceRect ? sourceRect.x + sourceRect.width / 2 - pageWidth / 2 : 0,
    ],
  });
  const returnTranslateY = returnProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      hasSourceRect
        ? sourceRect.y + sourceRect.height / 2 - imageViewportCenterY
        : 0,
    ],
  });
  const returnWidth = returnProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      imageDisplayWidth,
      hasSourceRect ? sourceRect.width : imageDisplayWidth,
    ],
  });
  const returnHeight = returnProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      imageDisplayHeight,
      hasSourceRect ? sourceRect.height : imageDisplayHeight,
    ],
  });
  const animatedImageStyle = {
    width: returnWidth,
    height: returnHeight,
    opacity: hasSourceRect
      ? 1
      : Animated.multiply(
          dragImageOpacity,
          fallbackDismissMode === 'fade'
            ? returnProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              })
            : closeFade,
        ),
    borderRadius: hasSourceRect
      ? returnProgress.interpolate({
          inputRange: [0, 0.08, 0.45, 0.82, 1],
          outputRange: [0, 10, 24, 14, sourceBorderRadius],
          extrapolate: 'clamp',
        })
      : swipeChrome.interpolate({
          inputRange: [0, 120],
          outputRange: [0, 28],
          extrapolate: 'clamp',
        }),
    transform: [
      {translateX: returnTranslateX},
      {
        translateY: hasSourceRect
          ? returnTranslateY
          : Animated.add(swipeY, returnTranslateY),
      },
      {
        scale: hasSourceRect
          ? 1
          : swipeY.interpolate({
              inputRange: [-160, 0],
              outputRange: [0.94, 1],
              extrapolate: 'clamp',
            }),
      },
    ],
  };
  const dragBackdropOpacity = swipeY.interpolate({
    inputRange: [-180, 0],
    outputRange: [0.35, 1],
    extrapolate: 'clamp',
  });
  const returnBackdropOpacity = returnProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, hasSourceRect ? 0 : 1],
    extrapolate: 'clamp',
  });
  const animatedBackdropStyle = {
    opacity: hasSourceRect
      ? Animated.multiply(returnBackdropOpacity, closeFade)
      : fallbackDismissMode === 'fade'
      ? closeFade
      : Animated.multiply(dragBackdropOpacity, closeFade),
  };
  const animatedHeaderStyle = {
    opacity: hasSourceRect ? returnBackdropOpacity : closeFade,
  };
  const getTouchPoint = event =>
    event.nativeEvent?.changedTouches?.[0] ??
    event.nativeEvent?.touches?.[0] ??
    event.nativeEvent;
  const handleTouchStart = useCallback(
    event => {
      const touch = getTouchPoint(event);

      swipeY.stopAnimation();
      swipeChrome.stopAnimation();
      returnProgress.stopAnimation();
      closeFade.stopAnimation();
      swipePositionRef.current = 0;
      returnProgressRef.current = 0;
      swipeY.setValue(0);
      swipeChrome.setValue(0);
      returnProgress.setValue(0);
      closeFade.setValue(1);
      touchStartRef.current = {
        x: touch?.pageX ?? touch?.clientX ?? 0,
        y: touch?.pageY ?? touch?.clientY ?? 0,
        lastX: touch?.pageX ?? touch?.clientX ?? 0,
        lastY: touch?.pageY ?? touch?.clientY ?? 0,
        timestamp: Date.now(),
      };
    },
    [closeFade, returnProgress, swipeChrome, swipeY],
  );
  const handleTouchMove = useCallback(
    event => {
      const start = touchStartRef.current;
      const touch = getTouchPoint(event);

      if (!start || isClosingRef.current) {
        return;
      }

      const dx = (touch?.pageX ?? touch?.clientX ?? start.x) - start.x;
      const dy = (touch?.pageY ?? touch?.clientY ?? start.y) - start.y;
      start.lastX = touch?.pageX ?? touch?.clientX ?? start.lastX;
      start.lastY = touch?.pageY ?? touch?.clientY ?? start.lastY;

      if (
        dy < -SWIPE_INTENT_DISTANCE &&
        Math.abs(dy) > Math.abs(dx) * SWIPE_VERTICAL_RATIO
      ) {
        updateSwipeAnimation(dy);
      }
    },
    [updateSwipeAnimation],
  );
  const handleTouchEnd = useCallback(
    event => {
      const start = touchStartRef.current;
      const touch = getTouchPoint(event);
      touchStartRef.current = null;

      if (!start || isClosingRef.current) {
        return;
      }

      const endX = touch?.pageX ?? touch?.clientX ?? start.lastX;
      const endY = touch?.pageY ?? touch?.clientY ?? start.lastY;
      const dx = endX - start.x;
      const dy = endY - start.y;
      const elapsedSeconds = Math.max(
        (Date.now() - start.timestamp) / 1000,
        0.05,
      );

      closeIfSwipeUp({dx, dy, vy: dy / elapsedSeconds / 1000});
    },
    [closeIfSwipeUp],
  );
  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    resetSwipeAnimation();
  }, [resetSwipeAnimation]);
  const shouldCaptureSwipe = useCallback(event => {
    const start = touchStartRef.current;
    const touch = getTouchPoint(event);

    if (!start || isClosingRef.current) {
      return false;
    }

    const dx = (touch?.pageX ?? touch?.clientX ?? start.x) - start.x;
    const dy = (touch?.pageY ?? touch?.clientY ?? start.y) - start.y;

    return (
      dy < -SWIPE_INTENT_DISTANCE &&
      Math.abs(dy) > Math.abs(dx) * SWIPE_VERTICAL_RATIO
    );
  }, []);
  const touchHandlers = swipeToCloseEnabled
    ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
      }
    : {};
  const handleAndroidTouchEnd = useCallback(
    event => {
      const start = touchStartRef.current;
      const touch = getTouchPoint(event);

      if (start && !isClosingRef.current) {
        const endX = touch?.pageX ?? touch?.clientX ?? start.lastX;
        const endY = touch?.pageY ?? touch?.clientY ?? start.lastY;
        const dx = endX - start.x;
        const dy = endY - start.y;
        const isHorizontalSwipe =
          Math.abs(dx) >= 48 &&
          Math.abs(dx) > Math.abs(dy) * SWIPE_VERTICAL_RATIO;

        if (isHorizontalSwipe && imageList.length > 1) {
          touchStartRef.current = null;
          const nextIndex = Math.max(
            0,
            Math.min(currentIndex + (dx < 0 ? 1 : -1), imageList.length - 1),
          );
          const sourceIndex = (initialIndex + nextIndex) % imageList.length;
          setActiveImageAspectRatio(
            imageAspectRatiosRef.current.get(
              getImageUrl(imageList[sourceIndex]),
            ) ?? null,
          );
          setCurrentIndex(nextIndex);
          onImageIndexChange?.(sourceIndex);
          resetSwipeAnimation();
          return;
        }
      }

      handleTouchEnd(event);
    },
    [
      currentIndex,
      handleTouchEnd,
      imageList,
      initialIndex,
      onImageIndexChange,
      resetSwipeAnimation,
    ],
  );
  const androidTouchHandlers = swipeToCloseEnabled
    ? {
        ...touchHandlers,
        onTouchEnd: handleAndroidTouchEnd,
        onMoveShouldSetResponderCapture: shouldCaptureSwipe,
        onResponderMove: handleTouchMove,
        onResponderRelease: handleAndroidTouchEnd,
        onResponderTerminate: handleTouchCancel,
        onResponderTerminationRequest: () => false,
      }
    : {};
  const shouldCaptureIosHorizontalSwipe = useCallback(event => {
    const start = touchStartRef.current;
    const touch = getTouchPoint(event);

    if (!start || isClosingRef.current) {
      return false;
    }

    const dx = (touch?.pageX ?? touch?.clientX ?? start.x) - start.x;
    const dy = (touch?.pageY ?? touch?.clientY ?? start.y) - start.y;

    return (
      Math.abs(dx) >= SWIPE_INTENT_DISTANCE &&
      Math.abs(dx) > Math.abs(dy) * SWIPE_VERTICAL_RATIO
    );
  }, []);
  const handleIosTouchEnd = useCallback(
    event => {
      const start = touchStartRef.current;
      const touch = getTouchPoint(event);

      if (start && !isClosingRef.current) {
        const endX = touch?.pageX ?? touch?.clientX ?? start.lastX;
        const endY = touch?.pageY ?? touch?.clientY ?? start.lastY;
        const dx = endX - start.x;
        const dy = endY - start.y;
        const isHorizontalSwipe =
          Math.abs(dx) >= 48 &&
          Math.abs(dx) > Math.abs(dy) * SWIPE_VERTICAL_RATIO;

        if (isHorizontalSwipe && imageList.length > 1) {
          touchStartRef.current = null;
          const nextIndex = Math.max(
            0,
            Math.min(currentIndex + (dx < 0 ? 1 : -1), imageList.length - 1),
          );
          setActiveImageAspectRatio(
            imageAspectRatiosRef.current.get(
              getImageUrl(imageList[nextIndex]),
            ) ?? null,
          );
          setCurrentIndex(nextIndex);
          onImageIndexChange?.(nextIndex);
          resetSwipeAnimation();
          requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({index: nextIndex, animated: true});
          });
          return;
        }
      }

      handleTouchEnd(event);
    },
    [
      currentIndex,
      handleTouchEnd,
      imageList,
      onImageIndexChange,
      resetSwipeAnimation,
    ],
  );
  const nativeListTouchHandlers =
    Platform.OS === 'ios' && swipeToCloseEnabled
      ? {
          ...touchHandlers,
          onTouchEnd: handleIosTouchEnd,
          onMoveShouldSetResponderCapture: shouldCaptureIosHorizontalSwipe,
          onResponderRelease: handleIosTouchEnd,
          onResponderTerminate: handleTouchCancel,
          onResponderTerminationRequest: () => false,
        }
      : touchHandlers;
  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);
  const handleRequestClose = useCallback(() => {
    clearCloseTimeout();
    isClosingRef.current = false;
    swipeY.stopAnimation();
    swipeChrome.stopAnimation();
    returnProgress.stopAnimation();
    closeFade.stopAnimation();
    swipePositionRef.current = 0;
    returnProgressRef.current = 0;
    swipeY.setValue(0);
    swipeChrome.setValue(0);
    returnProgress.setValue(0);
    closeFade.setValue(1);
    setIsPresented(false);
    onClose?.();
  }, [
    clearCloseTimeout,
    closeFade,
    onClose,
    returnProgress,
    swipeChrome,
    swipeY,
  ]);

  useEffect(() => {
    if (visible) {
      clearCloseTimeout();
      isClosingRef.current = false;
      swipeY.stopAnimation();
      swipeChrome.stopAnimation();
      returnProgress.stopAnimation();
      closeFade.stopAnimation();
      swipePositionRef.current = 0;
      returnProgressRef.current = 0;
      swipeY.setValue(0);
      swipeChrome.setValue(0);
      returnProgress.setValue(0);
      closeFade.setValue(1);
      setCurrentIndex(Platform.OS === 'android' ? 0 : initialIndex);
      setActiveImageAspectRatio(
        imageAspectRatiosRef.current.get(initialImageUrl) ?? null,
      );
      setIsPresented(true);
      return;
    }

    if (!isClosingRef.current) {
      clearCloseTimeout();
      swipeY.stopAnimation();
      swipeChrome.stopAnimation();
      returnProgress.stopAnimation();
      closeFade.stopAnimation();
      swipePositionRef.current = 0;
      returnProgressRef.current = 0;
      swipeY.setValue(0);
      swipeChrome.setValue(0);
      returnProgress.setValue(0);
      closeFade.setValue(1);
      setIsPresented(false);
    }
  }, [
    clearCloseTimeout,
    closeFade,
    initialIndex,
    initialImageUrl,
    returnProgress,
    swipeChrome,
    swipeY,
    visible,
  ]);

  useEffect(
    () => () => {
      clearCloseTimeout();
      swipeY.stopAnimation();
      swipeChrome.stopAnimation();
      returnProgress.stopAnimation();
      closeFade.stopAnimation();
    },
    [clearCloseTimeout, closeFade, returnProgress, swipeChrome, swipeY],
  );

  useEffect(() => {
    if (!visible || !imageUrlsKey) {
      return;
    }

    prefetchImageUrls(imageUrlsKey.split('\u0001'), {limit: 6});

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    });
  }, [imageUrlsKey, initialIndex, visible]);

  const updateActiveImageAspectRatio = (imageUrl, index, event) => {
    const {width, height} = event.nativeEvent?.source ?? {};

    if (width > 0 && height > 0) {
      const nextAspectRatio = width / height;
      imageAspectRatiosRef.current.set(imageUrl, nextAspectRatio);
      if (index === currentIndex) {
        setActiveImageAspectRatio(nextAspectRatio);
      }
    }
  };
  const navigateWebImage = useCallback(
    direction => {
      const nextIndex = Math.max(
        0,
        Math.min(currentIndex + direction, imageList.length - 1),
      );

      if (nextIndex === currentIndex) {
        return;
      }

      setActiveImageAspectRatio(
        imageAspectRatiosRef.current.get(getImageUrl(imageList[nextIndex])) ??
          null,
      );
      setCurrentIndex(nextIndex);
      onImageIndexChange?.(nextIndex);
      listRef.current?.scrollToIndex({index: nextIndex, animated: true});
    },
    [currentIndex, imageList, onImageIndexChange],
  );
  const renderImage = ({item, index}) => {
    const imageUrl = getImageUrl(item);

    return (
      <View
        style={[
          styles.imagePage,
          {
            width: pageWidth,
            height: pageHeight,
          },
        ]}>
        <Animated.View style={[styles.imageMotion, animatedImageStyle]}>
          <AppImage
            uri={imageUrl}
            style={styles.image}
            resizeMode={
              hasSourceRect && activeImageAspectRatio ? 'cover' : 'contain'
            }
            onLoad={event =>
              updateActiveImageAspectRatio(imageUrl, index, event)
            }
          />
        </Animated.View>
      </View>
    );
  };

  if (Platform.OS === 'android') {
    if (!isPresented) {
      return null;
    }

    const androidImages =
      imageList.length > 0
        ? [
            ...imageList.slice(initialIndex),
            ...imageList.slice(0, initialIndex),
          ]
        : [];
    const androidDisplayIndex =
      imageList.length > 0
        ? ((initialIndex + currentIndex) % imageList.length) + 1
        : 0;
    const currentAndroidItem = androidImages[currentIndex] ?? androidImages[0];
    const currentAndroidImageUrl = getImageUrl(currentAndroidItem);

    return (
      <Modal
        visible={isPresented}
        transparent
        animationType="none"
        onRequestClose={handleRequestClose}
        statusBarTranslucent
        navigationBarTranslucent>
        <View
          style={[
            styles.modalRoot,
            {
              width: pageWidth,
              height: pageHeight,
            },
          ]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backdrop,
              {
                width: pageWidth,
                height: pageHeight,
              },
              styles.androidBackdropLayer,
              animatedBackdropStyle,
            ]}
          />
          <View
            style={[
              styles.overlay,
              {
                width: pageWidth,
                height: pageHeight,
              },
              styles.androidOverlayLayer,
            ]}>
            <Animated.View
              style={[
                styles.header,
                styles.androidHeader,
                animatedHeaderStyle,
              ]}>
              <Text style={[FONTS.fs_14_medium, styles.counter]}>
                {imageList.length > 1
                  ? `${androidDisplayIndex}/${imageList.length}`
                  : ''}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.closeButton}
                onPress={handleRequestClose}>
                <Text style={styles.androidCloseIcon}>×</Text>
              </TouchableOpacity>
            </Animated.View>

            <View
              style={[
                styles.androidImageStage,
                {
                  width: pageWidth,
                  height: pageHeight,
                },
              ]}
              {...androidTouchHandlers}>
              <View
                style={[
                  styles.imagePage,
                  {
                    width: pageWidth,
                    height: pageHeight,
                  },
                  styles.androidImagePage,
                ]}>
                {!!currentAndroidImageUrl && (
                  <Animated.View
                    style={[styles.imageMotion, animatedImageStyle]}>
                    <AppImage
                      uri={currentAndroidImageUrl}
                      style={styles.image}
                      resizeMode={
                        hasSourceRect && activeImageAspectRatio
                          ? 'cover'
                          : 'contain'
                      }
                      onLoad={event =>
                        updateActiveImageAspectRatio(
                          currentAndroidImageUrl,
                          currentIndex,
                          event,
                        )
                      }
                    />
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const contentBody = (
    <>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Text style={[FONTS.fs_14_medium, styles.counter]}>
          {imageList.length > 1
            ? `${currentIndex + 1}/${imageList.length}`
            : ''}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.closeButton}
          onPress={handleRequestClose}>
          {Platform.OS === 'web' ? (
            <Text style={styles.webCloseIcon}>×</Text>
          ) : (
            <XIcon width={24} height={24} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {Platform.OS === 'web' && imageList.length > 1 && (
        <>
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={currentIndex === 0}
            style={[
              styles.webNavigationButton,
              styles.webNavigationPrevious,
              currentIndex === 0 && styles.webNavigationButtonDisabled,
            ]}
            onPress={() => navigateWebImage(-1)}>
            <Text style={styles.webNavigationIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={currentIndex === imageList.length - 1}
            style={[
              styles.webNavigationButton,
              styles.webNavigationNext,
              currentIndex === imageList.length - 1 &&
                styles.webNavigationButtonDisabled,
            ]}
            onPress={() => navigateWebImage(1)}>
            <Text style={styles.webNavigationIcon}>›</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.imageStage}>
        <FlatList
          {...nativeListTouchHandlers}
          ref={listRef}
          data={imageList}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) =>
            `${item?.id ?? getImageUrl(item) ?? item}-${index}`
          }
          renderItem={renderImage}
          initialScrollIndex={imageList.length > 0 ? initialIndex : undefined}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          onMomentumScrollEnd={event => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / pageWidth,
            );
            const safeNextIndex = Math.max(
              0,
              Math.min(nextIndex, imageList.length - 1),
            );
            setActiveImageAspectRatio(
              imageAspectRatiosRef.current.get(
                getImageUrl(imageList[safeNextIndex]),
              ) ?? null,
            );
            setCurrentIndex(safeNextIndex);
            onImageIndexChange?.(safeNextIndex);
          }}
          removeClippedSubviews={false}
          onScrollToIndexFailed={({index}) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({index, animated: false});
            }, 100);
          }}
        />
      </View>
    </>
  );

  const modalVisible = isPresented;
  const content = (
    <View style={styles.modalRoot}>
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, animatedBackdropStyle]}
      />
      <View style={styles.overlay}>{contentBody}</View>
    </View>
  );

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated>
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.grayscale_900,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 2,
    height: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    minWidth: 40,
    color: COLORS.grayscale_0,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.modal_background,
  },
  imageStage: {
    flex: 1,
  },
  webNavigationButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 3,
    width: 48,
    height: 48,
    marginTop: -24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  webNavigationPrevious: {
    left: 20,
  },
  webNavigationNext: {
    right: 20,
  },
  webNavigationButtonDisabled: {
    opacity: 0.25,
  },
  webNavigationIcon: {
    color: COLORS.grayscale_0,
    fontSize: 42,
    fontWeight: '300',
    lineHeight: 44,
  },
  webCloseIcon: {
    color: '#B8B8B8',
    fontSize: 40,
    fontWeight: '200',
    lineHeight: 42,
  },
  androidImageStage: {
    flex: 1,
  },
  androidBackdropLayer: {
    zIndex: 0,
  },
  androidOverlayLayer: {
    zIndex: 1,
  },
  androidHeader: {
    elevation: 3,
  },
  androidCloseIcon: {
    color: '#B8B8B8',
    fontSize: 42,
    fontWeight: '200',
    lineHeight: 44,
  },
  androidImagePage: {
    flex: 0,
  },
  androidImage: {
    flexShrink: 0,
  },
  imagePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 88,
    paddingBottom: 34,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageMotion: {
    overflow: 'hidden',
  },
});

export default ImageModal;
