import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { uploadMultiImage } from '@utils/imageUploadHandler';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';
import CheckIcon from '@assets/images/star_filled.svg';
import ArrowRight from '@assets/images/arrow_right_black.svg';

const RoomInfo = ({ data, setData, onNext }) => {

  const handleSelectThumbnail = (id) => {
    const updated = data.roomImages.map((img) => ({
      ...img,
      isThumbnail: img.id === id,
    }));
    setData({ ...data, roomImages: updated });
  };

  const handleDeleteImage = (id) => {
    const updated = data.roomImages.filter((img) => img.id !== id);
    setData({ ...data, roomImages: updated });
  };

  const handleAddImage = async () => {
    try {
      const selectedImages = await uploadMultiImage(); // 다중 이미지 선택
      if (!selectedImages) return;

      const formatted = selectedImages.map((url, idx) => ({
        id: Date.now().toString() + idx,
        guesthouseImageUrl: url,
        isThumbnail: data.roomImages.length === 0 && idx === 0,
      }));

      setData({
        ...data,
        roomImages: [...data.roomImages, ...formatted].slice(0, 10),
      });
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  };

  const handleRewrite = () => {
    setData({ ...data, roomDesc: '' });
  };

  const renderData =
    data.roomImages.length < 10
      ? [{ id: 'add_button' }, ...data.roomImages]
      : data.roomImages;

  // 유효성 검사
  const isNextDisabled =
    !data.roomName?.trim() ||
    data.roomImages.length === 0 ||
    !data.roomImages.some((img) => img.isThumbnail) ||
    !data.roomDesc?.trim();

  return (
    <>
    <ScrollView style={{ flex: 1 }}>
      {/* 룸 이름 */}
      <Text style={[FONTS.fs_16_medium, styles.title]}>객실 이름</Text>
      <TextInput
        placeholder="객실 이름을 입력해 주세요"
        placeholderTextColor={COLORS.grayscale_400}
        style={[styles.input, FONTS.fs_14_regular]}
        value={data.roomName}
        onChangeText={(text) => setData({ ...data, roomName: text })}
      />

      {/* 이미지 업로드 */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.title}>
          <View style={styles.subRow}>
            <Text style={[FONTS.fs_16_medium]}>객실 사진</Text>
            <Text style={[FONTS.fs_12_light, {color: COLORS.grayscale_400}]}>
              <Text style={styles.countText}>{data.roomImages.length}</Text>/10
            </Text>
          </View>
          <Text style={[FONTS.fs_12_medium, styles.subText]}>
            대표로 보여줄 사진을 선택해주세요{'\n'}(선택된 사진에는 별이 표시됩니다)
          </Text>
        </View>

       <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={renderData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.id === 'add_button') {
              return (
                <TouchableOpacity
                  style={styles.addImageBox}
                  onPress={handleAddImage}
                  disabled={data.roomImages.length >= 10}
                >
                  <AddImage width={24} height={24} />
                </TouchableOpacity>
              );
            }

            return (
              <View>
                <Image source={{ uri: item.guesthouseImageUrl }} style={styles.image} />

                {item.isThumbnail && (
                  <View style={styles.checkIconContainer}>
                    <CheckIcon width={14} height={14} />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteImage(item.id)}
                >
                  <XBtn width={14} height={14} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectThumbnail(item.id)}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            );
          }}
        />
      </View>

      {/* 소개글 */}
      <View style={[styles.title, {marginTop: 20}]}>
        <View style={styles.subRow}>
          <Text style={[FONTS.fs_16_medium]}>객실을 간략하게 소개해주세요</Text>
          <Text style={[FONTS.fs_12_light, {color: COLORS.grayscale_400}]}>
            <Text style={styles.countText}>{data.roomDesc.length}</Text>/200
          </Text>
        </View>
      </View>
      <TextInput
        style={[styles.textArea, FONTS.fs_14_regular]}
        multiline
        maxLength={200}
        placeholder="객실 소개를 입력해 주세요"
        placeholderTextColor={COLORS.grayscale_400}
        value={data.roomDesc}
        onChangeText={(text) => setData({ ...data, roomDesc: text })}
      />
      <TouchableOpacity onPress={handleRewrite} style={styles.rewriteButton}>
        <Text style={styles.rewriteText}>다시쓰기</Text>
      </TouchableOpacity>

    </ScrollView>

    {/* 다음 버튼 */}
    <TouchableOpacity 
      onPress={onNext} 
      style={styles.nextButton}
      disabled={isNextDisabled}
    >
     <Text
      style={[
        FONTS.fs_14_medium,
        styles.nextText,
        isNextDisabled && { color: COLORS.grayscale_500 },
      ]}
      >
        다음
      </Text>
      <ArrowRight width={24} height={24} />
    </TouchableOpacity>
    </>
  );
};

export default RoomInfo;

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  // 인풋 박스
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
  },

  // 타이틀과 카운트
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countText: {
    color: COLORS.primary_orange,
  },
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
  image: {
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
    zIndex: 10,
  },

  // 방 소개
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  rewriteButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  rewriteText: {
    color: COLORS.grayscale_500,
  },

  // 다음 버튼
  nextButton: {
    position: 'absolute',
    right: 0,
    bottom: 16,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextText: {
    color: COLORS.grayscale_900,
  },
});
