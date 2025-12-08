import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import DraggableFlatList from 'react-native-draggable-flatlist';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {uploadMultiImage} from '@utils/imageUploadHandler';
import ErrorModal from '@components/modals/ErrorModal';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Gray_ImageAdd from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';
import styles from './RecruitmentForm.styles';

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

  // ⭐ 랜덤 id 생성 함수 (내부용)
  const genId = () =>
    `${sectionType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  useEffect(() => {
    if (!visible) return;

    const prevBlocks =
      formData?.introSections?.filter(b => b.sectionType === sectionType) ?? [];

    const sorted = [...prevBlocks].sort(
      (a, b) => (a.blockOrder ?? 0) - (b.blockOrder ?? 0),
    );

    setBlocks(
      sorted.length
        ? sorted.map((b, idx) => ({
            ...b,
            // 이미 localId가 있으면 유지, 없으면 새로 부여
            localId: b.localId ?? genId() + `-${idx}`,
          }))
        : [
            {
              sectionType,
              title: '',
              content: '',
              imgUrl: '',
              blockOrder: 1,
              localId: genId(),
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
        localId: genId(),
      },
    ]);
  };

  // ⭐ index 대신 localId로 삭제
  const removeBlock = localId => {
    if (blocks.length === 1) {
      setErrorModal({
        visible: true,
        title: '단락은 최소 1개 이상 필요해요.',
      });
      return;
    }
    const next = blocks.filter(b => b.localId !== localId);
    const reordered = next.map((b, i) => ({...b, blockOrder: i + 1}));
    setBlocks(reordered);
  };

  // ⭐ index 대신 localId로 업데이트
  const updateBlock = (localId, field, value) => {
    setBlocks(prev =>
      prev.map(b => (b.localId === localId ? {...b, [field]: value} : b)),
    );
  };

  const pickImage = async localId => {
    const uploadedUrls = await uploadMultiImage(1);
    if (!uploadedUrls?.length) return;
    updateBlock(localId, 'imgUrl', uploadedUrls[0]);
  };

  const removeImage = localId => {
    updateBlock(localId, 'imgUrl', '');
  };

  const handleSave = () => {
    // 내부용 localId는 그대로 두고, 마지막에만 제거해서 formData에 넣기
    const cleaned = blocks
      .map(b => ({
        ...b,
        title: (b.title ?? '').trim(),
        content: (b.content ?? '').trim(),
        imgUrl: (b.imgUrl ?? '').trim(),
      }))
      .filter(b => b.title || b.content || b.imgUrl);

    if (cleaned.length === 0) {
      setErrorModal({
        visible: true,
        title: '이미지/제목/내용 중 하나 이상 입력된 단락이 필요해요.',
      });
      return;
    }

    const reordered = cleaned.map((b, i) => ({
      sectionType,
      title: b.title,
      content: b.content,
      imgUrl: b.imgUrl || null,
      blockOrder: i + 1,
      // localId는 formData로 안 보냄
    }));

    const others =
      formData?.introSections?.filter(b => b.sectionType !== sectionType) ?? [];

    handleInputChange('introSections', [...others, ...reordered]);
    onClose();
  };

  // ⭐ DraggableFlatList용 렌더 함수 (index 대신 localId 사용)
  const renderBlockItem = ({item, drag, isActive}) => {
    // 현재 순서 계산 (단락 번호 표시용)
    const idx = blocks.findIndex(b => b.localId === item.localId);
    const displayIndex = idx === -1 ? 0 : idx;

    return (
      <View
        style={[
          local.blockCard,
          isActive && {shadowOpacity: 0.2, transform: [{scale: 0.99}]},
        ]}>
        <View style={local.blockHeader}>
          <View style={local.blockHeaderLeft}>
            {/* 드래그 핸들 */}
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={150}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={local.dragHandle}>
              <Text style={local.dragHandleText}>≡</Text>
            </TouchableOpacity>
            <Text style={local.blockTitle}>단락 {displayIndex + 1}</Text>
          </View>

          <TouchableOpacity onPress={() => removeBlock(item.localId)}>
            <Text style={local.removeText}>삭제</Text>
          </TouchableOpacity>
        </View>

        {/* 이미지 */}
        {item.imgUrl ? (
          <View style={{position: 'relative', marginBottom: 8}}>
            <Image
              source={{uri: item.imgUrl}}
              style={local.blockImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={local.removeImageBtn}
              onPress={() => removeImage(item.localId)}>
              <XBtn width={14} height={14} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={local.addPhotoButton}
            onPress={() => pickImage(item.localId)}>
            <Gray_ImageAdd width={28} height={28} />
            <Text style={local.addPhotoText}>이미지 추가</Text>
          </TouchableOpacity>
        )}

        {/* 제목 */}
        <TextInput
          style={local.input}
          placeholder="단락 제목 (선택)"
          placeholderTextColor={COLORS.grayscale_400}
          value={item.title}
          maxLength={100}
          onChangeText={text => updateBlock(item.localId, 'title', text)}
        />

        {/* 내용 */}
        <TextInput
          style={[local.input, local.textarea]}
          placeholder="단락 내용 (선택)"
          placeholderTextColor={COLORS.grayscale_400}
          value={item.content}
          multiline
          maxLength={5000}
          onChangeText={text => updateBlock(item.localId, 'content', text)}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <GestureHandlerRootView style={local.flex}>
        <KeyboardAvoidingView
          style={local.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              <ScrollView
                style={local.flex}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled">
                <DraggableFlatList
                  data={blocks}
                  keyExtractor={item => item.localId}
                  renderItem={renderBlockItem}
                  onDragEnd={({data}) => {
                    setBlocks(data);
                  }}
                  contentContainerStyle={{paddingBottom: 24}}
                  ListHeaderComponent={
                    !!headerSubtitle && (
                      <Text style={local.subtitle}>{headerSubtitle}</Text>
                    )
                  }
                  ListFooterComponent={
                    <View>
                      <TouchableOpacity
                        style={local.addBlockBtn}
                        onPress={addBlock}>
                        <Text style={local.addBlockText}>+ 단락 추가</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={local.saveBtn}
                        onPress={handleSave}>
                        <Text style={local.saveText}>저장하기</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
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
      </GestureHandlerRootView>
    </Modal>
  );
}

const local = StyleSheet.create({
  flex: {flex: 1},
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
  blockHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 6,
  },
  dragHandleText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_500,
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
