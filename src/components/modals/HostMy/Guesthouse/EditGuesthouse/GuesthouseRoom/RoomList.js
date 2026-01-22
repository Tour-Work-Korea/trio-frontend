import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import DeleteIcon from '@assets/images/delete_gray.svg';
import EditIcon from '@assets/images/edit_gray.svg';

const translateRoomType = (type) => {
  switch (type) {
    case 'DORMITORY':
      return '도미토리';
    case 'PRIVATE':
      return '일반 객실';
    default:
      return '';
  }
};

const translateDormitoryGender = (type) => {
  switch (type) {
    case 'FEMALE_ONLY':
      return '여성전용';
    case 'MALE_ONLY':
      return '남성전용';
    case 'MIXED':
      return '혼숙';
    default:
      return '';
  }
};

const RoomList = ({ rooms, onDelete, onEdit }) => {
  const renderItem = ({ item, index }) => {
    const thumbnailUrl =
      item.roomImages?.find((img) => img.isThumbnail)?.roomImageUrl;
    const roomTypeText = translateRoomType(item.roomType);
    const dormitoryText =
      item.roomType === 'DORMITORY'
        ? translateDormitoryGender(item.dormitoryGenderType)
        : '';
    const roomMeta =
      roomTypeText && dormitoryText
        ? `${roomTypeText}(${dormitoryText})`
        : roomTypeText;

    return (
      <View style={styles.card}>
        <View style={styles.leftRow}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.image}
          />
          <View style={styles.textContainer}>
            <Text
              style={[FONTS.fs_16_semibold, styles.roomName]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.roomName}
            </Text>
            <Text style={[FONTS.fs_16_regular, styles.roomSub]}>
              {item.roomCapacity}인실 {roomMeta}
            </Text>
            <Text style={[FONTS.fs_14_semibold, styles.roomSub]}>
              {item.roomPrice}원
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => onEdit?.(item.id, index)}>
            <EditIcon width={24} height={24}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(item.id, index)}>
            <DeleteIcon width={24} height={24}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={[FONTS.fs_16_medium, {marginBottom: 8}]}>
        등록된 객실
      </Text>

      <FlatList
        data={rooms}
        keyExtractor={(item, index) =>
          item?.id != null ? String(item.id) : `local-${index}`
        }
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <Text style={[FONTS.fs_14_regular, { color: COLORS.grayscale_400, marginTop: 12 }]}>
            객실을 등록해 주세요
          </Text>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
};

export default RoomList;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  // 객실 리스트
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  roomName: {
    marginBottom: 4,
    flexShrink: 1,
  },
  roomSub: {
    marginBottom: 4,
    color: COLORS.grayscale_500,
  },

  // 수정, 삭제 버튼
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
