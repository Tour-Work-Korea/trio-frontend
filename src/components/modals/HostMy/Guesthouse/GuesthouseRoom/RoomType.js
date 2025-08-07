import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import DisabledRadio from '@assets/images/radio_button_disabled.svg';
import EnabledRadio from '@assets/images/radio_button_enabled.svg';
import ArrowLeft from '@assets/images/arrow_left_black.svg';

const ROOM_SIZES = ['1', '2', '3', '4', '5', '6', '7', '8'];

const RoomType = ({ data, setData, onBack, onApply }) => {
  const isSelectedSize = (val) => data.roomCapacity?.toString() === val;
  const isEtc = !ROOM_SIZES.includes(data.roomCapacity?.toString());

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
    <View style={{ flex: 1 }}>
      {/* 객실 타입 */}
      <Text style={[FONTS.fs_14_semibold, { marginBottom: 12 }]}>객실 타입</Text>
      <View style={styles.roomGrid}>
        {ROOM_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={styles.radioRow}
            onPress={() => handleSelectRoomSize(size)}
          >
            {isSelectedSize(size) ? (
              <EnabledRadio width={20} height={20} />
            ) : (
              <DisabledRadio width={20} height={20} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.radioLabel]}>{size}인실</Text>
          </TouchableOpacity>
        ))}

        {/* 기타 */}
        <View style={[styles.radioRow, { flex: 1 }]}>
          <TouchableOpacity
            onPress={() => handleSelectRoomSize(data.roomCapacity || '')}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {isEtc ? (
              <EnabledRadio width={20} height={20} />
            ) : (
              <DisabledRadio width={20} height={20} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.radioLabel]}>기타</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.etcInput, isEtc ? styles.inputEnabled : styles.inputDisabled]}
            editable={isEtc}
            keyboardType="numeric"
            placeholder="기타 인원을 입력해주세요"
            value={isEtc ? String(data.roomCapacity) : ''}
            onChangeText={handleEtcChange}
          />
        </View>
      </View>

      {/* 객실 이용대상 */}
      <Text style={[FONTS.fs_14_semibold, { marginTop: 32, marginBottom: 12 }]}>
        객실 이용대상
      </Text>
      <View style={styles.horizontalRow}>
        {['MIXED', 'MALE_ONLY', 'FEMALE_ONLY'].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioRow}
            onPress={() => handleSelectRoomType(type)}
          >
            {data.roomType === type ? (
              <EnabledRadio width={20} height={20} />
            ) : (
              <DisabledRadio width={20} height={20} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.radioLabel]}>
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
      <Text style={[FONTS.fs_14_semibold, { marginTop: 32, marginBottom: 8 }]}>
        객실 가격
      </Text>
      <View style={styles.priceRow}>
        <TextInput
          style={styles.priceInput}
          value={data.roomPrice?.toString()}
          keyboardType="numeric"
          onChangeText={handlePriceChange}
          placeholder="객실 가격을 입력해 주세요"
        />
        <Text style={[FONTS.fs_14_regular, { marginLeft: 8 }]}>원</Text>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft width={16} height={16} />
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
          <Text style={[FONTS.fs_14_medium, { color: COLORS.grayscale_0 }]}>
            적용하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoomType;

const styles = StyleSheet.create({
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  radioLabel: {
    marginLeft: 4,
    color: COLORS.grayscale_900,
  },
  etcInput: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
  },
  inputDisabled: {
    borderColor: COLORS.grayscale_200,
    color: COLORS.grayscale_300,
    backgroundColor: COLORS.grayscale_100,
  },
  inputEnabled: {
    borderColor: COLORS.grayscale_400,
    color: COLORS.grayscale_900,
    backgroundColor: COLORS.grayscale_0,
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.grayscale_900,
  },
  buttonRow: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyButton: {
    backgroundColor: COLORS.primary_orange,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});
