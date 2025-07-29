import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

// 이미지 크게 보기 모달
// ex) 공고 상세에서 이미지 모달
/** RecruitTapSection의 사용 예시
 *  <ImageModal
         visible={imageModalVisible}
         title="사진 미리보기"
         images={[
           {
             id: 0,
             imageUrl:
               'https://images.unsplash.com/photo-1682685796002-e05458d61f07?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
           },
           {
             id: 1,
             imageUrl:
               'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1752571419088_935096.jpg',
           },
         ]}
         selectedImageIndex={selectedImageId}
         onClose={() => setImageModalVisible(false)}
       />
 */

const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth * 0.8 - 40; // 80% 너비에서 패딩 20*2 제외

const ImageModal = ({visible, title, images, onClose, selectedImageIndex}) => {
  const [currentImage, setCurrentImage] = useState(() => {
    const imageItem = images?.[selectedImageIndex];
    return {
      id: imageItem?.id ?? selectedImageIndex,
      imageUrl: imageItem?.imageUrl ?? '',
    };
  });

  useEffect(() => {
    if (visible && images[selectedImageIndex]) {
      setCurrentImage({
        id: images[selectedImageIndex]?.id ?? selectedImageIndex,
        imageUrl:
          images[selectedImageIndex]?.imageUrl ?? images[selectedImageIndex],
      });
    }
  }, [visible, selectedImageIndex, images]);
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_16_semibold]}>{title}</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
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
          />

          {/* 이미지 리스트 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}>
            {images?.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  setCurrentImage({
                    id: item.id,
                    imageUrl: item.imageUrl,
                  })
                }>
                <Image
                  source={{uri: item.imageUrl}}
                  style={[
                    styles.image,
                    currentImage.id === item.id ? styles.selectedImage : null,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },
  mainImageContainer: {
    borderRadius: 19.76,
    resizeMode: 'cover',
  },
  imageScroll: {},
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
