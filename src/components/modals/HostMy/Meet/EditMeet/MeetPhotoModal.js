import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { uploadMultiImage } from '@utils/imageUploadHandler';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const SIZE = 100;          // 고정 100x100
const GAP = 8;             // 카드 간격
const MAX_IMAGES = 30;

const MeetPhotoModal = ({ visible, onClose, onSelect, shouldResetOnClose }) => {
  const [meetImages, setMeetImages] = useState([]);
  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 모달 열릴 때 마지막 적용 값 복원
  useEffect(() => {
    if (!visible) return;
    if (appliedData && Array.isArray(appliedData)) {
      setMeetImages(appliedData.map(url => ({ meetImageUrl: url })));
    } else {
      // 최초 오픈 시 초기화
      setMeetImages([]);
    }
  }, [visible]);

  // 버튼 활성화 조건
  const isDisabled = meetImages >= 1;
    
  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData && Array.isArray(appliedData)) {
        setMeetImages(appliedData.map(url => ({ meetImageUrl: url })));
      } else {
        setMeetImages([]);
      }
    }
    onClose();
  };

  // 바깥 눌렀을 때 (키보드 없음 → 그냥 닫기)
  const handleOverlayPress = () => handleModalClose();

  // 복수 이미지 업로드
  const handleAddImage = async () => {
    if (meetImages.length >= MAX_IMAGES) return;

    const remain = Math.max(0, MAX_IMAGES - meetImages.length);
    const uploadedUrls = await uploadMultiImage(remain);
    if (!uploadedUrls?.length) return;

    setMeetImages(prev => [
      ...prev,
      ...uploadedUrls.map(url => ({ meetImageUrl: url })),
    ]);
  };

  // 이미지 삭제
  const handleDeleteImage = (index) => {
    setMeetImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    const urls = meetImages.map(i => i.meetImageUrl).filter(Boolean);
    setAppliedData(urls);
    onSelect({ imageUrls: urls });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              모임 사진
            </Text>
            <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 게하 정보 */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 사진 */}
            <View style={styles.titleContainer}>
              <Text style={FONTS.fs_16_medium}>모임 사진을 추가해주세요</Text>
              <Text style={[FONTS.fs_12_light, styles.countText]}>
                <Text style={[{ color: COLORS.primary_orange }]}>{meetImages.length}</Text>/30
              </Text>
            </View>
            <View style={styles.grid}>
              {/* 추가 버튼 (항상 첫 칸) */}
              <TouchableOpacity
                style={styles.card}
                onPress={handleAddImage}
                disabled={meetImages.length >= MAX_IMAGES}
                activeOpacity={0.7}
              >
                <View style={styles.addImageBox}>
                  <AddImage width={30} height={30} />
                </View>
              </TouchableOpacity>

              {/* 업로드된 이미지들 */}
              {meetImages.map((item, idx) => (
                <View key={idx} style={styles.card}>
                  <Image source={{ uri: item.meetImageUrl }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteImage(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <XBtn width={14} height={14} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 적용하기 버튼 */}
          <ButtonScarlet
            title={'적용하기'}
            onPress={handleConfirm}
            disabled={isDisabled}
            style={{ marginBottom: 16 }}
          />

        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MeetPhotoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  XBtn: {
    position: 'absolute',
    right: 0,
  },

  // 게하 정보 입력폼
  body: {
    flex: 1,
  },
  infoRow: {
    marginTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: COLORS.grayscale_400,
  },

  // 이미지
  grid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    width: SIZE,
    height: SIZE,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },

  addImageBox: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 12,
    height: 18,
    width: 18,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

});