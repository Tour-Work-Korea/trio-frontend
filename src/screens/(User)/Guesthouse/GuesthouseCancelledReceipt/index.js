import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import styles from './GuesthouseCancelledReceipt.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

import XBtn from '@assets/images/x_gray.svg';

const GuesthouseCancelledReceipt = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const reservationId = route?.params?.reservationId ?? null;
  const reservationItem = route?.params?.reservationItem ?? null;
  const [dto, setDto] = useState(null);

  const genderMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };

  const buildRoomDetailText = item => {
    if (!item) return '';
    const isDormitory = item.roomType === 'DORMITORY';
    const capacityText = item.roomCapacity ? `${item.roomCapacity}인` : '';

    if (isDormitory) {
      const genderText = genderMap[item.dormitoryGenderType] || '';
      const base = capacityText ? `[${capacityText} 도미토리]` : '[도미토리]';
      if (genderText && item.dormitoryGenderType !== 'MIXED') {
        return `${base}, ${genderText}`;
      }
      return base;
    }

    const maxCapacityText = item.roomMaxCapacity
      ? `(최대 ${item.roomMaxCapacity}인)`
      : '';
    const basePrefix = capacityText ? `${capacityText} 기준` : '기준';
    const base = `${basePrefix}${maxCapacityText}`;
    return item.femaleOnly ? `${base}, 여성 전용` : base;
  };

  const toLocalDateTime = (date, time) =>
    date ? `${date}T${time ?? '00:00:00'}` : '';

  const data = useMemo(
    () => ({
      statusMessage:
        '예약취소 되었습니다. 환불은 주말/공휴일을 제외한 영업일 기준 3-5일 소요될 수 있습니다.',
      guesthouseName:
        dto?.guesthouse ?? reservationItem?.guesthouseName ?? '',
      roomName: dto?.roomName ?? reservationItem?.roomName ?? '',
      roomDesc: buildRoomDetailText(reservationItem),
      imageUrl: reservationItem?.guesthouseImage ?? '',
      checkInDate: formatLocalDateTimeToDotAndTimeWithDay(
        toLocalDateTime(
          dto?.checkIn ?? reservationItem?.checkIn,
          reservationItem?.guesthouseCheckIn ?? reservationItem?.checkInTime,
        ),
      ).date,
      checkInTime: formatLocalDateTimeToDotAndTimeWithDay(
        toLocalDateTime(
          dto?.checkIn ?? reservationItem?.checkIn,
          reservationItem?.guesthouseCheckIn ?? reservationItem?.checkInTime,
        ),
      ).time,
      checkOutDate: formatLocalDateTimeToDotAndTimeWithDay(
        toLocalDateTime(
          dto?.checkOut ?? reservationItem?.checkOut,
          reservationItem?.guesthouseCheckOut ?? reservationItem?.checkOutTime,
        ),
      ).date,
      checkOutTime: formatLocalDateTimeToDotAndTimeWithDay(
        toLocalDateTime(
          dto?.checkOut ?? reservationItem?.checkOut,
          reservationItem?.guesthouseCheckOut ?? reservationItem?.checkOutTime,
        ),
      ).time,
      cancelledAt: (() => {
        const {date, time} = formatLocalDateTimeToDotAndTimeWithDay(
          dto?.cancelledAt,
        );
        return `취소일시 ${date} ${time}`;
      })(),
      paidAmount:
        typeof dto?.totalAmount === 'number' ? dto.totalAmount : 0,
      cancelFee: (() => {
        const totalAmount =
          typeof dto?.totalAmount === 'number' ? dto.totalAmount : 0;
        const cancelledAmount =
          typeof dto?.cancelledAmount === 'number' ? dto.cancelledAmount : 0;
        return Math.max(totalAmount - cancelledAmount, 0);
      })(),
      refundMethod: (() => {
        const method =
          (dto?.paymentType && PAYMENT_TYPE_LABEL[dto.paymentType]) ?? '';
        return method ? `${method} 환불` : '';
      })(),
      refundAmount:
        typeof dto?.cancelledAmount === 'number' ? dto.cancelledAmount : 0,
      cancelReason: dto?.cancelReason ?? '',
    }),
    [dto, reservationItem],
  );

  const formatPrice = n => `${Number(n || 0).toLocaleString('ko-KR')}원`;

  useEffect(() => {
    if (!reservationId) return;
    const fetchDetail = async () => {
      try {
        const res = await reservationPaymentApi.getReservationPaymentDetail(
          reservationId,
        );
        setDto(res?.data ?? null);
      } catch (e) {
      }
    };

    fetchDetail();
  }, [reservationId]);

  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.xBtn}
          onPress={() => navigation.goBack()}
        >
          <XBtn width={24} height={24}/>
        </TouchableOpacity>

        <Text style={[FONTS.fs_20_semibold]}>예약취소</Text>

        {/* 경고 배너 */}
        <View style={styles.banner}>
          <Text style={[FONTS.fs_14_semibold, styles.bannerText]}>
            {data.statusMessage}
          </Text>
        </View>

        {/* 게하 정보 */}
        <View style={styles.summaryCard}>
          <Image
            source={{uri: data.imageUrl}}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          <View style={styles.summaryTextBox}>
            <Text
              style={[FONTS.fs_16_semibold, styles.guesthouseName]}>
              {data.guesthouseName}
            </Text>

            <Text
              style={[FONTS.fs_14_medium, styles.roomName]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {data.roomName}
            </Text>

            <Text
              style={[FONTS.fs_12_medium, styles.roomDesc]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {data.roomDesc}
            </Text>
          </View>
        </View>

        {/* 날짜 */}
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={[FONTS.fs_16_semibold, styles.dateText]}>
              {data.checkInDate}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.timeText]}>
              {data.checkInTime}
            </Text>
          </View>

          <View style={styles.dateDivider} />

          <View style={styles.dateCol}>
            <Text style={[FONTS.fs_16_semibold, styles.dateText]}>
              {data.checkOutDate}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.timeText]}>
              {data.checkOutTime}
            </Text>
          </View>
        </View>

        <View style={styles.devide}/>

        {/* 취소 내역 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_12_medium, styles.cancelledAt]}>
            {data.cancelledAt}
          </Text>

          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            취소/환불 정보
          </Text>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>실 결제 금액</Text>
            <View style={styles.valueInline}>
              <Text style={[FONTS.fs_14_regular, styles.valueHint]}>(취소)</Text>
              <Text style={[FONTS.fs_14_semibold, styles.valueStrike]}>
                {formatPrice(data.paidAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>취소 수수료</Text>
            <Text style={[FONTS.fs_14_semibold, styles.value]}>
              {formatPrice(data.cancelFee)}
            </Text>
          </View>

          <View style={[styles.devide, {marginTop: 24, marginBottom: 12}]}/>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>환불 방법</Text>
            <Text style={[FONTS.fs_14_semibold, styles.valueAccent]}>
              {data.refundMethod}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>최종 환불 금액</Text>
            <Text style={[FONTS.fs_14_semibold, styles.refundAmount]}>
              {formatPrice(data.refundAmount)}
            </Text>
          </View>
        </View>

        {/* 취소 사유 */}
        <View style={[styles.section, styles.sectionLast]}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            취소 사유
          </Text>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]} />
            <Text style={[FONTS.fs_14_medium, styles.value, {color: COLORS.grayscale_400}]}>
              {data.cancelReason}
            </Text>
          </View>
        </View>
    </View>
  );
};

export default GuesthouseCancelledReceipt;
