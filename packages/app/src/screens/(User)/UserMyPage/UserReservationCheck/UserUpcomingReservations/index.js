import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import dayjs from 'dayjs';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {getDefaultGuesthouseListParams} from '@constants/guesthouseDefaults';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import ButtonWhite from '@components/ButtonWhite';

import SearchEmpty from '@assets/images/search_empty.svg';
import ChevronRight from '@assets/images/chevron_right_blue.svg';
import EmptyState from '@components/EmptyState';
import AppImage from '@components/AppImage';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';

export default function UserUpcomingReservations({
  data,
  onRefresh,
  reviewableReservationIds,
}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  const genderMap = {
    MIXED: t('common.mixedDormitory'),
    FEMALE_ONLY: t('common.womenOnly'),
    MALE_ONLY: t('common.menOnly'),
  };

  const toLocalDateTime = (date, time) =>
    date ? (date.includes('T') ? date : `${date}T${time ?? '00:00:00'}`) : '';

  const getReservationStatusTitle = item =>
    item?.reservationStatus === 'PENDING'
      ? t('common.waitingForApproval')
      : t('myPage.reservationConfirmed');
  const isPendingReservation = item => item?.reservationStatus === 'PENDING';
  const isDuringStay = item => {
    if (!item?.checkIn || !item?.checkOut) {
      return false;
    }

    const currentDate = today.startOf('day');
    const checkInDate = dayjs(item.checkIn).startOf('day');
    const checkOutDate = dayjs(item.checkOut).startOf('day');

    if (!checkInDate.isValid() || !checkOutDate.isValid()) {
      return false;
    }

    return (
      (currentDate.isSame(checkInDate) || currentDate.isAfter(checkInDate)) &&
      (currentDate.isSame(checkOutDate) || currentDate.isBefore(checkOutDate))
    );
  };

  const handleCopyAddress = address => {
    Clipboard.setString(address ?? '');

    Toast.show({
      type: 'success',
      text1: t('common.iCopiedTheAddress'),
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const buildRoomDetailText = item => {
    if (!item) {
      return '';
    }
    const isDormitory = item.roomType === 'DORMITORY';
    const capacityText = item.roomCapacity
      ? t('common.valuePerson', {item_roomCapacity: item.roomCapacity})
      : '';

    if (isDormitory) {
      const genderText = genderMap[item.dormitoryGenderType] || '';
      const base = capacityText
        ? t('common.valueDormitory', {capacityText: capacityText})
        : t('common.dormitory');
      if (genderText && item.dormitoryGenderType !== 'MIXED') {
        return `${base}, ${genderText}`;
      }
      return base;
    }

    const maxCapacityText = item.roomMaxCapacity
      ? t('common.upToValue', {item_roomMaxCapacity: item.roomMaxCapacity})
      : '';
    const basePrefix = capacityText
      ? t('common.basedOnValue', {capacityText: capacityText})
      : t('common.standard');
    const base = `${basePrefix}${maxCapacityText}`;
    return item.femaleOnly ? t('common.valueForWomenOnly', {base: base}) : base;
  };

  const renderItem = ({item, index}) => {
    const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      toLocalDateTime(item.checkIn, item.guesthouseCheckIn),
    );
    const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      toLocalDateTime(item.checkOut, item.guesthouseCheckOut),
    );
    const showCheckInGuide = isDuringStay(item);
    const canWriteReview = reviewableReservationIds?.has(
      String(item.reservationId),
    );

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text
              style={[
                FONTS.fs_16_semibold,
                styles.titleText,
                isPendingReservation(item) && styles.pendingTitleText,
              ]}>
              {getReservationStatusTitle(item)}
            </Text>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.detailButton}
              onPress={() =>
                navigation.navigate('GuesthousePaymentReceipt', {
                  reservationId: item.reservationId,
                  isFromPaymentFlow: false,
                  receiptContext: {
                    guesthouseName: item.guesthouseName,
                    guesthouseAddress: item.guesthouseAddress,
                    roomName: item.roomName,
                    roomType: item.roomType,
                    roomCapacity: item.roomCapacity,
                    roomMaxCapacity: item.roomMaxCapacity,
                    femaleOnly: item.femaleOnly,
                    dormitoryGenderType: item.dormitoryGenderType,
                    checkIn: item.checkIn,
                    checkOut: item.checkOut,
                    checkInTime: item.guesthouseCheckIn,
                    checkOutTime: item.guesthouseCheckOut,
                    expectedCheckInTime: item.expectedCheckInTime,
                  },
                })
              }>
              <Text style={[FONTS.fs_12_medium, styles.detailText]}>
                {t('common.reservationDetails_64171d')}
              </Text>
              <ChevronRight width={16} height={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.guesthouseInfo}>
            <AppImage
              uri={item.guesthouseImage}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.infoContent}>
              <Text
                style={[FONTS.fs_16_semibold, styles.nameText]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.guesthouseName}
              </Text>
              <Text
                style={[FONTS.fs_14_medium, styles.roomText]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.roomName}
              </Text>
              <Text
                style={[FONTS.fs_12_medium, styles.roomDetailText]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {buildRoomDetailText(item)}
              </Text>
            </View>
          </View>
          <View style={styles.dateContent}>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                {' '}
                {checkInFormatted.date}{' '}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}>
                {' '}
                {checkInFormatted.time}{' '}
              </Text>
            </View>
            <View style={[FONTS.fs_14_medium, styles.rowDevide]} />
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                {' '}
                {checkOutFormatted.date}{' '}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}>
                {' '}
                {checkOutFormatted.time}{' '}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <ButtonWhite
            title={
              showCheckInGuide
                ? t('myPage.checkInInformation')
                : t('myPage.accommodationDetails')
            }
            style={styles.actionButton}
            onPress={() => {
              if (showCheckInGuide) {
                navigation.navigate('GuesthouseCheckInGuide', {
                  reservationId: item.reservationId,
                });
                return;
              }

              navigation.navigate('GuesthouseDetail', {
                id: item.guesthouseId,
                isFromDeeplink: false,
                checkIn: today.format('YYYY-MM-DD'),
                checkOut: tomorrow.format('YYYY-MM-DD'),
                guestCount: 1,
              });
            }}
            backgroundColor={COLORS.grayscale_100}
          />

          <ButtonWhite
            title={t('myPage.copyAddress')}
            style={styles.actionButton}
            onPress={() => handleCopyAddress(item.guesthouseAddress)}
            backgroundColor={COLORS.grayscale_100}
          />
        </View>

        {canWriteReview && (
          <ButtonWhite
            title={t('common.writeAReview')}
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate('UserGuesthouseReviewForm', {
                guesthouseId: item.guesthouseId,
                reservationId: item.reservationId,
                guesthouseName: item.guesthouseName,
                roomName: item.roomName,
                guesthouseAddress: trimJejuPrefix(item.guesthouseAddress),
                checkInFormatted,
                checkOutFormatted,
              })
            }
            backgroundColor={COLORS.grayscale_100}
          />
        )}

        <ButtonWhite
          title={t('common.cancelReservation_fb9a3e')}
          backgroundColor={COLORS.secondary_red}
          textColor={COLORS.semantic_red}
          onPress={() => {
            const paidAmount =
              typeof item.amount === 'number'
                ? item.amount
                : typeof item.totalAmount === 'number'
                ? item.totalAmount
                : typeof item.reservationAmount === 'number'
                ? item.reservationAmount
                : undefined;

            navigation.navigate('GuesthouseCancelConfirm', {
              reservationId: item.reservationId,
              cancelContext: {
                guesthouseName: item.guesthouseName,
                guesthouseImage: item.guesthouseImage,
                roomName: item.roomName,
                roomDesc: buildRoomDetailText(item),
                checkInDate: checkInFormatted.date,
                checkInTime: checkInFormatted.time,
                checkOutDate: checkOutFormatted.date,
                checkOutTime: checkOutFormatted.time,
                reservationStatus: item.reservationStatus,
                approvalStatus: item.approvalStatus,
                ...(typeof paidAmount === 'number'
                  ? {
                      paidAmount,
                      ...(isPendingReservation(item)
                        ? {cancelFee: 0, refundAmount: paidAmount}
                        : {}),
                    }
                  : {}),
                ...(!isPendingReservation(item) &&
                typeof item.cancelFee === 'number'
                  ? {cancelFee: item.cancelFee}
                  : {}),
                ...(!isPendingReservation(item) &&
                typeof item.refundAmount === 'number'
                  ? {refundAmount: item.refundAmount}
                  : {}),
                ...(item.refundMethod ? {refundMethod: item.refundMethod} : {}),
              },
            });
          }}
        />

        {index !== data.length - 1 && <View style={styles.devide} />}
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={item => item.reservationId.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          data.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon={SearchEmpty}
            iconSize={{width: 120, height: 120}}
            title={t('common.thereIsNoReservationHistory')}
            description={t('common.shallWeGoMakeAReservationForAGuesthouse')}
            buttonText={t('common.findAGuesthouse')}
            onPressButton={() =>
              navigation.navigate('MainTabs', {
                screen: '지도',
                params: {
                  screen: 'GuesthouseList',
                  params: getDefaultGuesthouseListParams(),
                },
              })
            }
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  cancelText: {
    color: COLORS.grayscale_400,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  devide: {
    marginVertical: 16,
    height: 0.4,
    backgroundColor: COLORS.grayscale_200,
  },

  // 리스트
  card: {},
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {},
  pendingTitleText: {
    color: COLORS.semantic_red,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: COLORS.semantic_blue,
  },
  // 게하 정보
  guesthouseInfo: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    width: 0,
    minWidth: 0,
    overflow: 'hidden',
    paddingVertical: 4,
    gap: 4,
  },
  nameText: {
    flexShrink: 1,
  },
  roomText: {
    color: COLORS.grayscale_800,
    flexShrink: 1,
  },
  roomDetailText: {
    color: COLORS.grayscale_500,
    flexShrink: 1,
  },

  // 날짜, 시간
  dateContent: {
    marginTop: 12,
    padding: 4,
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  rowDevide: {
    marginHorizontal: 16,
    alignSelf: 'center',
    backgroundColor: COLORS.grayscale_200,
    height: '100%',
    width: 1,
  },

  // 버튼
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
  },
  reviewButton: {
    marginBottom: 8,
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  emptyListContent: {
    justifyContent: 'center',
  },
});
