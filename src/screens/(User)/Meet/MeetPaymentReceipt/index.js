import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Header from '@components/Header';
import styles from './MeetPaymentReceipt.styles';
import ButtonWhite from '@components/ButtonWhite';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import AlertModal from '@components/modals/AlertModal';

export default function MeetPaymentReceipt() {
  const navigation = useNavigation();
  const route = useRoute();
  const {reservationId, isFromDeeplink = false} = route.params ?? {};
  const [reservationDetail, setReservationDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelUnavailableOpen, setCancelUnavailableOpen] = useState(false);

  const fetchReservationDetail = useCallback(async () => {
    if (!reservationId) return;
    try {
      setLoading(true);
      const {data} =
        await reservationPaymentApi.getPartyReservationDetail(reservationId);
      setReservationDetail(data);
    } catch (e) {
      console.log('파티 예약 상세 불러오기 실패', e);
      if (isFromDeeplink) {
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'MainTabs',
              params: {
                screen: '마이',
                params: {screen: 'UserMyPage'},
              },
            },
            {name: 'UserMeetReservationCheck'},
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isFromDeeplink, navigation, reservationId]);

  useEffect(() => {
    fetchReservationDetail();
  }, [fetchReservationDetail]);

  const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.startDateTime,
  );
  const endFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.endDateTime,
  );
  const approvedFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.approvedAt,
  );
  const formatPrice = value => `${Number(value || 0).toLocaleString('ko-KR')}원`;
  const formatPoint = value => `${Number(value || 0).toLocaleString('ko-KR')}P`;
  const couponDiscountAmount =
    typeof reservationDetail?.couponDiscountAmount === 'number'
      ? reservationDetail.couponDiscountAmount
      : 0;
  const pointDiscountAmount =
    typeof reservationDetail?.pointDiscountAmount === 'number'
      ? reservationDetail.pointDiscountAmount
      : 0;
  const finalAmount =
    typeof reservationDetail?.totalAmount === 'number'
      ? reservationDetail.totalAmount
      : typeof reservationDetail?.amount === 'number'
        ? reservationDetail.amount
        : 0;
  const originalAmount = finalAmount + couponDiscountAmount + pointDiscountAmount;
  const paymentTypeText = useMemo(() => {
    return PAYMENT_TYPE_LABEL[reservationDetail?.paymentType] || '-';
  }, [reservationDetail?.paymentType]);
  const partyDescription = reservationDetail?.partyDescription ?? '';
  const reservationRequest = reservationDetail?.reservationRequest?.trim() ?? '';
  const handlePressCancel = () => {
    const startDate = reservationDetail?.startDateTime
      ? new Date(reservationDetail.startDateTime)
      : null;

    if (startDate && !Number.isNaN(startDate.getTime()) && startDate <= new Date()) {
      setCancelUnavailableOpen(true);
      return;
    }

    navigation.navigate('MeetCancelConfirm', {
      reservationId,
      cancelContext: {
        partyTitle: reservationDetail?.partyTitle,
        partyImage: reservationDetail?.partyImage,
        guesthouseName: reservationDetail?.guesthouseName,
        startDateTime: reservationDetail?.startDateTime,
        endDateTime: reservationDetail?.endDateTime,
        partyLocation:
          reservationDetail?.partyLocation || reservationDetail?.meetingPlace,
        ...(typeof reservationDetail?.amount === 'number'
          ? {paidAmount: reservationDetail.amount}
          : {}),
        ...(typeof reservationDetail?.cancelFee === 'number'
          ? {cancelFee: reservationDetail.cancelFee}
          : {}),
        ...(typeof reservationDetail?.refundAmount === 'number'
          ? {refundAmount: reservationDetail.refundAmount}
          : {}),
        ...(reservationDetail?.refundMethod
          ? {refundMethod: reservationDetail.refundMethod}
          : {}),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header title="예약 확정" />

        {loading ? (
          <Loading title="예약 정보를 불러오고 있어요." />
        ) : (
          <View style={styles.body}>
          {/* 콘텐츠 제목, 사진 */}
          <View style={styles.card}>
            <Text style={[FONTS.fs_18_medium, styles.title]}>
              {reservationDetail?.partyTitle || '-'}
            </Text>

            {reservationDetail?.partyImage ? (
              <Image
                source={{uri: reservationDetail.partyImage}}
                style={styles.image}
              />
            ) : null}
          </View>

          <View style={styles.divide} />

          <View style={styles.infoRow}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>날짜</Text>
            <Text style={[FONTS.fs_14_medium, styles.value]}>
              {startFormatted.date}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>시간</Text>
            <Text style={[FONTS.fs_14_medium, styles.value]}>
              {startFormatted.time}
              {endFormatted.time ? ` ~ ${endFormatted.time}` : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>장소</Text>
            <Text style={[FONTS.fs_14_medium, styles.value]}>
              {trimJejuPrefix(reservationDetail?.partyLocation) ||
                reservationDetail?.meetingPlace ||
                '-'}
            </Text>
          </View>

          {/* 안내 박스 */}
          <View style={styles.noticeBox}>
            <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
              {partyDescription}
            </Text>
          </View>

          {reservationRequest ? (
            <View style={styles.requestBox}>
              <Text style={[FONTS.fs_14_semibold, styles.requestTitle]}>
                요청 사항
              </Text>
              <Text style={[FONTS.fs_14_regular, styles.requestText]}>
                {reservationRequest}
              </Text>
            </View>
          ) : null}

          {/* 결제 정보 */}
          {/* <View style={styles.paymentBox}>
            <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
              결제 정보
            </Text>

            <Text style={[FONTS.fs_12_medium, styles.subText]}>
              결제일시 {approvedFormatted.date} {approvedFormatted.time}
            </Text>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                실 결제 금액
              </Text>
              <View style={styles.priceValueInline}>
                <Text style={[FONTS.fs_14_semibold, styles.priceValue]}>
                  {formatPrice(finalAmount)}
                </Text>
                <Text style={[FONTS.fs_14_regular, styles.priceValueStrike]}>
                  {formatPrice(originalAmount)}
                </Text>
              </View>
            </View>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                쿠폰 할인
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                - {formatPrice(couponDiscountAmount)}
              </Text>
            </View>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                포인트 적용
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                - {formatPoint(pointDiscountAmount)}
              </Text>
            </View>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                결제 수단
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                {paymentTypeText}
              </Text>
            </View>
          </View>

          <Text style={[FONTS.fs_12_medium, styles.warningText]}>
            전날까지 취소 시 전액 환불됩니다.{'\n'}
            당일 취소는 환불이 불가능합니다.
          </Text> */}

          {/* 예약 취소 버튼 */}
          <ButtonWhite
            title="예약취소"
            backgroundColor={COLORS.secondary_red}
            textColor={COLORS.semantic_red}
            onPress={handlePressCancel}
          />
          </View>
        )}
      </ScrollView>

      <AlertModal
        visible={cancelUnavailableOpen}
        message="시작 시간이 지나 취소가 불가능합니다"
        buttonText="닫기"
        onPress={() => setCancelUnavailableOpen(false)}
        onRequestClose={() => setCancelUnavailableOpen(false)}
      />
    </View>
  );
}
