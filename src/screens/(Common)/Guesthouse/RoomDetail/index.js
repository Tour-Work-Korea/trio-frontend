import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import styles from './RoomDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import ImageModal from '@components/modals/ImageModal';
import useUserStore from '@stores/userStore';

import LeftArrow from '@assets/images/chevron_left_white.svg';
import {showErrorModal} from '@utils/loginModalHub';

const RoomDetail = ({route}) => {
  const navigation = useNavigation();

  // 호스트 예약 막기
  const userRole = useUserStore(state => state.userRole);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const {
    roomId,
    roomName,
    roomPrice,
    roomDesc,
    guesthouseName,
    checkIn,
    checkOut,
    guestCount,
    roomImages,
    roomCapacity,
    roomType,
  } = route.params;
  const formatTime = timeStr => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };
  const formatDateWithDay = dateStr => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

  // 이미지 처리
  const images = roomImages ?? [];
  const sortedImages = [...images].sort((a, b) =>
    a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1,
  );
  const hasImages = sortedImages.length > 0;
  const thumbnailIndex = Math.max(
    sortedImages.findIndex(i => i?.isThumbnail),
    0,
  );
  const modalImages = sortedImages.map(img => ({
    id: img.id,
    imageUrl: img.roomImageUrl,
  }));

  const {width: SCREEN_W} = Dimensions.get('window');
  const IMAGE_H = 280;

  const [imageIndex, setImageIndex] = useState(thumbnailIndex);

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
            <Carousel
              width={SCREEN_W}
              height={IMAGE_H}
              data={sortedImages}
              defaultIndex={thumbnailIndex} // 썸네일부터 시작
              loop={false}
              autoPlay={false}
              pagingEnabled
              onSnapToItem={idx => setImageIndex(idx)}
              renderItem={({item}) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setImageModalVisible(true)}>
                  <Image
                    source={{uri: item.roomImageUrl}}
                    style={styles.image}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View
              style={[styles.image, {backgroundColor: COLORS.grayscale_200}]}
            />
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <LeftArrow width={28} height={28} />
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
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>
                체크인
              </Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatDateWithDay(checkIn)}
              </Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatTime(checkIn)}
              </Text>
            </View>
            <View style={styles.dateBoxCheckOut}>
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>
                체크아웃
              </Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatDateWithDay(checkOut)}
              </Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatTime(checkOut)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.button}>
        <ButtonScarlet
          title="숙박 예약"
          onPress={() => {
            if (userRole !== 'USER') {
              showErrorModal({
                message: '숙박 예약은\n알바 로그인 후 사용해주세요',
                buttonText2: '취소',
                buttonText: '로그인하기',
                onPress: () => {
                  navigation.navigate('Login');
                },
                onPress2: () => {},
              });
            } else {
              navigation.navigate('GuesthouseReservation', {
                roomId,
                roomName,
                roomPrice,
                guesthouseName,
                checkIn,
                checkOut,
                guestCount,
              });
            }
          }}
        />
      </View>

      {/* 이미지 모달 */}
      {hasImages && (
        <ImageModal
          visible={imageModalVisible}
          title={roomName}
          images={modalImages}
          selectedImageIndex={imageIndex}
          onClose={() => setImageModalVisible(false)}
        />
      )}
    </View>
  );
};

export default RoomDetail;
