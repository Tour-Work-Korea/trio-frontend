import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import {useRoute} from '@react-navigation/native';

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

export default function MeetPaymentReceipt() {
  const route = useRoute();
  const {reservationId} = route.params ?? {};
  const [reservationDetail, setReservationDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReservationDetail = useCallback(async () => {
    if (!reservationId) return;
    try {
      setLoading(true);
      const {data} =
        await reservationPaymentApi.getPartyReservationDetail(reservationId);
      setReservationDetail(data);
    } catch (e) {
      console.log('파티 예약 상세 불러오기 실패', e);
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    fetchReservationDetail();
  }, [fetchReservationDetail]);

  const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.startDateTime,
  );
  const approvedFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.approvedAt,
  );
  const amountText =
    typeof reservationDetail?.amount === 'number'
      ? `${reservationDetail.amount.toLocaleString()}원`
      : '-';
  const paymentTypeText = useMemo(() => {
    return PAYMENT_TYPE_LABEL[reservationDetail?.paymentType] || '-';
  }, [reservationDetail?.paymentType]);
  const partyDescription = reservationDetail?.partyDescription ?? '';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header title="예약 확정" />

      {loading ? (
        <Loading title="예약 정보를 불러오고 있어요." />
      ) : (
        <View style={styles.body}>
          {/* 이벤트 제목, 사진 */}
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

          {/* 결제 정보 */}
          <View style={styles.paymentBox}>
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
              <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                {amountText}
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
          </Text>

          {/* 예약 취소 버튼 */}
          <ButtonWhite
            title="예약취소"
            backgroundColor={COLORS.cancel_btn_bg}
            textColor={COLORS.semantic_red}
          />
        </View>
      )}
    </ScrollView>
  );
}
