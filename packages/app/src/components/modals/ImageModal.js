import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
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

const {width: FALLBACK_SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_CLOSE_DISTANCE = 80;
const SWIPE_CLOSE_VELOCITY = -0.6;
const SWIPE_CLOSE_DURATION = 180;

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
  enableSwipeToClose = true,
}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const pageWidth = screenWidth || FALLBACK_SCREEN_WIDTH;
  const pageHeight = screenHeight;
  const listRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const isClosingRef = useRef(false);
  const touchStartRef = useRef(null);
  const swipeY = useRef(new Animated.Value(0)).current;
  const imageList = Array.isArray(images) ? images : [];
  const safeSelectedImageIndex = Number.isFinite(selectedImageIndex)
    ? selectedImageIndex
    : 0;
  const initialIndex =
    imageList.length > 0
      ? Math.min(Math.max(safeSelectedImageIndex, 0), imageList.length - 1)
      : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPresented, setIsPresented] = useState(visible);
  const finishClose = useCallback(() => {
    if (!isClosingRef.current) {
      return;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    isClosingRef.current = false;
    touchStartRef.current = null;
    setIsPresented(false);
    onClose?.();
  }, [onClose]);
  const resetSwipeAnimation = useCallback(() => {
    Animated.spring(swipeY, {
      toValue: 0,
      useNativeDriver: true,
      isInteraction: false,
      tension: 90,
      friction: 12,
    }).start();
  }, [swipeY]);
  const animateClose = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    closeTimeoutRef.current = setTimeout(
      finishClose,
      SWIPE_CLOSE_DURATION + 120,
    );

    Animated.timing(swipeY, {
      toValue: -screenHeight,
      duration: SWIPE_CLOSE_DURATION,
      useNativeDriver: true,
      isInteraction: false,
    }).start(finishClose);
  }, [finishClose, screenHeight, swipeY]);
  const updateSwipeAnimation = useCallback(
    dy => {
      swipeY.setValue(Math.min(dy, 0));
    },
    [swipeY],
  );
  const closeIfSwipeUp = useCallback(
    ({dx = 0, dy = 0, vy = 0}) => {
      const isMostlyVertical = Math.abs(dy) > Math.abs(dx) * 1.2;

      if (dy <= -SWIPE_CLOSE_DISTANCE && isMostlyVertical) {
        animateClose();
        return true;
      }

      if (vy <= SWIPE_CLOSE_VELOCITY && isMostlyVertical) {
        animateClose();
        return true;
      }

      resetSwipeAnimation();
      return false;
    },
    [animateClose, resetSwipeAnimation],
  );
  const animatedOverlayStyle = {
    opacity: swipeY.interpolate({
      inputRange: [-SWIPE_CLOSE_DISTANCE, 0],
      outputRange: [0.35, 1],
      extrapolate: 'clamp',
    }),
    transform: [{translateY: swipeY}],
  };
  const handleTouchStart = useCallback(event => {
    const touch = event.nativeEvent?.touches?.[0] ?? event.nativeEvent;

    touchStartRef.current = {
      x: touch?.pageX ?? touch?.clientX ?? 0,
      y: touch?.pageY ?? touch?.clientY ?? 0,
    };
  }, []);
  const handleTouchMove = useCallback(
    event => {
      const start = touchStartRef.current;
      const touch = event.nativeEvent?.touches?.[0] ?? event.nativeEvent;

      if (!start) {
        return;
      }

      const dx = (touch?.pageX ?? touch?.clientX ?? start.x) - start.x;
      const dy = (touch?.pageY ?? touch?.clientY ?? start.y) - start.y;

      if (dy < 0 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        updateSwipeAnimation(dy);
      }
    },
    [updateSwipeAnimation],
  );
  const handleTouchEnd = useCallback(
    event => {
      const start = touchStartRef.current;
      const touch =
        event.nativeEvent?.changedTouches?.[0] ??
        event.nativeEvent?.touches?.[0] ??
        event.nativeEvent;

      touchStartRef.current = null;

      if (!start) {
        return;
      }

      closeIfSwipeUp({
        dx: (touch?.pageX ?? touch?.clientX ?? start.x) - start.x,
        dy: (touch?.pageY ?? touch?.clientY ?? start.y) - start.y,
      });
    },
    [closeIfSwipeUp],
  );
  const handleWheel = useCallback(
    event => {
      const {deltaX = 0, deltaY = 0} = event.nativeEvent ?? event;

      if (
        enableSwipeToClose &&
        Math.abs(deltaY) >= 60 &&
        Math.abs(deltaY) > Math.abs(deltaX) * 1.2
      ) {
        animateClose();
      }
    },
    [animateClose, enableSwipeToClose],
  );
  const canSwipeToClose = enableSwipeToClose && Platform.OS !== 'android';
  const touchHandlers = canSwipeToClose
    ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
      }
    : {};
  const webWheelHandlers =
    canSwipeToClose && Platform.OS === 'web' ? {onWheel: handleWheel} : {};

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);
  const handleRequestClose = useCallback(() => {
    clearCloseTimeout();
    isClosingRef.current = false;
    touchStartRef.current = null;
    swipeY.stopAnimation();
    swipeY.setValue(0);
    setIsPresented(false);
    onClose?.();
  }, [clearCloseTimeout, onClose, swipeY]);

  useEffect(() => {
    if (visible) {
      clearCloseTimeout();
      isClosingRef.current = false;
      touchStartRef.current = null;
      swipeY.stopAnimation();
      swipeY.setValue(0);
      setCurrentIndex(Platform.OS === 'android' ? 0 : initialIndex);
      setIsPresented(true);
      return;
    }

    if (!isClosingRef.current) {
      clearCloseTimeout();
      touchStartRef.current = null;
      swipeY.stopAnimation();
      swipeY.setValue(0);
      setIsPresented(false);
    }
  }, [clearCloseTimeout, initialIndex, swipeY, visible]);

  useEffect(
    () => () => {
      clearCloseTimeout();
      swipeY.stopAnimation();
    },
    [clearCloseTimeout, swipeY],
  );

  useEffect(() => {
    if (!visible || imageList.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    });
  }, [imageList.length, initialIndex, visible]);

  const renderImage = ({item}) => {
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
        <Image
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  };

  if (Platform.OS === 'android') {
    if (!visible) {
      return null;
    }

    const androidImages =
      imageList.length > 0
        ? [...imageList.slice(initialIndex), ...imageList.slice(0, initialIndex)]
        : [];
    const androidDisplayIndex =
      imageList.length > 0
        ? ((initialIndex + currentIndex) % imageList.length) + 1
        : 0;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleRequestClose}
        statusBarTranslucent
        navigationBarTranslucent
        hardwareAccelerated>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_14_medium, styles.counter]}>
              {imageList.length > 1
                ? `${androidDisplayIndex}/${imageList.length}`
                : ''}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={handleRequestClose}>
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.androidImageStage}>
            <FlatList
              data={androidImages}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) =>
                `${item?.id ?? getImageUrl(item) ?? item}-${index}`
              }
              renderItem={({item}) => {
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
                    {!!imageUrl && (
                      <Image
                        source={{uri: imageUrl}}
                        style={styles.image}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                );
              }}
              onMomentumScrollEnd={event => {
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / pageWidth,
                );
                setCurrentIndex(
                  Math.max(0, Math.min(nextIndex, androidImages.length - 1)),
                );
              }}
              removeClippedSubviews={false}
            />
          </View>
        </View>
      </Modal>
    );
  }

  const contentBody = (
    <>
      <View style={styles.header}>
        <Text style={[FONTS.fs_14_medium, styles.counter]}>
          {imageList.length > 1 ? `${currentIndex + 1}/${imageList.length}` : ''}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.closeButton}
          onPress={handleRequestClose}>
          <XIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View
        style={styles.imageStage}
        {...touchHandlers}
        {...webWheelHandlers}>
        <FlatList
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
            setCurrentIndex(
              Math.max(0, Math.min(nextIndex, imageList.length - 1)),
            );
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

  const modalVisible = Platform.OS === 'android' ? visible : isPresented;
  const content =
    Platform.OS === 'android' ? (
      <View style={styles.overlay}>{contentBody}</View>
    ) : (
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        {contentBody}
      </Animated.View>
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
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
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
  androidImageStage: {
    flex: 1,
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
});

export default ImageModal;
