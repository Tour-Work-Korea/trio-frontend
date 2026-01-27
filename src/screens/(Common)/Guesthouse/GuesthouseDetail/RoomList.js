import React from 'react';
import {View, Text, Image, TouchableOpacity, Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';

import RightArrow from '@assets/images/chevron_right_blue.svg';

const RoomList = ({
  detail,
  guesthouseId,
  localCheckIn,
  localCheckOut,
  localAdults,
  localChildren,
}) => {
  const navigation = useNavigation();
  const userRole = useUserStore(state => state.userRole);
  const formatTime = timeStr => (timeStr ? timeStr.slice(0, 5) : '');
  const totalGuestCount = localAdults + localChildren;
  const dormitoryGenderMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };

  const getThumbnailImage = room =>
    room.roomImages?.find(img => img.isThumbnail)?.roomImageUrl ||
    room.roomImages?.[0]?.roomImageUrl;

  const goRoomDetail = (room, guestCountOverride) => {
    navigation.navigate('RoomDetail', {
      roomId: room.id,
      roomName: room.roomName,
      roomPrice: room.roomPrice,
      roomDesc: room.roomDesc,
      roomCapacity: room.roomCapacity,
      roomType: room.roomType,
      dormitoryGenderType: room.dormitoryGenderType,
      roomMaxCapacity: room.roomMaxCapacity,
      femaleOnly: room.femaleOnly,
      guesthouseName: detail.guesthouseName,
      guesthouseId,
      guesthouseAddress: detail.guesthouseAddress,
      guesthouseAddressDetail: detail.guesthouseAddressDetail,
      guesthousePhone: detail.guesthousePhone,
      checkIn: `${localCheckIn}T${detail.checkIn}`,
      checkOut: `${localCheckOut}T${detail.checkOut}`,
      checkInTime: detail.checkIn,
      checkOutTime: detail.checkOut,
      guestCount: guestCountOverride ?? totalGuestCount,
      roomImages: room.roomImages || [],
      totalPrice: room.totalPrice ?? detail.totalPrice,
    });
  };

  const handleReservationPress = (room, guestCount) => {
    if (userRole !== 'USER') {
      showErrorModal({
        message: '숙박 예약은\n 로그인 후 사용해주세요',
        buttonText2: '취소',
        buttonText: '로그인하기',
        onPress: () => {
          navigation.navigate('Login');
        },
        onPress2: () => {},
      });
      return;
    }

    if (detail.guesthouseName === '비지터 게스트하우스') {
      const url =
        'https://m.place.naver.com/accommodation/1017382020/room?entry=plt&businessCategory=guesthouse';
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('알림', '링크를 열 수 없어요');
          }
        })
        .catch(() => {
          Alert.alert('알림', '링크를 여는 중 오류가 발생했어요');
        });
      return;
    }

    if (detail.guesthouseName === '베드라디오 동문점') {
      const url =
        'https://m.place.naver.com/accommodation/1982132289/room?entry=pll&businessCategory=guesthouse';
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('알림', '링크를 열 수 없어요');
          }
        })
        .catch(() => {
          Alert.alert('알림', '링크를 여는 중 오류가 발생했어요');
        });
      return;
    }

    navigation.navigate('GuesthouseReservation', {
      roomId: room.id,
      roomName: room.roomName,
      roomPrice: room.roomPrice,
      guesthouseName: detail.guesthouseName,
      guesthouseId,
      guesthouseAddress: detail.guesthouseAddress,
      guesthouseAddressDetail: detail.guesthouseAddressDetail,
      guesthousePhone: detail.guesthousePhone,
      checkIn: `${localCheckIn}T${detail.checkIn}`,
      checkOut: `${localCheckOut}T${detail.checkOut}`,
      checkInTime: detail.checkIn,
      checkOutTime: detail.checkOut,
      guestCount,
      totalPrice: room.totalPrice ?? detail.totalPrice,
      roomType: room.roomType,
      dormitoryGenderType: room.dormitoryGenderType,
      roomCapacity: room.roomCapacity,
      roomMaxCapacity: room.roomMaxCapacity,
      femaleOnly: room.femaleOnly,
    });
  };

  const renderCommonCardShell = (room, topInfoNode, reserved, guestCount) => {
    const thumbnailImage = getThumbnailImage(room);
    
    return (
      <View>
        <View style={styles.roomCard}>
          {thumbnailImage ? (
            <Image source={{uri: thumbnailImage}} style={styles.roomImage} />
          ) : (
            <View
              style={[styles.roomImage, {backgroundColor: COLORS.grayscale_0}]}
            />
          )}

          <View style={styles.roomInfo}>
            <View style={styles.roomNameDescContainer}>
              <View style={[styles.roomInfoRow, {gap: 4}]}>
                <View style={styles.roomNameTextWrapper}>
                  <Text
                    style={[FONTS.fs_16_semibold, styles.roomType]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {room.roomName}
                  </Text>
                </View>
                <Text style={[FONTS.fs_18_semibold, styles.roomPrice]}>
                  {room.roomPrice?.toLocaleString()}원
                </Text>
              </View>

              {/* 하단쪽 분기 */}
              {topInfoNode}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 도미토리 카드
  const renderDormitoryRoom = (room, reserved) => {
    const genderText = dormitoryGenderMap[room.dormitoryGenderType] || '';
    const remaining = typeof room.remaining === 'number' ? room.remaining : 0;
    const isGuestCountOverRemaining = totalGuestCount > remaining;
    const dormitoryInfo = (
      <>
        <View style={styles.roomInfoRow}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.roomType,
                {color: COLORS.grayscale_500},
              ]}>
              [{room.roomCapacity}인 도미토리]
            </Text>
            {room.dormitoryGenderType !== 'MIXED' && !!genderText && (
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.roomType,
                  {color: COLORS.grayscale_500},
                ]}>
                , {genderText}
              </Text>
            )}
          </View>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.roomType,
              {color: COLORS.grayscale_500},
            ]}>
              1베드 당
            </Text>
        </View>

        <View style={styles.checkTimeContainer}>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            입실 {formatTime(detail.checkIn)}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            퇴실 {formatTime(detail.checkOut)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.roomDetailBtn}
          onPress={() => {
            goRoomDetail(room, totalGuestCount);
          }}
        >
          <Text style={[FONTS.fs_14_medium, styles.roomDetailBtnText]}>
            상세보기
          </Text>
          <RightArrow width={16} height={16}/>
        </TouchableOpacity>

        <View style={styles.roomInfoBottomRow}>
          <View style={styles.remainingRow}>
            <Text style={[FONTS.fs_14_medium, styles.remainingText]}>베드 수</Text>
            <Text style={[FONTS.fs_14_medium, styles.remainingText]}>
              {totalGuestCount}
            </Text>
          </View>
          <View style={{gap: 4, width: 128, alignItems: 'center'}}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.roomType,
                {color: COLORS.primary_orange},
              ]}
            >
                남아 있는 베드 수 {room.remaining}개
            </Text>
            {reserved ? (
              <Text
                style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_300}, styles.fullBooked]}>
                예약 마감
              </Text>
            ) : (
              <ButtonWhite
                title='예약하기'
                backgroundColor={COLORS.primary_orange}
                textColor={COLORS.grayscale_0}
                disabled={isGuestCountOverRemaining}
                onPress={() => handleReservationPress(room, totalGuestCount)}
              />
            )}
          </View>
        </View>
      </>
    );

    return renderCommonCardShell(room, dormitoryInfo, reserved, totalGuestCount);
  };

  // 일반객실 카드
  const renderNormalRoom = (room, reserved) => {
    const isOverCapacity = totalGuestCount > room.roomMaxCapacity;

    const normalInfo = (
      <>
        <View style={styles.roomInfoRow}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.roomType,
              {color: COLORS.grayscale_500},
            ]}>
            [일반객실]
          </Text>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.roomType,
              {color: COLORS.grayscale_500},
            ]}
          >
            1객실 당
          </Text>
        </View>
        <View style={styles.checkTimeContainer}>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            입실 {formatTime(detail.checkIn)}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            퇴실 {formatTime(detail.checkOut)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.roomDetailBtn}
          onPress={() => {
            goRoomDetail(room, totalGuestCount);
          }}
        >
          <Text style={[FONTS.fs_14_medium, styles.roomDetailBtnText]}>
            상세보기
          </Text>
          <RightArrow width={16} height={16}/>
        </TouchableOpacity>

        <View style={[styles.roomInfoRow, {marginBottom: 0, marginTop: 24}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Text
              style={[FONTS.fs_14_medium, styles.roomType]}
            >
              {room.roomCapacity}인 기준(최대 {room.roomMaxCapacity}인)
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.roomType]}>
              {room.femaleOnly ? ', 여성전용' : ''}
            </Text>
          </View>
          <View style={{width: 128, alignItems: 'center'}}>
            {reserved ? (
              <Text
                style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_300}, styles.fullBooked]}
              >
                예약 마감
              </Text>
            ) : (
              <ButtonWhite
                title='예약하기'
                backgroundColor={COLORS.primary_orange}
                textColor={COLORS.grayscale_0}
                disabled={isOverCapacity}
                onPress={() => handleReservationPress(room, totalGuestCount)}
              />
            )}
          </View>
        </View>
      </>
    );

    return renderCommonCardShell(room, normalInfo, reserved, totalGuestCount);
  };

  return (
    <View style={styles.roomContentWrapper}>
      <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>객실</Text>

      {detail.roomInfos?.map(room => {
        const isDormitory = room.roomType === 'DORMITORY';
        const reserved = !!room.isReserved;

        return (
          <View key={room.id}>
            {isDormitory
              ? renderDormitoryRoom(room, reserved)
              : renderNormalRoom(room, reserved)}
          </View>
        );
      })}
    </View>
  );
};

export default RoomList;
