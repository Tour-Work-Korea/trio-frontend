import React, {useState, useEffect} from 'react';
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

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import {uploadSingleImage} from '@utils/imageUploadHandler';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const MeetIntroModal = ({visible, onClose, onSelect, shouldResetOnClose}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null); // 대표 사진 1장
  const [description, setDescription] = useState(''); // 간략 소개글

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 모달 열릴 때 마지막 적용 값 복원
  React.useEffect(() => {
    if (visible && appliedData) {
      setThumbnailUrl(appliedData.thumbnailUrl);
      setDescription(appliedData.description);
    }
  }, [visible]);

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        // 마지막 적용값 복원
        setThumbnailUrl(appliedData.thumbnailUrl);
        setDescription(appliedData.description);
      } else {
        // 처음 상태로 초기화
        setThumbnailUrl(null);
        setDescription('');
      }
    }
    onClose();
  };

  // 단일 이미지 업로드(썸네일)
  const handleAddImage = async () => {
    if (thumbnailUrl) return; // 1장 제한
    const url = await uploadSingleImage();
    if (url) {
      setThumbnailUrl(url);
    }
  };

  // 이미지 삭제
  const handleDeleteImage = () => setThumbnailUrl(null);

  // 버튼 활성화 조건
  const isDisabled = !thumbnailUrl || description.trim() === '';

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    // 현재 상태 저장
    const dataToSave = {
      thumbnailUrl,
      description: description.trim(),
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
      onRequestClose={handleModalClose}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -120 : 0}>
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                {/* 헤더 */}
                <View style={styles.header}>
                  <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
                    이벤트 배너사진 및 소개요약
                  </Text>
                  <TouchableOpacity
                    style={styles.XBtn}
                    onPress={handleModalClose}>
                    <XBtn width={24} height={24} />
                  </TouchableOpacity>
                </View>

                {/* 게하 정보 */}
                <ScrollView style={styles.body}>
                  {/* 사진 */}
                  <View style={styles.titleContainer}>
                    <Text style={FONTS.fs_16_medium}>배너 사진</Text>
                    <Text style={[FONTS.fs_12_light, styles.countText]}>
                      <Text style={[{color: COLORS.primary_orange}]}>
                        {thumbnailUrl ? 1 : 0}
                      </Text>
                      /1
                    </Text>
                  </View>
                  <View style={[styles.infoRow, {flexDirection: 'row'}]}>
                    {!thumbnailUrl ? (
                      <TouchableOpacity
                        style={styles.addImageBox}
                        onPress={handleAddImage}>
                        <AddImage width={30} height={30} />
                      </TouchableOpacity>
                    ) : (
                      <View style={{position: 'relative'}}>
                        <Image
                          source={{uri: thumbnailUrl}}
                          style={styles.uploadedImage}
                        />
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={handleDeleteImage}>
                          <XBtn width={14} height={14} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* 간략 소개 */}
                  <View style={styles.titleContainer}>
                    <Text style={[FONTS.fs_16_medium, {marginTop: 20}]}>
                      이벤트 소개
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_12_light,
                        styles.countText,
                        {marginTop: 20},
                      ]}>
                      <Text style={[{color: COLORS.primary_orange}]}>
                        {description.length}
                      </Text>
                      /500
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <TextInput
                      style={[styles.textArea, FONTS.fs_14_regular]}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      maxLength={500}
                      placeholder="간략하게 들어갈 이벤트 소개를 작성해주세요"
                      placeholderTextColor={COLORS.grayscale_400}
                    />
                    <TouchableOpacity
                      style={styles.rewriteButton}
                      onPress={() => setDescription('')}>
                      <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>
                        다시쓰기
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                {/* 적용하기 버튼 */}
                <ButtonScarlet
                  title={'적용하기'}
                  onPress={handleConfirm}
                  disabled={isDisabled}
                  style={{marginBottom: 16}}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MeetIntroModal;

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
