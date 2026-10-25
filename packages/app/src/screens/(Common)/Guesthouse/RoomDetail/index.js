import {useTranslation} from 'react-i18next';
import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import styles from './RoomDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import ImageModal from '@components/modals/ImageModal';
import AppImage from '@components/AppImage';
import useUserStore from '@stores/userStore';

import LeftArrow from '@assets/images/chevron_left_white.svg';
import {showErrorModal} from '@utils/loginModalHub';
import {guesthouseDetailDeeplink} from '@utils/deeplinkGenerator';
import {openAppOrStoreFromWeb} from '@utils/webOpenApp';

const RoomDetail = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  // 호스트 예약 막기
  const userRole = useUserStore(state => state.userRole);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const {
    roomId,
    roomName,
    roomPrice,
    multiNightDiscount,
    roomDesc,
    guesthouseName,
    guesthouseId,
    guesthouseAddress,
    guesthouseAddressDetail,
    guesthousePhone,
    checkIn,
    checkOut,
    checkInTime,
    checkOutTime,
    guestCount,
    roomImages,
    roomCapacity,
    roomType,
    dormitoryGenderType,
    roomMaxCapacity,
    extraPersonPrice,
    additionalGuestPrice,
    extraPersonCount,
    extraPersonTotalPrice,
    femaleOnly,
    totalPrice,
    refundPolicies,
    reservationPolicy,
    reservationPolicyMode,
  } = route.params;
  const isReservationClosed = reservationPolicyMode === 'CLOSED';
  const formatTime = timeStr => {
    if (!timeStr) {
      return t('common.noTime');
    }

    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };
  const formatDateWithDay = dateStr => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('ddd')})`;
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
  const modalImages = sortedImages;

  const {width: SCREEN_W} = Dimensions.get('window');
  const IMAGE_H = 280;

  const [imageIndex, setImageIndex] = useState(thumbnailIndex);
  const [imageSourceRect, setImageSourceRect] = useState(null);
  const headerCarouselRef = useRef(null);
  const imageSourceRefs = useRef(new Map());
  const measureImageSource = useCallback(index => {
    const target = imageSourceRefs.current.get(index);
    if (!target) {
      return;
    }

    if (Platform.OS === 'web' && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      setImageSourceRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        imageIndex: index,
      });
      return;
    }

    target.measureInWindow?.((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setImageSourceRect({x, y, width, height, imageIndex: index});
      }
    });
  }, []);
  const syncHeaderImageIndex = useCallback(
    index => {
      setImageIndex(index);
      headerCarouselRef.current?.scrollTo({index, animated: false});
      requestAnimationFrame(() => measureImageSource(index));
    },
    [measureImageSource],
  );
  const openImageModal = useCallback(
    index => {
      setImageIndex(index);
      setImageSourceRect(null);
      setImageModalVisible(true);
      requestAnimationFrame(() => measureImageSource(index));
    },
    [measureImageSource],
  );

  const roomTypeMap = {
    MIXED: t('common.mixedDormitory'),
    FEMALE_ONLY: t('common.womenOnly'),
    MALE_ONLY: t('common.menOnly'),
  };
  const isDormitory = roomType === 'DORMITORY';
  const genderText = roomTypeMap[dormitoryGenderType] || '';

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {hasImages ? (
            <Carousel
              ref={headerCarouselRef}
              width={SCREEN_W}
              height={IMAGE_H}
              data={sortedImages}
              defaultIndex={thumbnailIndex} // 썸네일부터 시작
              loop={false}
              autoPlay={false}
              pagingEnabled
              onSnapToItem={idx => setImageIndex(idx)}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  ref={node => {
                    if (node) {
                      imageSourceRefs.current.set(index, node);
                    } else {
                      imageSourceRefs.current.delete(index);
                    }
                  }}
                  activeOpacity={1}
                  onPress={() => openImageModal(index)}>
                  <AppImage
                    uri={item.roomImageUrl}
                    style={[
                      styles.image,
                      imageModalVisible && imageIndex === index && {opacity: 0},
                    ]}
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
            activeOpacity={1}
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
            {isDormitory ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                }}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.roomType,
                    {color: COLORS.grayscale_500},
                  ]}>
                  [{roomCapacity}
                  {t('common.inDormitory')}
                </Text>
                {dormitoryGenderType !== 'MIXED' && !!genderText && (
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
            ) : (
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                  {roomCapacity}
                  {t('common.basedOnPhosphorusMaximum')}
                  {roomMaxCapacity}
                  {t('common.phosphorus')}
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                  {femaleOnly ? t('common.womenOnly_40edf9') : ''}
                </Text>
              </View>
            )}
            <Text style={[FONTS.fs_14_regular, styles.description]}>
              {roomDesc}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[FONTS.fs_14_medium, styles.priceInfoText]}>
                {isDormitory ? t('common.perBed') : t('common.perRoom')}
              </Text>
              <View style={styles.priceAmountRow}>
                <Text style={[FONTS.fs_20_bold, styles.price]}>
                  {roomPrice.toLocaleString()}
                  {t('common.won')}
                </Text>
                {multiNightDiscount?.enabled === true && (
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
            </View>
          </View>

          <Text style={[FONTS.fs_16_medium, styles.dateTitle]}>
            {t('guesthouse.selectDate')}
          </Text>
          <View style={styles.dateBoxContainer}>
            <View style={styles.dateBoxCheckIn}>
              <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>
                {t('common.checkIn')}
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
                {t('common.checkOut')}
              </Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatDateWithDay(checkOut)}
              </Text>
              <Text style={[FONTS.fs_16_regular, styles.dateText]}>
                {formatTime(checkOut)}
              </Text>
            </View>
          </View>

          <View style={styles.guestCountRow}>
            <Text style={[FONTS.fs_16_medium]}>
              {t('guesthouse.selectedNumberOfPeople')}
            </Text>
            <Text style={[FONTS.fs_16_semibold]}>
              {t('units.guest', {count: guestCount})}
            </Text>
          </View>
        </View>
      </ScrollView>

      {!isReservationClosed && (
        <View style={styles.button}>
          {/* 비지터 게스트하우스 */}
          {/* 베드라디오 동문점 */}
          {/* 이상한밤 게스트하우스 */}
          <ButtonScarlet
            title={t('guesthouse.accommodationReservation')}
            onPress={() => {
              if (
                Platform.OS !== 'web' &&
                openAppOrStoreFromWeb(guesthouseDetailDeeplink(guesthouseId))
              ) {
                return;
              }

              if (userRole !== 'USER') {
                showErrorModal({
                  message: t(
                    'common.pleaseLogInToMakeAccommodationReservations',
                  ),
                  buttonText2: t('common.cancel'),
                  buttonText: t('common.logIn'),
                  onPress: () => {
                    navigation.navigate('Login');
                  },
                  onPress2: () => {},
                });
              } else if (!isDormitory && guestCount > roomMaxCapacity) {
                showErrorModal({
                  message: t(
                    'guesthouse.theMaximumNumberOfPeopleInThisRoomIsValue',
                    {roomMaxCapacity: roomMaxCapacity},
                  ),
                  buttonText: t('common.confirm'),
                });
              } else if (guesthouseName === t('common.visitorGuestHouse')) {
                const url =
                  'https://m.place.naver.com/accommodation/1017382020/room?entry=plt&businessCategory=guesthouse';

                Linking.canOpenURL(url)
                  .then(supported => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      Alert.alert(
                        t('common.notification'),
                        t('common.iCanTOpenTheLink'),
                      );
                    }
                  })
                  .catch(() => {
                    Alert.alert(
                      t('common.notification'),
                      t('common.anErrorOccurredWhileOpeningTheLink'),
                    );
                  });
              } else if (guesthouseName === t('common.bedRadioDongmunBranch')) {
                const url =
                  'https://m.place.naver.com/accommodation/1982132289/room?entry=pll&businessCategory=guesthouse';

                Linking.canOpenURL(url)
                  .then(supported => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      Alert.alert(
                        t('common.notification'),
                        t('common.iCanTOpenTheLink'),
                      );
                    }
                  })
                  .catch(() => {
                    Alert.alert(
                      t('common.notification'),
                      t('common.anErrorOccurredWhileOpeningTheLink'),
                    );
                  });
              } else if (
                guesthouseName === t('common.strangeNightGuesthouse')
              ) {
                const url =
                  'https://m.place.naver.com/accommodation/1285287809/room?entry=plt&businessCategory=guesthouse';

                Linking.canOpenURL(url)
                  .then(supported => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      Alert.alert(
                        t('common.notification'),
                        t('common.iCanTOpenTheLink'),
                      );
                    }
                  })
                  .catch(() => {
                    Alert.alert(
                      t('common.notification'),
                      t('common.anErrorOccurredWhileOpeningTheLink'),
                    );
                  });
              } else {
                navigation.navigate('GuesthouseReservationEntry', {
                  roomId,
                  roomName,
                  roomPrice,
                  guesthouseName,
                  guesthouseId,
                  guesthouseAddress,
                  guesthouseAddressDetail,
                  guesthousePhone,
                  checkIn,
                  checkOut,
                  checkInTime,
                  checkOutTime,
                  guestCount,
                  totalPrice,
                  roomType,
                  dormitoryGenderType,
                  roomCapacity,
                  roomMaxCapacity,
                  extraPersonPrice,
                  additionalGuestPrice,
                  extraPersonCount,
                  extraPersonTotalPrice,
                  femaleOnly,
                  refundPolicies,
                  reservationPolicy,
                });
              }
            }}
          />
        </View>
      )}

      {/* 이미지 모달 */}
      {hasImages && (
        <ImageModal
          visible={imageModalVisible}
          images={modalImages}
          selectedImageIndex={imageIndex}
          sourceRect={imageSourceRect}
          onImageIndexChange={syncHeaderImageIndex}
          onClose={() => setImageModalVisible(false)}
        />
      )}
    </View>
  );
};

export default RoomDetail;
