import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FullScreenImageModal = ({visible, images, initialIndex = 0, onClose}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const flatListRef = useRef(null);
  const imageList = useMemo(() => (Array.isArray(images) ? images : []), [images]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when visible or initialIndex changes
  useEffect(() => {
    if (visible) {
      const idx = initialIndex >= 0 && initialIndex < imageList.length ? initialIndex : 0;
      setCurrentIndex(idx);
      // Wait for flatlist to mount, then scroll to index
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: idx,
            animated: false,
          });
        }
      }, 50);
    }
  }, [visible, initialIndex, imageList.length]);

  const onMomentumScrollEnd = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    if (index >= 0 && index < imageList.length) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({item}) => {
    const uri = item.imageUrl ?? item;
    return (
      <View style={[styles.slide, {width: screenWidth, height: screenHeight}]}>
        <Image
          source={{uri}}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  };

  if (!visible) {
    return null;
  }

  const content = (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {imageList.length > 1 && (
          <Text style={styles.counter}>
            {currentIndex + 1} / {imageList.length}
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* FlatList */}
      <FlatList
        ref={flatListRef}
        data={imageList}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }
          }, 100);
        }}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      hardwareAccelerated>
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
  },
  counter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 12,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default FullScreenImageModal;
