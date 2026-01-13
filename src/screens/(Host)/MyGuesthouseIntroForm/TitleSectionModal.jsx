import React, {useState} from 'react';
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
  Platform,
} from 'react-native';

import {uploadMultiImage} from '@utils/imageUploadHandler';
import AlertModal from '@components/modals/AlertModal';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Gray_ImageAdd from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';
import styles from './MyGuesthouseIntroForm.styles';

import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

export default function TitleSectionModal({
  formData,
  visible,
  onClose,
  handleInputChange,
}) {
  const limitImage = 6;
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

  const {scrollRef, contentContainerStyle, registerInput} =
    useKeyboardAwareScrollView({
      basePaddingBottom: 24,
      extraScrollOffset: 16,
      scrollDelay: 80,
      iosOnly: true,
    });

  const titleField = registerInput('title');
  const tagsField = registerInput('tags');

  const pickImage = async () => {
    const currentLen = formData?.introImages?.length ?? 0;
    const limit = limitImage - currentLen;

    if (limit <= 0) {
      setErrorModal({
        visible: true,
        title: `최대 ${limitImage}장까지 등록 가능합니다.`,
      });
      return;
    }

    const uploadedUrls = await uploadMultiImage(limit);
    if (!uploadedUrls?.length) return;

    const baseLen = currentLen;
    const newImages = uploadedUrls.map((url, idx) => ({
      imgUrl: url,
      isThumbnail: baseLen === 0 && idx === 0,
    }));

    handleInputChange('introImages', [
      ...(formData.introImages ?? []),
      ...newImages,
    ]);
  };

  const removePhoto = index => {
    const next = (formData.introImages ?? []).filter((_, i) => i !== index);

    // 썸네일이 사라졌으면 첫 번째를 썸네일로 승격
    if (next.length > 0 && !next.some(img => img.isThumbnail)) {
      next[0] = {...next[0], isThumbnail: true};
    }

    handleInputChange('introImages', next);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex: 1}} enabled behavior={Platform.OS === 'ios' ? 'padding' : undefined}> 
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View />
              <Text style={local.headerText}>소개 글 제목</Text>
              <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              contentContainerStyle={contentContainerStyle}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* ✅ 소개 이미지 추가 */}
              <View>
                <View style={styles.dateRow}>
                  <Text style={styles.subsectionTitle}>
                    소개 사진을 추가해주세요
                  </Text>
                  <Text style={local.lengthTextAll}>
                    <Text style={local.lengthText}>
                      {limitImage - (formData?.introImages?.length ?? 0)}
                    </Text>
                    /{limitImage}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={pickImage}
                  disabled={
                    (formData?.introImages?.length ?? 0) === limitImage
                  }>
                  <Gray_ImageAdd width={30} height={30} />
                </TouchableOpacity>

                <View style={styles.photoGrid}>
                  {(formData?.introImages ?? []).map((imageObj, index) => (
                    <View key={index}>
                      <Image
                        source={{uri: imageObj.imgUrl}}
                        style={[
                          styles.photoItem,
                          imageObj.isThumbnail ? styles.thumbnail : null,
                        ]}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}>
                        <XBtn width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* ✅ 제목/태그 입력 영역 (네가 준 코드 그대로) */}
              <View style={{marginTop: 16}}>
                <View onLayout={titleField.onLayout}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.label}>제목</Text>
                    <Text style={styles.lengthTextAll}>
                      <Text style={styles.lengthText}>
                        {formData.title?.length?.toLocaleString()}
                      </Text>
                      /50
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="ex) 아늑하고 따뜻한 분위기의 제주 게스트하우스"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={formData.title}
                    maxLength={50}
                    onChangeText={text => handleInputChange('title', text)}
                    onFocus={titleField.onFocus}
                  />
                </View>

                <View style={{marginTop: 12}} onLayout={tagsField.onLayout}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.label}>
                      #태그로 게스트하우스의 특징을 보여주세요
                    </Text>
                    <Text style={styles.lengthTextAll}>
                      <Text style={styles.lengthText}>
                        {formData.tags?.length?.toLocaleString()}
                      </Text>
                      /100
                    </Text>
                  </View>
                  <TextInput
                    style={[styles.input, {marginTop: 6}]}
                    placeholder="#제주시 #뚜벅이 #포틀럭"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={formData.tags}
                    maxLength={100}
                    onChangeText={text => handleInputChange('tags', text)}
                    onFocus={tagsField.onFocus}
                  />
                </View>
              </View>
            </ScrollView>
          </View>

          <AlertModal
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
  lengthTextAll: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
  lengthText: {color: COLORS.primary_orange},
});
