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

const translateRoomType = (type) => {
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

const RoomList = ({ rooms }) => {
  const renderItem = ({ item }) => {
    const thumbnailUrl =
      item.roomImages?.find((img) => img.isThumbnail)?.guesthouseImageUrl;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={[FONTS.fs_16_medium, styles.roomName]}>
            {item.roomName}
          </Text>
          <Text style={[FONTS.fs_14_regular, styles.roomSub]}>
            {item.roomCapacity}인실 {translateRoomType(item.roomType)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={[FONTS.fs_16_medium]}>
        등록된 객실
      </Text>

      <FlatList
        data={rooms}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={[FONTS.fs_14_regular, { color: COLORS.grayscale_400, marginTop: 12 }]}>
            객실을 등록해 주세요
          </Text>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default RoomList;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  roomName: {
    color: COLORS.grayscale_900,
    marginBottom: 2,
  },
  roomSub: {
    color: COLORS.grayscale_500,
  },
  addButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

