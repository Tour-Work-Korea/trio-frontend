import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import styles from './MyRoomDetail.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ImageModal from '@components/modals/ImageModal';

import LeftArrow from '@assets/images/chevron_left_white.svg';

const MyRoomDetail = ({ route }) => {
  const navigation = useNavigation();
  
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const { roomName, roomPrice, roomDesc, checkIn, checkOut, roomImages, roomCapacity, roomType } = route.params;
  const formatTime = (timeStr) => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid()
        ? date.format('HH:mm')
        : timeStr.slice(0, 5);
  };
  const formatDateWithDay = (dateStr) => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

  // 이미지 처리
  const hasImages = roomImages?.length > 0;
  const thumbnailImage =
    roomImages?.find((img) => img.isThumbnail)?.roomImageUrl ||
    roomImages?.[0]?.roomImageUrl;

  const modalImages = roomImages?.map((img) => ({
    id: img.id,
    imageUrl: img.roomImageUrl,
  })) || [];

  const roomTypeMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {hasImages ? (
            <TouchableOpacity onPress={() => setImageModalVisible(true)}>
              <Image source={{ uri: thumbnailImage }} style={styles.image} />
            </TouchableOpacity>
          ) : (
            <View
            style={[styles.image, { backgroundColor: COLORS.grayscale_200 }]}
            />
          )}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <LeftArrow width={28} height={28}/>
            </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.roomInfo}>
            <Text style={[FONTS.fs_20_semibold, styles.roomType]}>
              {roomName}
            </Text>
            <Text style={[FONTS.fs_14_medium, {marginVertical: 4}]}>
              {roomCapacity}인실 {roomTypeMap[roomType] || ''}
            </Text>
            <Text style={[FONTS.fs_14_regular, styles.description]}>
              {roomDesc}
            </Text>
            <Text style={[FONTS.fs_20_bold, styles.price]}>
              {roomPrice.toLocaleString()}원
            </Text>
          </View>

          <Text style={[FONTS.fs_16_medium, styles.dateTitle]}>선택 날짜</Text>
          <View style={styles.dateBoxContainer}>
            <View style={styles.dateBoxCheckIn}>
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크인</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkIn)}</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkIn)}</Text>
            </View>
            <View style={styles.dateBoxCheckOut}>
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크아웃</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkOut)}</Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkOut)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 이미지 모달 */}
      {hasImages && (
          <ImageModal
              visible={imageModalVisible}
              title={roomName}
              images={modalImages}
              selectedImageIndex={0}
              onClose={() => setImageModalVisible(false)}
          />
      )}
    </View>
  );
};

export default MyRoomDetail;
