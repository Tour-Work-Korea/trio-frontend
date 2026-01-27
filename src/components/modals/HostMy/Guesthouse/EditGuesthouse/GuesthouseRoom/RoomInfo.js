import React, { useRef } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { uploadMultiImage } from '@utils/imageUploadHandler';

import XBtn from '@assets/images/x_gray.svg';
import AddImage from '@assets/images/add_image_gray.svg';
import CheckIcon from '@assets/images/star_filled.svg';
import ArrowRight from '@assets/images/arrow_right_black.svg';
import DisabledRadio from '@assets/images/radio_button_disabled.svg';
import EnabledRadio from '@assets/images/radio_button_enabled.svg';

// 키보드
const NEXT_BTN_H = 20;
const NEXT_BTN_GAP = 16;

const RoomInfo = ({ data, setData, onNext }) => {
  // 키보드
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const handleSelectThumbnail = (index) => {
    const updated = data.roomImages.map((img, i) => ({
      ...img,
      isThumbnail: i === index,
    }));
    setData({ ...data, roomImages: updated });
  };

  const handleDeleteImage = (index) => {
    const next = data.roomImages.filter((_, i) => i !== index);
    const hasThumb = next.some((img) => img.isThumbnail);
    const normalized = hasThumb
      ? next
      : next.map((img, i) => ({ ...img, isThumbnail: i === 0 }));
    setData({ ...data, roomImages: normalized });
  };

  const handleAddImage = async () => {
    try {
      const selectedImages = await uploadMultiImage(); // 다중 이미지 선택
      if (!selectedImages) return;

      const hasThumb = data.roomImages.some((img) => img.isThumbnail);
      const formatted = selectedImages.map((url, idx) => ({
        roomImageUrl: url,
        isThumbnail: !hasThumb && idx === 0,
      }));

      const merged = [...data.roomImages, ...formatted].slice(0, 10);
      const safe =
        merged.some((img) => img.isThumbnail)
          ? merged
          : merged.map((img, i) => ({ ...img, isThumbnail: i === 0 }));
      setData({ ...data, roomImages: safe });
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  };

  const handleRewrite = () => {
    setData({ ...data, roomDesc: '' });
  };

  const handleSelectRoomType = (type) => {
    const next = { ...data, roomType: type };
    if (type === 'DORMITORY') {
      next.dormitoryGenderType = null;
      next.femaleOnly = false;
      next.roomMaxCapacity = data.roomCapacity ?? null;
    } else {
      next.dormitoryGenderType = 'MIXED';
      next.femaleOnly = data.femaleOnly ?? false;
    }
    setData(next);
  };

  const renderData =
    data.roomImages.length < 10
      ? [{ __add__: true }, ...data.roomImages]
      : data.roomImages;

  // 유효성 검사
  const isNextDisabled =
    !data.roomType ||
    !data.roomName?.trim() ||
    data.roomImages.length === 0 ||
    !data.roomImages.some((img) => img.isThumbnail) ||
    !data.roomDesc?.trim();

  // 키보드
  const bottomSpace = NEXT_BTN_H + NEXT_BTN_GAP + insets.bottom + 16;

  return (
    <>
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: bottomSpace }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      scrollIndicatorInsets={{ bottom: bottomSpace }}
    >
      {/* 룸 유형 */}
      <Text style={[FONTS.fs_16_medium, styles.title]}>객실 유형</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleSelectRoomType('DORMITORY')}
        >
          {data.roomType === 'DORMITORY' ? (
            <EnabledRadio width={28} height={28} />
          ) : (
            <DisabledRadio width={28} height={28} />
          )}
          <Text style={[FONTS.fs_14_regular, styles.radioLabel]}>도미토리</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => handleSelectRoomType('PRIVATE')}
        >
          {data.roomType === 'PRIVATE' ? (
            <EnabledRadio width={28} height={28} />
          ) : (
            <DisabledRadio width={28} height={28} />
          )}
          <Text style={[FONTS.fs_14_regular, styles.radioLabel]}>일반 객실</Text>
        </TouchableOpacity>
      </View>

      {/* 룸 이름 */}
      <Text style={[FONTS.fs_16_medium, styles.title, {marginTop: 20}]}>객실 이름</Text>
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
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item, index }) => {
            if (item.__add__) {
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

            const offset = data.roomImages.length < 10 ? 1 : 0;
            const effectiveIndex = index - offset;

            return (
              <View>
                <Image source={{ uri: item.roomImageUrl }} style={styles.image} />

                {item.isThumbnail && (
                  <View style={styles.checkIconContainer}>
                    <CheckIcon width={14} height={14} />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteImage(effectiveIndex)}
                >
                  <XBtn width={14} height={14} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectThumbnail(effectiveIndex)}
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
            <Text style={styles.countText}>{data.roomDesc.length}</Text>/500
          </Text>
        </View>
      </View>
      <TextInput
        style={[styles.textArea, FONTS.fs_14_regular]}
        multiline
        maxLength={500}
        placeholder="객실 소개를 입력해 주세요"
        placeholderTextColor={COLORS.grayscale_400}
        value={data.roomDesc}
        onChangeText={(text) => setData({ ...data, roomDesc: text })}
        onFocus={() => {
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 0);
        }}
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
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioLabel: {
    marginLeft: 8,
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
    maxHeight: 360,
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
