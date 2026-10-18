import {useTranslation} from 'react-i18next';
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {guesthouseDetailDeeplink} from '@utils/deeplinkGenerator';
import {openAppOrStoreFromWeb} from '@utils/webOpenApp';
import AppImage from '@components/AppImage';
import ImageModal from '@components/modals/ImageModal';

import RightArrow from '@assets/images/chevron_right_blue.svg';

const RoomList = ({
  detail,
  guesthouseId,
  localCheckIn,
  localCheckOut,
  localAdults,
  localChildren,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [roomModalImages, setRoomModalImages] = useState([]);
  const [roomImageModalVisible, setRoomImageModalVisible] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [roomImageIndices, setRoomImageIndices] = useState({});
  const [roomImageSourceRect, setRoomImageSourceRect] = useState(null);
  const roomImageRefs = useRef(new Map());
  const userRole = useUserStore(state => state.userRole);
  const formatTime = timeStr => (timeStr ? timeStr.slice(0, 5) : '');
  const totalGuestCount = localAdults + localChildren;
  const dormitoryGenderMap = {
    MIXED: t('common.mixedDormitory'),
    FEMALE_ONLY: t('common.womenOnly'),
    MALE_ONLY: t('common.menOnly'),
  };

  const getRoomImages = room =>
    [...(room.roomImages ?? [])]
      .filter(image => image?.roomImageUrl)
      .sort((a, b) =>
        a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1,
      );

  const measureRoomImageSource = (roomId, index) => {
    const target = roomImageRefs.current.get(roomId);
    if (Platform.OS === 'web' && target?.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      setRoomImageSourceRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        imageIndex: index,
      });
      return;
    }
    target?.measureInWindow?.((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setRoomImageSourceRect({x, y, width, height, imageIndex: index});
      }
    });
  };

  const openRoomImageModal = room => {
    const images = getRoomImages(room);
    if (images.length === 0) {
      return;
    }
    const index = Math.min(roomImageIndices[room.id] ?? 0, images.length - 1);
    setActiveRoomId(room.id);
    setRoomImageIndices(previous => ({...previous, [room.id]: index}));
    setRoomImageSourceRect(null);
    setRoomModalImages(images);
    setRoomImageModalVisible(true);
    requestAnimationFrame(() => measureRoomImageSource(room.id, index));
  };

  const syncRoomImageIndex = index => {
    setRoomImageIndices(previous => ({...previous, [activeRoomId]: index}));
    requestAnimationFrame(() => measureRoomImageSource(activeRoomId, index));
  };

  const goRoomDetail = (room, guestCountOverride) => {
    navigation.navigate('RoomDetail', {
      roomId: room.id,
      roomName: room.roomName,
      roomPrice: room.roomPrice,
      multiNightDiscount: room.multiNightDiscount,
      roomDesc: room.roomDesc,
      roomCapacity: room.roomCapacity,
      roomType: room.roomType,
      dormitoryGenderType: room.dormitoryGenderType,
      roomMaxCapacity: room.roomMaxCapacity,
      extraPersonPrice:
        room.extraPersonPrice ??
        room.additionalGuestPrice ??
        room.extraGuestPrice ??
        room.additionalPersonPrice,
      additionalGuestPrice:
        room.additionalGuestPrice ??
        room.extraGuestPrice ??
        room.extraPersonPrice ??
        room.additionalPersonPrice,
      extraPersonCount: room.extraPersonCount,
      extraPersonTotalPrice: room.extraPersonTotalPrice,
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
      refundPolicies: detail?.refundPolicies,
      reservationPolicy: detail?.reservationPolicy,
      reservationPolicyMode: detail?.reservationPolicy?.mode,
    });
  };

  const handleReservationPress = (room, guestCount) => {
    if (
      Platform.OS !== 'web' &&
      openAppOrStoreFromWeb(guesthouseDetailDeeplink(guesthouseId))
    ) {
      return;
    }

    if (userRole !== 'USER') {
      showErrorModal({
        message: t('common.pleaseLogInToMakeAccommodationReservations'),
        buttonText2: t('common.cancel'),
        buttonText: t('common.logIn'),
        onPress: () => {
          navigation.navigate('Login');
        },
        onPress2: () => {},
      });
      return;
    }

    if (detail.guesthouseName === t('common.visitorGuestHouse')) {
      const url =
        'https://m.place.naver.com/accommodation/1017382020/room?entry=plt&businessCategory=guesthouse';
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(t('common.notification'), t('common.iCanTOpenTheLink'));
          }
        })
        .catch(() => {
          Alert.alert(
            t('common.notification'),
            t('common.anErrorOccurredWhileOpeningTheLink'),
          );
        });
      return;
    }

    if (detail.guesthouseName === t('common.bedRadioDongmunBranch')) {
      const url =
        'https://m.place.naver.com/accommodation/1982132289/room?entry=pll&businessCategory=guesthouse';
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(t('common.notification'), t('common.iCanTOpenTheLink'));
          }
        })
        .catch(() => {
          Alert.alert(
            t('common.notification'),
            t('common.anErrorOccurredWhileOpeningTheLink'),
          );
        });
      return;
    }

    if (detail.guesthouseName === t('common.strangeNightGuesthouse')) {
      const url =
        'https://m.place.naver.com/accommodation/1285287809/room?entry=plt&businessCategory=guesthouse';
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(t('common.notification'), t('common.iCanTOpenTheLink'));
          }
        })
        .catch(() => {
          Alert.alert(
            t('common.notification'),
            t('common.anErrorOccurredWhileOpeningTheLink'),
          );
        });
      return;
    }

    navigation.navigate('GuesthouseReservationEntry', {
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
      extraPersonPrice:
        room.extraPersonPrice ??
        room.additionalGuestPrice ??
        room.extraGuestPrice ??
        room.additionalPersonPrice,
      additionalGuestPrice:
        room.additionalGuestPrice ??
        room.extraGuestPrice ??
        room.extraPersonPrice ??
        room.additionalPersonPrice,
      extraPersonCount: room.extraPersonCount,
      extraPersonTotalPrice: room.extraPersonTotalPrice,
      femaleOnly: room.femaleOnly,
      refundPolicies: detail?.refundPolicies,
      reservationPolicy: detail?.reservationPolicy,
    });
  };

  const renderCommonCardShell = (room, infoNode, actionNode) => {
    const images = getRoomImages(room);
    const imageIndex = Math.min(
      roomImageIndices[room.id] ?? 0,
      images.length - 1,
    );
    const thumbnailImage = images[imageIndex]?.roomImageUrl;

    return (
      <View style={styles.roomCard}>
        <View>
          {thumbnailImage ? (
            <TouchableOpacity
              ref={node => {
                if (node) {
                  roomImageRefs.current.set(room.id, node);
                } else {
                  roomImageRefs.current.delete(room.id);
                }
              }}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel={t('guesthouse.valueViewPhotos', {
                room_roomName: room.roomName,
              })}
              onPress={() => openRoomImageModal(room)}>
              <AppImage
                uri={thumbnailImage}
                style={[
                  styles.roomImage,
                  roomImageModalVisible &&
                    activeRoomId === room.id && {opacity: 0},
                ]}
              />
            </TouchableOpacity>
          ) : (
            <View
              style={[styles.roomImage, {backgroundColor: COLORS.grayscale_0}]}
            />
          )}

          <View style={styles.roomInfo}>
            <View style={styles.roomNameDescContainer}>
              <View style={styles.roomHeaderRow}>
                <View style={styles.roomNameTextWrapper}>
                  <Text
                    style={[
                      FONTS.fs_16_semibold,
                      styles.roomType,
                      styles.roomNameText,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {room.roomName}
                  </Text>
                </View>
                <Text style={[FONTS.fs_18_semibold, styles.roomPrice]}>
                  {(room.totalPrice ?? room.roomPrice)?.toLocaleString()}
                  {t('common.won')}
                </Text>
                {room.multiNightDiscount?.enabled === true && (
                  <View style={styles.multiNightDiscountBadge}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        styles.multiNightDiscountBadgeText,
                      ]}>
                      {t('common.consecutiveNightDiscount')}
                    </Text>
                  </View>
                )}
              </View>

              {infoNode}
            </View>
          </View>
        </View>

        {actionNode}
      </View>
    );
  };

  // 도미토리 카드
  const renderDormitoryRoom = (room, reserved) => {
    const genderText = dormitoryGenderMap[room.dormitoryGenderType] || '';
    const remaining = typeof room.remaining === 'number' ? room.remaining : 0;
    const isGuestCountOverRemaining = totalGuestCount > remaining;
    const isReservationClosed = detail?.reservationPolicy?.mode === 'CLOSED';

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
              [{room.roomCapacity}
              {t('common.inDormitory')}
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
            {t('common.perBed')}
          </Text>
        </View>

        <View style={styles.checkTimeContainer}>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            {t('common.enteringTheRoom')}
            {formatTime(detail.checkIn)}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            {t('common.checkOut_91151a')}
            {formatTime(detail.checkOut)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.roomDetailBtn}
          activeOpacity={0.8}
          accessibilityRole="button"
          onPress={() => goRoomDetail(room, totalGuestCount)}>
          <Text style={[FONTS.fs_14_medium, styles.roomDetailBtnText]}>
            {t('guesthouse.viewDetails')}
          </Text>
          <RightArrow width={16} height={16} />
        </TouchableOpacity>
      </>
    );

    const dormitoryAction = !isReservationClosed ? (
      <View style={styles.roomInfoBottomRow}>
        <View style={styles.remainingRow}>
          <Text style={[FONTS.fs_14_medium, styles.remainingText]}>
            {t('guesthouse.numberOfBeds')}
          </Text>
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
            ]}>
            {t('guesthouse.remainingBedCount', {count: room.remaining})}
          </Text>
          {reserved ? (
            <Text
              style={[
                FONTS.fs_16_semibold,
                {color: COLORS.grayscale_300},
                styles.fullBooked,
              ]}>
              {t('guesthouse.reservationDeadline')}
            </Text>
          ) : (
            <ButtonWhite
              title={t('common.makeAReservation')}
              backgroundColor={COLORS.primary_orange}
              textColor={COLORS.grayscale_0}
              disabled={isGuestCountOverRemaining}
              onPress={() => handleReservationPress(room, totalGuestCount)}
            />
          )}
        </View>
      </View>
    ) : null;

    return renderCommonCardShell(room, dormitoryInfo, dormitoryAction);
  };

  // 일반객실 카드
  const renderNormalRoom = (room, reserved) => {
    const isOverCapacity = totalGuestCount > room.roomMaxCapacity;
    const isReservationClosed = detail?.reservationPolicy?.mode === 'CLOSED';

    const normalInfo = (
      <>
        <View style={styles.roomInfoRow}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.roomType,
              {color: COLORS.grayscale_500},
            ]}>
            {t('guesthouse.generalRoom')}
          </Text>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.roomType,
              {color: COLORS.grayscale_500},
            ]}>
            {t('common.perRoom')}
          </Text>
        </View>
        <View style={styles.checkTimeContainer}>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            {t('common.enteringTheRoom')}
            {formatTime(detail.checkIn)}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.checkin]}>
            {t('common.checkOut_91151a')}
            {formatTime(detail.checkOut)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.roomDetailBtn}
          activeOpacity={0.8}
          accessibilityRole="button"
          onPress={() => goRoomDetail(room, totalGuestCount)}>
          <Text style={[FONTS.fs_14_medium, styles.roomDetailBtnText]}>
            {t('guesthouse.viewDetails')}
          </Text>
          <RightArrow width={16} height={16} />
        </TouchableOpacity>
      </>
    );

    const normalAction = !isReservationClosed ? (
      <View style={[styles.roomInfoRow, {marginBottom: 0, marginTop: 24}]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          <Text style={[FONTS.fs_14_medium, styles.roomType]}>
            {room.roomCapacity}
            {t('common.basedOnPhosphorusMaximum')}
            {room.roomMaxCapacity}
            {t('common.phosphorus')}
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.roomType]}>
            {room.femaleOnly ? t('common.womenOnly_40edf9') : ''}
          </Text>
        </View>
        <View style={{width: 128, alignItems: 'center'}}>
          {reserved ? (
            <Text
              style={[
                FONTS.fs_16_semibold,
                {color: COLORS.grayscale_300},
                styles.fullBooked,
              ]}>
              {t('guesthouse.reservationDeadline')}
            </Text>
          ) : (
            <ButtonWhite
              title={t('common.makeAReservation')}
              backgroundColor={COLORS.primary_orange}
              textColor={COLORS.grayscale_0}
              onPress={() => {
                if (isOverCapacity) {
                  showErrorModal({
                    message: t(
                      'guesthouse.thisRoomAccommodatesAMaximumOfValuePeoplePleaseAdjust',
                      {room_roomMaxCapacity: room.roomMaxCapacity},
                    ),
                    buttonText: t('common.confirm'),
                  });
                } else {
                  handleReservationPress(room, totalGuestCount);
                }
              }}
            />
          )}
        </View>
      </View>
    ) : null;

    return renderCommonCardShell(room, normalInfo, normalAction);
  };

  return (
    <View style={styles.roomContentWrapper}>
      <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>
        {t('common.guestRoom')}
      </Text>

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
      <ImageModal
        visible={roomImageModalVisible}
        images={roomModalImages}
        selectedImageIndex={roomImageIndices[activeRoomId] ?? 0}
        sourceRect={roomImageSourceRect}
        sourceBorderRadius={8}
        onImageIndexChange={syncRoomImageIndex}
        onClose={() => setRoomImageModalVisible(false)}
      />
    </View>
  );
};

export default RoomList;
