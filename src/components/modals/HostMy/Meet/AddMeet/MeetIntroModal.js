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
import {uploadMultiImage} from '@utils/imageUploadHandler';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';
import CheckIcon from '@assets/images/star_filled.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const MAX_IMAGES = 10;

// 중복 제거
const stripDuplicatesByUrl = (arr = []) => {
  const seen = new Set();
  return arr.filter(it => {
    const key = it?.imageUrl || '';
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 항상 첫 번째만 썸네일
const enforceFirstThumbnail = (arr = []) =>
  arr.map((it, idx) => ({ imageUrl: it.imageUrl, isThumbnail: idx === 0 }));

const MeetIntroModal = ({visible, onClose, onSelect, shouldResetOnClose,
  initialDescription = '',
  initialTags = '',
  initialPartyImages = [],
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [partyImages, setPartyImages] = useState([]); // 사진
  const [description, setDescription] = useState(''); // 간략 소개글
  const [tags, setTags] = useState(''); // 직접입력 태그

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
  useEffect(() => {
    if (!visible) return;
    if (appliedData) return;
    setDescription(initialDescription || '');
    setTags(commaStringToHashtags(initialTags || ''));
    setPartyImages(enforceFirstThumbnail(stripDuplicatesByUrl(initialPartyImages || [])));
  }, [visible, initialDescription, initialTags, initialPartyImages]);

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        // 마지막 적용값 복원
        setPartyImages(appliedData.partyImages || []);
        setDescription(appliedData.description || '');
        setTags(
          appliedData.tagsInput != null
            ? appliedData.tagsInput
            : commaStringToHashtags(appliedData.tags || '')
        );
      } else {
        // 초기화
        setPartyImages([]);
        setDescription('');
        setTags('');
      }
    }
    onClose();
  };

  // 복수 이미지 업로드
  const handleAddImage = async () => {
    if (partyImages.length >= MAX_IMAGES) return;
    const remain = Math.max(0, MAX_IMAGES - partyImages.length);
    const uploadedUrls = await uploadMultiImage(remain);
    if (!uploadedUrls?.length) return;

    // 새로 추가한 이미지들은 기본적으로 썸네일 아님
    const appended = [
      ...partyImages,
      ...uploadedUrls.map(url => ({ imageUrl: url, isThumbnail: false })),
    ];

    // 항상 첫 번째만 썸네일 보장
    setPartyImages(enforceFirstThumbnail(stripDuplicatesByUrl(appended)));
  };

  // 이미지 삭제
  const handleDeleteImage = index => {
    const next = partyImages.filter((_, i) => i !== index);
    // 삭제 후에도 첫 번째만 썸네일 유지(빈 배열이면 그대로)
    setPartyImages(enforceFirstThumbnail(next));
  };

  // 썸네일로 선택(클릭한 이미지를 맨 앞으로 이동)
  const handleSelectThumbnail = (index) => {
    setPartyImages(prev => {
      if (!prev || index <= 0 || index >= prev.length) return prev;
      const picked = prev[index];
      const rest = [...prev.slice(0, index), ...prev.slice(index + 1)];
      const next = [picked, ...rest];
      return enforceFirstThumbnail(stripDuplicatesByUrl(next));
    });
  };

  // 태그 입력
  const extractTagList = (raw = '') => {
    const set = new Set();

    // 1) 해시태그 먼저 추출
    const hashRe = /#([\p{L}\p{N}_+.-]+)/gu;
    let m;
    while ((m = hashRe.exec(raw)) !== null) {
      const t = (m[1] || '').trim();
      if (t) set.add(t);
    }

    // 2) 해시태그 제거 후 콤마/개행 기반 추출
    const rawWithoutHashtags = raw.replace(/#[\p{L}\p{N}_+.-]+/gu, '');
    rawWithoutHashtags
      .split(/[,\n]/)
      .map(s => s.replace(/#/g, '').trim())
      .filter(Boolean)
      .forEach(t => set.add(t));

    return Array.from(set).map(t => t.trim()).filter(Boolean);
  };

  // 표시용 "#불멍 #포틀럭"
  const listToHashtagString = (list) =>
    list && list.length ? list.map(t => `#${t}`).join(' ') : '';

  // "불멍, 포틀럭" → "#불멍 #포틀럭" (재오픈 복원용)
  const commaStringToHashtags = (str = '') =>
    listToHashtagString(
      str.split(',').map(s => s.trim()).filter(Boolean)
    );

  // 버튼 활성화 조건
  const isDisabled =
    partyImages.length < 1 ||               // 최소 1장 이미지
    description.trim().length === 0 ||      // 소개글 필수
    extractTagList(tags).length === 0;    // 태그 1개 이상 필수

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    // 현재 상태 저장
    const clean = enforceFirstThumbnail(stripDuplicatesByUrl(partyImages));
    const tagList = extractTagList(tags);
    const tagsFormatted = tagList.join(', ');
    const tagsInputStr = listToHashtagString(tagList);

    const dataToSave = {
      partyImages: clean,
      description: description.trim(),
      tags: tagsFormatted,
      tagsInput: tagsInputStr,
    };
    setAppliedData(dataToSave);
    onSelect?.({
      partyImages: clean,
      description: dataToSave.description,
      tags: dataToSave.tags,
    });
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
                    배너 사진 및 소개요약
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
                      <Text style={[{color: COLORS.primary_orange}]}>{partyImages.length}</Text>/{MAX_IMAGES}
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
                        disabled={partyImages.length >= MAX_IMAGES}
                      >
                        <AddImage width={30} height={30} />
                      </TouchableOpacity>
      
                      {/* 업로드된 이미지들 */}
                      {partyImages.map((item, idx) => (
                        <View key={idx} style={{ position: 'relative' }}>
                          <TouchableOpacity onPress={() => handleSelectThumbnail(idx)}>
                            <Image
                              source={{ uri: item.imageUrl }}
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
                  

                  {/* 사용자 입력 태그 */}
                  <View>
                    <Text style={[FONTS.fs_16_medium, {marginTop: 20}]}># 태그</Text>
                    <View style={styles.infoRow}>
                      <TextInput
                        style={[styles.tagTextArea, FONTS.fs_14_regular]}
                        value={tags}
                        onChangeText={setTags}
                        multiline
                        maxLength={200}
                        placeholder="#방탈출 #포틀럭 #불멍 #소규모 # 따뜻한"
                        placeholderTextColor={COLORS.grayscale_400}
                      />
                    </View>
                  </View>

                  {/* 간략 소개 */}
                  <View style={styles.titleContainer}>
                    <Text style={[FONTS.fs_16_medium, {marginTop: 20}]}>
                      공고 상단에 들어갈 소개글을 작성해주세요
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

  // 태그 입력
  tagTextArea: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    textAlignVertical: 'top',
    color: COLORS.grayscale_900,
    flex: 1,
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
