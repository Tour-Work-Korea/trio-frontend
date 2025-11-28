import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';

import {uploadMultiImage} from '@utils/imageUploadHandler';
import ErrorModal from '@components/modals/ErrorModal';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Gray_ImageAdd from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';
import styles from './RecruitmentForm.styles'; // modal 공통 스타일 재사용

export default function IntroSectionModal({
  visible,
  onClose,
  sectionType, // 'GREETING' | 'SPACE' | 'LIFE'
  headerTitle,
  headerSubtitle,
  formData,
  handleInputChange,
  maxBlocks = 10,
}) {
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (!visible) return;

    const prevBlocks =
      formData?.introSections?.filter(b => b.sectionType === sectionType) ?? [];

    const sorted = [...prevBlocks].sort(
      (a, b) => (a.blockOrder ?? 0) - (b.blockOrder ?? 0),
    );

    setBlocks(
      sorted.length
        ? sorted
        : [
            {
              sectionType,
              title: '',
              content: '',
              imgUrl: '',
              blockOrder: 1,
            },
          ],
    );
  }, [visible, formData?.introSections, sectionType]);

  const addBlock = () => {
    if (blocks.length >= maxBlocks) {
      setErrorModal({
        visible: true,
        title: `최대 ${maxBlocks}개의 단락만 추가할 수 있어요.`,
      });
      return;
    }
    setBlocks(prev => [
      ...prev,
      {
        sectionType,
        title: '',
        content: '',
        imgUrl: '',
        blockOrder: prev.length + 1,
      },
    ]);
  };

  const removeBlock = idx => {
    if (blocks.length === 1) {
      setErrorModal({
        visible: true,
        title: '단락은 최소 1개 이상 필요해요.',
      });
      return;
    }
    const next = blocks.filter((_, i) => i !== idx);
    const reordered = next.map((b, i) => ({...b, blockOrder: i + 1}));
    setBlocks(reordered);
  };

  const updateBlock = (idx, field, value) => {
    setBlocks(prev =>
      prev.map((b, i) => (i === idx ? {...b, [field]: value} : b)),
    );
  };

  const pickImage = async idx => {
    const uploadedUrls = await uploadMultiImage(1);
    if (!uploadedUrls?.length) return;
    updateBlock(idx, 'imgUrl', uploadedUrls[0]);
  };

  const removeImage = idx => {
    updateBlock(idx, 'imgUrl', '');
  };

  const handleSave = () => {
    // ✅ 완전 빈 단락 제거 (title/content/imgUrl 모두 비면 제거)
    const cleaned = blocks
      .map(b => ({
        sectionType,
        title: (b.title ?? '').trim(),
        content: (b.content ?? '').trim(),
        imgUrl: (b.imgUrl ?? '').trim(),
      }))
      .filter(b => b.title || b.content || b.imgUrl); // 하나라도 있으면 저장

    if (cleaned.length === 0) {
      setErrorModal({
        visible: true,
        title: '이미지/제목/내용 중 하나 이상 입력된 단락이 필요해요.',
      });
      return;
    }

    const reordered = cleaned.map((b, i) => ({
      ...b,
      imgUrl: b.imgUrl || null,
      blockOrder: i + 1,
    }));

    const others =
      formData?.introSections?.filter(b => b.sectionType !== sectionType) ?? [];

    handleInputChange('introSections', [...others, ...reordered]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex: 1}} enabled>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View />
              <Text style={local.headerText}>{headerTitle}</Text>
              <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{paddingBottom: 24}}>
              {!!headerSubtitle && (
                <Text style={local.subtitle}>{headerSubtitle}</Text>
              )}

              {blocks.map((block, idx) => (
                <View key={idx} style={local.blockCard}>
                  <View style={local.blockHeader}>
                    <Text style={local.blockTitle}>단락 {idx + 1}</Text>
                    <TouchableOpacity onPress={() => removeBlock(idx)}>
                      <Text style={local.removeText}>삭제</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 이미지 */}
                  {block.imgUrl ? (
                    <View style={{position: 'relative', marginBottom: 8}}>
                      <Image
                        source={{uri: block.imgUrl}}
                        style={local.blockImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={local.removeImageBtn}
                        onPress={() => removeImage(idx)}>
                        <XBtn width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={local.addPhotoButton}
                      onPress={() => pickImage(idx)}>
                      <Gray_ImageAdd width={28} height={28} />
                      <Text style={local.addPhotoText}>이미지 추가</Text>
                    </TouchableOpacity>
                  )}

                  {/* 제목 */}
                  <TextInput
                    style={local.input}
                    placeholder="단락 제목 (선택)"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={block.title}
                    maxLength={100}
                    onChangeText={text => updateBlock(idx, 'title', text)}
                  />

                  {/* 내용 */}
                  <TextInput
                    style={[local.input, local.textarea]}
                    placeholder="단락 내용 (선택)"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={block.content}
                    multiline
                    maxLength={5000}
                    onChangeText={text => updateBlock(idx, 'content', text)}
                  />
                </View>
              ))}

              {/* 단락 추가 */}
              <TouchableOpacity style={local.addBlockBtn} onPress={addBlock}>
                <Text style={local.addBlockText}>+ 단락 추가</Text>
              </TouchableOpacity>

              {/* 저장 */}
              <TouchableOpacity style={local.saveBtn} onPress={handleSave}>
                <Text style={local.saveText}>저장하기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <ErrorModal
            visible={errorModal.visible}
            title={errorModal.title}
            buttonText={'확인'}
            onPress={() => setErrorModal({visible: false, title: ''})}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const local = StyleSheet.create({
  headerText: {...FONTS.fs_20_semibold},
  subtitle: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_600,
    marginBottom: 12,
  },

  blockCard: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 12,
    marginBottom: 12,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockTitle: {...FONTS.fs_14_semibold, color: COLORS.grayscale_900},
  removeText: {...FONTS.fs_12_medium, color: COLORS.grayscale_500},

  addPhotoButton: {
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.grayscale_300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  addPhotoText: {...FONTS.fs_12_medium, color: COLORS.grayscale_500},

  blockImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  removeImageBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.grayscale_0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },

  addBlockBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  addBlockText: {...FONTS.fs_14_semibold, color: COLORS.grayscale_700},

  saveBtn: {
    backgroundColor: COLORS.primary_orange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {...FONTS.fs_16_semibold, color: COLORS.grayscale_0},
});
