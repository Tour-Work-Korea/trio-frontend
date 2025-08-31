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
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { uploadMultiImage } from '@utils/imageUploadHandler';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';
import CheckIcon from '@assets/images/star_filled.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const ensureOneThumbnail = (list = []) => {
  const arr = (list || []).map(i => ({
    guesthouseImageUrl: i.guesthouseImageUrl,
    isThumbnail: !!i.isThumbnail,
  }));
  if (arr.length > 0 && !arr.some(i => i.isThumbnail)) {
    arr[0].isThumbnail = true;
  }
  return arr;
};

// 이미지 변경 비교: URL 기준으로 세트 동일성 + 썸네일 동일성 비교(순서 무시)
const imagesEqual = (a = [], b = []) => {
  const norm = (xs = []) => {
    const m = new Map();
    xs.forEach(x => {
      const url = String(x.guesthouseImageUrl || '');
      if (!url) return;
      m.set(url, !!x.isThumbnail);
    });
    return m;
  };
  const A = norm(a);
  const B = norm(b);
  if (A.size !== B.size) return false;
  for (const [url, thumb] of A) {
    if (!B.has(url)) return false;
    if (B.get(url) !== thumb) return false;
  }
  return true;
};

const GuesthouseIntroSummaryModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  guesthouseId,

  defaultImages = [],
  defaultShortIntro = '',
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [guesthouseImages, setGuesthouseImages] = useState([]);
  const [shortIntroText, setShortIntroText] = useState('');

  // 마지막 적용값
  const [appliedData, setAppliedData] = useState(null); 

  // 기준값(변경 비교용)
  const [baselineImages, setBaselineImages] = useState([]);
  const [baselineShortIntro, setBaselineShortIntro] = useState('');

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 모달 열릴 때 초기화/복원
  useEffect(() => {
    if (!visible) return;

    if (appliedData && !shouldResetOnClose) {
      // 마지막 적용값으로 복원
      const imgs = ensureOneThumbnail(appliedData.guesthouseImages);
      const intro = appliedData.shortIntroText ?? '';
      setGuesthouseImages(imgs);
      setShortIntroText(intro);

      setBaselineImages(imgs);
      setBaselineShortIntro(intro);
    } else {
      // 부모 기본값으로 초기화
      const imgs = ensureOneThumbnail(defaultImages);
      const intro = defaultShortIntro ?? '';
      setGuesthouseImages(imgs);
      setShortIntroText(intro);

      setBaselineImages(imgs);
      setBaselineShortIntro(intro);
    }
  }, [visible, shouldResetOnClose, appliedData, defaultImages, defaultShortIntro]);

  // 버튼 활성화 조건
  const isDisabled = guesthouseImages.length === 0 || shortIntroText.trim() === '';
    
  // 단순 닫기
  const handleModalClose = () => {
    onClose();
  };

  // 복수 이미지 업로드
  const handleAddImage = async () => {
    if (guesthouseImages.length >= 10) return;

    const uploadedUrls = await uploadMultiImage(10 - guesthouseImages.length);
    if (!uploadedUrls.length) return;

    setGuesthouseImages(prev => {
      const merged = [
        ...prev,
        ...uploadedUrls.map((url, index) => ({
          guesthouseImageUrl: url,
          isThumbnail: prev.length === 0 && index === 0, // 첫 업로드면 첫 장을 썸네일
        })),
      ];
      return ensureOneThumbnail(merged);
    });
  };

  // 이미지 삭제
  const handleDeleteImage = (index) => {
    setGuesthouseImages(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      return ensureOneThumbnail(updated);
    });
  };

  // 썸네일 선택
  const handleSelectThumbnail = (index) => {
    setGuesthouseImages(prev =>
      prev.map((img, idx) => ({ ...img, isThumbnail: idx === index }))
    );
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = async () => {
   const snapshotImages = ensureOneThumbnail(guesthouseImages);
    const snapshotIntro = shortIntroText.trim();

    const shortIntroChanged = baselineShortIntro !== snapshotIntro;
    const imagesChanged = !imagesEqual(baselineImages, snapshotImages);

    if (!shortIntroChanged && !imagesChanged) {
      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });
      onClose();
      return;
    }

    if (!guesthouseId) {
      Toast.show({ type: 'error', text1: '게스트하우스 ID가 없습니다.', position: 'top' });
      return;
    }
    try {
      const requests = [];
      if (shortIntroChanged) {
        requests.push(
          hostGuesthouseApi.updateGuesthouseBasic(guesthouseId, {
            guesthouseShortIntro: snapshotIntro,
          }),
        );
      }
      if (imagesChanged) {
        requests.push(
          hostGuesthouseApi.updateGuesthouseImages(guesthouseId, snapshotImages),
        );
      }

      await Promise.all(requests);
      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });

      // 기준값 갱신 + 복원값 저장
      setBaselineImages(snapshotImages);
      setBaselineShortIntro(snapshotIntro);
      setAppliedData({ guesthouseImages: snapshotImages, shortIntroText: snapshotIntro });

      // 부모에 최신값 전달(미리보기/상태 동기화)
      onSelect({ guesthouseImages: snapshotImages, shortIntroText: snapshotIntro });

      onClose();
    } catch (e) {
      Toast.show({ type: 'error', text1: '수정 중 오류가 발생했어요.', position: 'top' });
      onClose();
    }
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -120 : 0}
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
                placeholderTextColor={COLORS.grayscale_400}
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