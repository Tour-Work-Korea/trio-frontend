import React, {useEffect, useRef, useState} from 'react';
import {
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

const CommunityImageModal = ({
  visible,
  images = [],
  selectedImageIndex = 0,
  onClose,
}) => {
  const {width: screenWidth} = useWindowDimensions();
  const listRef = useRef(null);
  const imageList = Array.isArray(images) ? images : [];
  const initialIndex =
    imageList.length > 0
      ? Math.min(selectedImageIndex, imageList.length - 1)
      : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, visible]);

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
    const imageUrl = item?.imageUrl ?? item;

    return (
      <View style={[styles.imagePage, {width: screenWidth}]}>
        <Image
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  };

  const content = (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <Text style={[FONTS.fs_14_medium, styles.counter]}>
          {imageList.length > 1 ? `${currentIndex + 1}/${imageList.length}` : ''}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.closeButton}
          onPress={onClose}>
          <XIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageStage}>
        <FlatList
          ref={listRef}
          data={imageList}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) =>
            `${item?.id ?? item?.imageUrl ?? item}-${index}`
          }
          renderItem={renderImage}
          getItemLayout={(_, index) => ({
            length: screenWidth || FALLBACK_SCREEN_WIDTH,
            offset: (screenWidth || FALLBACK_SCREEN_WIDTH) * index,
            index,
          })}
          onMomentumScrollEnd={event => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x /
                (screenWidth || FALLBACK_SCREEN_WIDTH),
            );
            setCurrentIndex(
              Math.max(0, Math.min(nextIndex, imageList.length - 1)),
            );
          }}
          onScrollToIndexFailed={({index}) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({index, animated: false});
            }, 100);
          }}
        />
      </View>
    </View>
  );

  if (Platform.OS === 'android') {
    if (!visible) {
      return null;
    }

    return <View style={styles.androidHost}>{content}</View>;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      hardwareAccelerated>
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  androidHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
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

export default CommunityImageModal;
