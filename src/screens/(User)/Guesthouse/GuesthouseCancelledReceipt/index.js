import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import styles from './GuesthouseCancelledReceipt.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import dayjs from 'dayjs';
import {normalizeRefundPolicies} from '@utils/refundPolicyAgreement';

import XBtn from '@assets/images/x_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';

const GuesthouseCancelledReceipt = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const reservationId = route?.params?.reservationId ?? null;
  const reservationItem = route?.params?.reservationItem ?? null;
  const [dto, setDto] = useState(null);
  const [isPolicyExpanded, setIsPolicyExpanded] = useState(false);

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

  const data = useMemo(() => {
    const cancelPolicyInfo = (() => {
      const appliedRate = dto?.refundRateApplied;
      if (typeof appliedRate !== 'number') return { text: '-', dailyInfo: null, totalNights: 1 };

      const freeCancelDeadline = dto?.freeCancelDeadlineAt ?? reservationItem?.freeCancelDeadlineAt;
      const cancelTimeStr = dto?.cancelledAt ?? new Date().toISOString();
      const isFreeCancel = freeCancelDeadline && dayjs(cancelTimeStr).isBefore(dayjs(freeCancelDeadline).add(1, 'minute'));

      let checkInDateObj = null;
      let checkOutDateObj = null;
      const checkInStr = dto?.checkIn ?? reservationItem?.checkIn;
      const checkOutStr = dto?.checkOut ?? reservationItem?.checkOut;

      if (checkInStr) {
        checkInDateObj = dayjs(checkInStr.replace(/\. /g, '-').replace(/\./g, '-')).startOf('day');
      }
      if (checkOutStr) {
        checkOutDateObj = dayjs(checkOutStr.replace(/\. /g, '-').replace(/\./g, '-')).startOf('day');
      }
      const cancelDateObj = dayjs(cancelTimeStr).startOf('day');

      const totalNights = (checkInDateObj && checkOutDateObj) ? checkOutDateObj.diff(checkInDateObj, 'day') : 1;

      if (totalNights <= 1 || isFreeCancel) {
        let diffDays = checkInDateObj ? checkInDateObj.diff(cancelDateObj, 'day') : null;
        let text = `취소 (${appliedRate}% 환불)`;
        if (isFreeCancel) {
          text = `무료 취소 기한 내 취소 (${appliedRate}% 환불)`;
        } else if (diffDays !== null) {
          if (diffDays <= 0) text = `체크인 당일 취소 (${appliedRate}% 환불)`;
          else text = `${diffDays}일 전 취소 (${appliedRate}% 환불)`;
        }
        return { text, dailyInfo: null, totalNights };
      }

      const policyData = dto?.refundPolicy;
      const policies = normalizeRefundPolicies(policyData?.policies ?? []);

      const dailyInfo = [];
      const totalPaid = typeof dto?.totalAmount === 'number' ? dto.totalAmount : 0;
      const basePrice = Math.round(totalPaid / totalNights);
      let accumulatedPrice = 0;
      let totalFrontendRefundAmount = 0;

      for (let i = 0; i < totalNights; i++) {
        const currentNightDate = checkInDateObj.add(i, 'day');
        const diffDays = currentNightDate.diff(cancelDateObj, 'day');
        
        let rate = 0;
        let label = '';
        if (isFreeCancel) {
          rate = 100;
          label = '무료 취소 기한 내 취소';
        } else if (diffDays <= 0) {
          rate = policyData?.sameDayRefundRate ?? 0;
          label = '체크인 당일 취소';
        } else {
          if (policies.length > 0 && diffDays > policies[0].daysBeforeCheckin) {
            rate = policyData?.defaultRefundRate ?? 100;
          } else {
            const matched = policies.find(p => p.daysBeforeCheckin <= diffDays);
            if (matched) rate = matched.refundRate;
            else rate = policyData?.sameDayRefundRate ?? 0;
          }
          label = `${diffDays}일 전 취소`;
        }

        let dailyAmount = basePrice;
        if (i === totalNights - 1) {
          dailyAmount = totalPaid - accumulatedPrice;
        }
        accumulatedPrice += dailyAmount;

        const refundAmt = Math.floor(dailyAmount * (rate / 100));
        totalFrontendRefundAmount += refundAmt;

        dailyInfo.push({
          nightIndex: i + 1,
          dateStr: currentNightDate.format('MM.DD'),
          daysBeforeLabel: label,
          rate,
          refundAmt
        });
      }

      return {
        text: '차등 수수료 적용',
        dailyInfo,
        totalNights,
        totalFrontendRefundAmount
      };
    })();

    const totalAmount = typeof dto?.totalAmount === 'number' ? dto.totalAmount : 0;
    let refundAmount = typeof dto?.cancelledAmount === 'number' ? dto.cancelledAmount : 0;
    
    if (cancelPolicyInfo.dailyInfo) {
      refundAmount = cancelPolicyInfo.totalFrontendRefundAmount;
    }
    
    const cancelFee = Math.max(totalAmount - refundAmount, 0);

    return {
      statusMessage:
        '예약취소 되었습니다. 환불은 주말/공휴일을 제외한 영업일 기준 3-5일 소요될 수 있습니다.',
      guesthouseName:
        dto?.guesthouse ?? reservationItem?.guesthouseName ?? '',
      roomName: dto?.roomName ?? reservationItem?.roomName ?? '',
      roomDesc: reservationItem?.roomDesc ?? buildRoomDetailText(reservationItem),
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
      paidAmount: totalAmount,
      couponDiscountAmount:
        typeof dto?.couponDiscountAmount === 'number'
          ? dto.couponDiscountAmount
          : 0,
      pointDiscountAmount:
        typeof dto?.pointDiscountAmount === 'number'
          ? dto.pointDiscountAmount
          : 0,
      cancelFee,
      refundMethod: (() => {
        const method =
          (dto?.paymentType && PAYMENT_TYPE_LABEL[dto.paymentType]) ?? '';
        return method ? `${method} 환불` : '';
      })(),
      refundAmount,
      cancelReason: dto?.cancelReason ?? '',
      cancelPolicyInfo,
    };
  }, [dto, reservationItem]);

  const formatPrice = n => `${Number(n || 0).toLocaleString('ko-KR')}원`;
  const formatPoint = n => `${Number(n || 0).toLocaleString('ko-KR')}P`;

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
            <Text style={[FONTS.fs_14_medium, styles.label]}>적용 규정</Text>
            {data.cancelPolicyInfo.dailyInfo ? (
              <TouchableOpacity 
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() => setIsPolicyExpanded(!isPolicyExpanded)}
              >
                <Text style={[FONTS.fs_14_semibold, styles.value, {color: COLORS.semantic_red, marginRight: 4}]}>
                  {data.cancelPolicyInfo.text}
                </Text>
                {isPolicyExpanded ? <ChevronUp width={16} height={16} /> : <ChevronDown width={16} height={16} />}
              </TouchableOpacity>
            ) : (
              <Text style={[FONTS.fs_14_semibold, styles.value, {color: COLORS.semantic_red}]}>
                {data.cancelPolicyInfo.text}
              </Text>
            )}
          </View>

          {isPolicyExpanded && data.cancelPolicyInfo.dailyInfo && (
            <View style={styles.dailyPolicyContainer}>
              {data.cancelPolicyInfo.dailyInfo.map((info, idx) => (
                <View key={idx} style={[styles.dailyPolicyRow, idx !== 0 && styles.dailyPolicyBorder]}>
                  <View>
                    <Text style={[FONTS.fs_14_semibold, styles.dailyPolicyTitle]}>
                      {info.nightIndex}차 ({info.dateStr})
                    </Text>
                    <Text style={[FONTS.fs_12_medium, styles.dailyPolicySub]}>
                      {info.daysBeforeLabel}
                    </Text>
                  </View>
                  <Text style={[FONTS.fs_14_medium, styles.dailyPolicyAmount]}>
                    {info.rate === 0 
                      ? `환불 금액 없음 (0원)` 
                      : `${info.rate}% 환불 (${formatPrice(info.refundAmt)})`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>쿠폰 할인</Text>
            <Text style={[FONTS.fs_14_semibold, styles.value]}>
              {formatPrice(data.couponDiscountAmount)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>포인트 적용</Text>
            <Text style={[FONTS.fs_14_semibold, styles.value]}>
              {formatPoint(data.pointDiscountAmount)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>취소 수수료</Text>
            <Text style={[FONTS.fs_14_semibold, styles.value, {color: COLORS.semantic_red}]}>
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
