import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';

const RoomList = ({
  detail,
  localCheckIn,
  localCheckOut,
  localAdults,
  localChildren,
}) => {
  const navigation = useNavigation();
  const userRole = useUserStore(state => state.userRole);
  const formatTime = timeStr => (timeStr ? timeStr.slice(0, 5) : '');
  const [openRoomId, setOpenRoomId] = useState(null);
  const [selectedCounts, setSelectedCounts] = useState({});
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
      guesthouseName: detail.guesthouseName,
      checkIn: `${localCheckIn}T${detail.checkIn}`,
      checkOut: `${localCheckOut}T${detail.checkOut}`,
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
      checkIn: `${localCheckIn}T${detail.checkIn}`,
      checkOut: `${localCheckOut}T${detail.checkOut}`,
      guestCount,
      totalPrice: room.totalPrice,
    });
  };

  const renderCommonCardShell = (room, topInfoNode, reserved, guestCount) => {
    const thumbnailImage = getThumbnailImage(room);
    
    return (
      <TouchableOpacity
        disabled={reserved}
        onPress={() => {
          if (!reserved) goRoomDetail(room, guestCount);
        }}>
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
              <View style={styles.roomInfoRow}>
                <Text
                  style={[FONTS.fs_16_semibold, styles.roomType]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {room.roomName}
                </Text>
                <Text style={[FONTS.fs_18_semibold, styles.roomPrice]}>
                  {room.roomPrice?.toLocaleString()}원
                </Text>
              </View>

              {/* 하단쪽 분기 */}
              {topInfoNode}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 도미토리 카드
  const renderDormitoryRoom = (room, reserved) => {
    const genderText = dormitoryGenderMap[room.dormitoryGenderType] || '';
    const remaining = typeof room.remaining === 'number' ? room.remaining : 0;
    const maxSelectable = Math.max(
      1,
      Math.min(totalGuestCount, remaining),
    );
    const selectedCount = Math.min(
      selectedCounts[room.id] ?? maxSelectable,
      maxSelectable,
    );
    const isGuestCountOverRemaining =
      totalGuestCount > remaining && remaining >= 1;
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
              [{room.roomCapacity}인]
            </Text>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.roomType,
                {color: COLORS.grayscale_500},
              ]}>
              {genderText}
            </Text>
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
            goRoomDetail(room, selectedCount);
          }}
        >
          <Text style={[FONTS.fs_14_medium, styles.roomDetailBtnText]}>
            상세보기
          </Text>
        </TouchableOpacity>

        <View style={styles.roomInfoBottomRow}>
          <TouchableOpacity
            style={styles.remainingRow}
            disabled={reserved}
            onPress={() => {
              setOpenRoomId(prev => (prev === room.id ? null : room.id));
            }}>
            <Text style={[FONTS.fs_14_medium, styles.remainingText]}>베드 수</Text>
            <Text style={[FONTS.fs_14_medium, styles.remainingText]}>
              {selectedCount}
            </Text>
          </TouchableOpacity>
          <View style={{gap: 4}}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.roomType,
                {color: COLORS.grayscale_500},
              ]}
            >
                남아 있는 베드 수 {room.remaining}개
            </Text>
            {reserved ? (
              <Text
                style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_300}]}>
                예약 마감
              </Text>
            ) : (
              <ButtonWhite
                title='예약하기'
                backgroundColor={
                  isGuestCountOverRemaining
                    ? COLORS.grayscale_200
                    : COLORS.primary_orange
                }
                textColor={
                  isGuestCountOverRemaining
                    ? COLORS.grayscale_900
                    : COLORS.grayscale_0
                }
                onPress={() => handleReservationPress(room, selectedCount)}
              />
            )}
          </View>
        </View>
        {openRoomId === room.id && !reserved && (
          <View style={styles.countOptionsRow}>
            {Array.from({length: maxSelectable}, (_, idx) => idx + 1).map(
              count => {
                const isActive = selectedCount === count;
                return (
                  <TouchableOpacity
                    key={`${room.id}-${count}`}
                    style={[
                      styles.countOptionChip,
                      isActive && styles.countOptionChipActive,
                    ]}
                    onPress={() => {
                      setSelectedCounts(prev => ({
                        ...prev,
                        [room.id]: count,
                      }));
                      setOpenRoomId(null);
                    }}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.countOptionText,
                        isActive && styles.countOptionTextActive,
                      ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        )}
      </>
    );

    return renderCommonCardShell(room, dormitoryInfo, reserved, selectedCount);
  };

  // 일반객실 카드
  const renderNormalRoom = (room, reserved) => {
    const normalInfo = (
      <>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.roomType,
              {color: COLORS.grayscale_500},
            ]}>
            일반객실 · {room.roomCapacity}인실
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
