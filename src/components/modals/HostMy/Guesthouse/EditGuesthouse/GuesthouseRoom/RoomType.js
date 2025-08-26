import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import DisabledRadio from '@assets/images/radio_button_disabled.svg';
import EnabledRadio from '@assets/images/radio_button_enabled.svg';
import ArrowLeft from '@assets/images/arrow_left_black.svg';

const ROOM_SIZES = ['1', '2', '3', '4', '5', '6', '7', '8'];

const RoomType = ({ data, setData, onBack, onApply }) => {
  const isSelectedSize = (val) =>
    data.roomCapacity !== null &&
    data.roomCapacity !== undefined &&
    data.roomCapacity.toString() === val;
  const isEtc =
    data.roomCapacity !== null &&
    data.roomCapacity !== undefined &&
    !ROOM_SIZES.includes(data.roomCapacity.toString());

  const handleSelectRoomSize = (val) => {
    setData({
      ...data,
      roomCapacity: val,
    });
  };

  const handleSelectRoomType = (type) => {
    setData({
      ...data,
      roomType: type,
    });
  };

  const handlePriceChange = (text) => {
    const onlyNums = text.replace(/[^0-9]/g, '');
    setData({
      ...data,
      roomPrice: onlyNums,
    });
  };

  const handleEtcChange = (text) => {
    setData({
      ...data,
      roomCapacity: text,
    });
  };

  const isDisabled =
    !data.roomCapacity ||
    !data.roomType ||
    !data.roomPrice ||
    isNaN(Number(data.roomPrice));

  return (
    <>
    <ScrollView style={{ flex: 1, marginBottom: 120}}>
      {/* 객실 타입 */}
      <Text style={[FONTS.fs_16_medium, styles.title]}>객실 타입</Text>
      <View style={styles.roomGrid}>
        {ROOM_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={styles.radioRow}
            onPress={() => handleSelectRoomSize(size)}
          >
            {isSelectedSize(size) ? (
              <EnabledRadio width={28} height={28} />
            ) : (
              <DisabledRadio width={28} height={28} />
            )}
            <Text style={[FONTS.fs_14_medium, styles.radioLabel]}>{size}인실</Text>
          </TouchableOpacity>
        ))}

        {/* 기타 */}
        <View style={[styles.radioRow, { flex: 1 }]}>
          <TouchableOpacity
            onPress={() => setData({ ...data, roomCapacity: '' })}
            style={styles.radioTextContent}
          >
            {isEtc ? (
              <EnabledRadio width={28} height={28} />
            ) : (
              <DisabledRadio width={28} height={28} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.radioLabel, {marginHorizontal: 8}]}>기타</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.etcInput}
            editable={isEtc}
            keyboardType="numeric"
            placeholder="기타 인원을 입력해주세요"
            placeholderTextColor={COLORS.grayscale_400}
            value={isEtc ? String(data.roomCapacity) : ''}
            onChangeText={handleEtcChange}
          />
        </View>
      </View>

      {/* 객실 이용대상 */}
      <Text style={[styles.title, FONTS.fs_16_medium, {marginTop: 20}]}>
        객실 이용대상
      </Text>
      <View style={styles.horizontalRow}>
        {['MIXED', 'MALE_ONLY', 'FEMALE_ONLY'].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.horizontalRadioRow}
            onPress={() => handleSelectRoomType(type)}
          >
            {data.roomType === type ? (
              <EnabledRadio width={28} height={28} />
            ) : (
              <DisabledRadio width={28} height={28} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.radioLabel, {marginLeft: 8}]}>
              {type === 'MIXED'
                ? '혼숙'
                : type === 'MALE_ONLY'
                ? '남성전용'
                : '여성전용'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 객실 가격 */}
      <Text style={[styles.title, FONTS.fs_16_medium, {marginTop: 20}]}>
        객실 가격
      </Text>
      <View style={styles.priceRow}>
        <TextInput
          style={styles.priceInput}
          value={data.roomPrice?.toString()}
          keyboardType="numeric"
          onChangeText={handlePriceChange}
          placeholderTextColor={COLORS.grayscale_400}
          placeholder="객실 가격을 입력해 주세요"
        />
        <Text style={[FONTS.fs_14_regular, { marginLeft: 8 }]}>원</Text>
      </View>
    </ScrollView>

    {/* 하단 버튼 */}
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft width={24} height={24} />
        <Text style={FONTS.fs_14_medium}>이전</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.applyButton,
          isDisabled && { backgroundColor: COLORS.grayscale_200 },
        ]}
        disabled={isDisabled}
        onPress={onApply}
      >
        <Text 
          style={[
            FONTS.fs_14_medium,
            styles.applyButtonText,
            isDisabled && { color: COLORS.grayscale_400 },
          ]}
        >
          적용하기
        </Text>
      </TouchableOpacity>
    </View>
    </>
  );
};

export default RoomType;

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },

  // 몇 인실
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    justifyContent: 'space-between',
  },
  radioLabel: {
  },
  radioTextContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etcInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    borderColor: COLORS.grayscale_200,
  },
  
  // 성별
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  horizontalRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 가격
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
  },

  // 버튼
  buttonRow: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
  },
  applyButton: {
    backgroundColor: COLORS.primary_orange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: COLORS.grayscale_0,
  },
});
