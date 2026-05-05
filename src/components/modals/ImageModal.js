import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

// 이미지 크게 보기 모달
// ex) 공고 상세에서 이미지 모달

const ImageModal = ({visible, title, images, onClose, selectedImageIndex}) => {
  const {width: screenWidth} = useWindowDimensions();
  const modalWidth = Math.min(screenWidth * 0.8, 360);
  const imageSize = modalWidth - 40; // 모달 패딩 20*2 제외
  const imageList = useMemo(
    () => (Array.isArray(images) ? images : []),
    [images],
  );
  const [currentImage, setCurrentImage] = useState(() => {
    const imageItem = imageList?.[selectedImageIndex];
    return {
      id: imageItem?.id ?? selectedImageIndex,
      imageUrl: imageItem?.imageUrl ?? imageItem ?? '',
    };
  });

  useEffect(() => {
    if (visible && imageList[selectedImageIndex]) {
      const imageItem = imageList[selectedImageIndex];
      setCurrentImage({
        id: imageItem?.id ?? selectedImageIndex,
        imageUrl: imageItem?.imageUrl ?? imageItem,
      });
    }
  }, [visible, selectedImageIndex, imageList]);

  const content = (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={[styles.container, {width: modalWidth}]}>
        <View style={styles.header}>
          <Text
            style={[FONTS.fs_16_semibold, styles.headerTitle]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerClose}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <XBtn width={24} height={24} />
          </TouchableOpacity>
        </View>
        {/* 확대 이미지 */}
        <Image
          source={{uri: currentImage.imageUrl}}
          style={[
            styles.mainImageContainer,
            {width: imageSize, height: imageSize}, // 가변 사이즈 적용
          ]}
          resizeMode="cover"
        />

        {/* 이미지 리스트 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
          contentContainerStyle={styles.imageScrollContent}>
          {imageList.map((item, index) => (
            <TouchableOpacity
              key={item.id ?? `${item.imageUrl ?? item}-${index}`}
              onPress={() =>
                setCurrentImage({
                  id: item.id ?? index,
                  imageUrl: item.imageUrl ?? item,
                })
              }>
              <Image
                source={{uri: item.imageUrl ?? item}}
                style={[
                  styles.image,
                  currentImage.id === (item.id ?? index)
                    ? styles.selectedImage
                    : null,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Pressable>
    </Pressable>
  );

  if (Platform.OS === 'android') {
    if (!visible) {
      return null;
    }

    return <View style={styles.androidOverlayHost}>{content}</View>;
  }

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
  androidOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'column',
    padding: 20,
  },
  header: {
    position: 'relative', // 절대 배치 기준
    width: '100%',
    minHeight: 24, // X 버튼 높이만큼 확보
    alignItems: 'center',
    justifyContent: 'center', // 제목을 정확히 중앙
    paddingHorizontal: 20, // 모달 내부 패딩과 맞추면 깔끔
  },
  headerTitle: {
    textAlign: 'center',
    flexShrink: 1, // 공간 부족 시 줄어들도록
    minWidth: 0, // ellipsis가 동작하도록 (중요)
    marginLeft: 24, // 왼쪽 아이콘 자리 확보
    marginRight: 24, // 오른쪽 X 자리 확보
  },
  headerClose: {
    position: 'absolute',
    right: 0, // 헤더 오른쪽 끝에 고정
    // top을 정확히 중앙에 놓고 싶다면:
    top: '50%',
    marginTop: -12, // 아이콘 높이(24)의 절반만큼 올려 중앙 정렬
  },
  mainImageContainer: {
    borderRadius: 19.76,
    marginTop: 20,
  },
  imageScroll: {
    width: '100%',
    marginTop: 20,
  },
  imageScrollContent: {
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4.24,
    marginRight: 4,
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: COLORS.primary_orange,
  },
});

export default ImageModal;
