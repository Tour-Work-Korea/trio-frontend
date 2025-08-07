import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { uploadMultiImage } from '@utils/imageUploadHandler';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';
import CheckIcon from '@assets/images/star_filled.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseIntroSummaryModal = ({ visible, onClose, onSelect, shouldResetOnClose }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [guesthouseImages, setGuesthouseImages] = useState([]);
  const [shortIntroText, setShortIntroText] = useState('');

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 모달 열릴 때 마지막 적용 값 복원
  React.useEffect(() => {
    if (visible && appliedData) {
      setGuesthouseImages(appliedData.guesthouseImages);
      setShortIntroText(appliedData.shortIntroText);
    }
  }, [visible]);

  // 버튼 활성화 조건
  const isDisabled = guesthouseImages.length === 0 || shortIntroText.trim() === '';
    
  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        // 마지막 적용값 복원
        setGuesthouseImages(appliedData.guesthouseImages);
        setShortIntroText(appliedData.shortIntroText);
      } else {
        // 처음 상태로 초기화
        setGuesthouseImages([]);
      setShortIntroText('');
      }
    }
    onClose();
  };

  // 복수 이미지 업로드
  const handleAddImage = async () => {
    if (guesthouseImages.length >= 10) return;

    const uploadedUrls = await uploadMultiImage(10 - guesthouseImages.length);
    if (!uploadedUrls.length) return;

    setGuesthouseImages(prev => [
      ...prev,
      ...uploadedUrls.map((url, index) => ({
        guesthouseImageUrl: url,
        isThumbnail:
          prev.length === 0 && index === 0 // 첫 업로드 시 첫 이미지 썸네일
      }))
    ]);
  };

  // 이미지 삭제
  const handleDeleteImage = (index) => {
    setGuesthouseImages(prev => {
      const updated = prev.filter((_, idx) => idx !== index);

      // 삭제 후 썸네일이 없으면 첫 번째 이미지 썸네일로 지정
      if (!updated.some(img => img.isThumbnail) && updated.length > 0) {
        updated[0].isThumbnail = true;
      }

      return updated;
    });
  };

  // 썸네일 선택
  const handleSelectThumbnail = (index) => {
    setGuesthouseImages(prev =>
      prev.map((img, idx) => ({
        ...img,
        isThumbnail: idx === index
      }))
    );
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    // 현재 상태 저장
    const dataToSave = {
      guesthouseImages,
      shortIntroText
    };
    // 현재 상태 저장
    setAppliedData(dataToSave);

    onSelect(dataToSave);
    onClose();
  };

  const handleOverlayPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss(); // 키보드만 닫기
    } else {
      handleModalClose(); // 모달 닫기
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              게스트하우스 소개요약
            </Text>
            <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 게하 정보 */}
          <ScrollView style={styles.body}>
            {/* 사진 */}
            <View style={styles.titleContainer}>
              <Text style={FONTS.fs_16_medium}>배너 사진</Text>
              <Text style={[FONTS.fs_12_light, styles.countText]}>
                <Text style={[{color: COLORS.primary_orange}]}>{guesthouseImages.length}</Text>/10
              </Text>
            </View>
            <Text style={[FONTS.fs_12_medium, styles.subText]}>
              대표로 보여줄 사진을 선택해주세요{'\n'}(선택된 사진에는 별이 표시됩니다)
            </Text>
            <View style={styles.infoRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {/* 이미지 추가 버튼 */}
                <TouchableOpacity
                  style={styles.addImageBox}
                  onPress={handleAddImage}
                  disabled={guesthouseImages.length >= 10}
                >
                  <AddImage width={30} height={30} />
                </TouchableOpacity>

                {/* 업로드된 이미지들 */}
                {guesthouseImages.map((item, idx) => (
                  <View key={idx} style={{ position: 'relative' }}>
                    <TouchableOpacity onPress={() => handleSelectThumbnail(idx)}>
                      <Image
                        source={{ uri: item.guesthouseImageUrl }}
                        style={styles.uploadedImage}
                      />
                      {item.isThumbnail && (
                        <View style={styles.checkIconContainer}>
                          <CheckIcon width={14} height={14} />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* 삭제 버튼 */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteImage(idx)}
                    >
                      <XBtn width={14} height={14} />
                    </TouchableOpacity>
                  </View>
                ))}

              </ScrollView>
            </View>

            {/* 간략 소개 */}
            <View style={styles.titleContainer}>
              <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>
                게스트 하우스를 간략하게 소개해주세요
              </Text>
              <Text style={[FONTS.fs_12_light, styles.countText, { marginTop: 20 }]}>
                <Text style={[{color: COLORS.primary_orange}]}>{shortIntroText.length}</Text>/1,000
              </Text>
            </View>
            <View style={styles.infoRow}>
              <TextInput
                style={[styles.textArea, FONTS.fs_14_regular]}
                value={shortIntroText}
                onChangeText={setShortIntroText}
                multiline
                maxLength={1000}
                placeholder="게스트하우스 소개를 입력해주세요"
              />
              <TouchableOpacity style={styles.rewriteButton} onPress={() => setShortIntroText('')}>
                <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GuesthouseIntroSummaryModal;

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

  // 설명 텍스트
  subText: {
    color: COLORS.grayscale_400,
    marginTop: 4,
  },

  // 이미지
  addImageBox: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 8,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 18,
    width: 18,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
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

  // 소개글
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    minHeight: 240,
    textAlignVertical: 'top',
    color: COLORS.grayscale_900,
  },
  rewriteButton: {
    marginTop: 4,
    marginBottom: 40,
    alignSelf: 'flex-end',
  },
  rewriteText: {
    color: COLORS.grayscale_500,
  },
});