import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, Image, ScrollView, BackHandler} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Header from '@components/Header';
import styles from './MeetCancelledReceipt.styles';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';

export default function MeetCancelledReceipt() {
  const navigation = useNavigation();
  const route = useRoute();
  const {reservationId, reservationItem, fromCancelSuccess} = route.params ?? {};
  const [reservationDetail, setReservationDetail] = useState(
    reservationItem ?? null,
  );
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

  const handleBackPress = useCallback(() => {
    if (fromCancelSuccess) {
      navigation.pop(2);
      return true;
    }
    navigation.goBack();
    return true;
  }, [fromCancelSuccess, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!fromCancelSuccess) return undefined;
      const onBackPress = () => {
        navigation.pop(2);
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [fromCancelSuccess, navigation]),
  );

  const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.startDateTime,
  );
  const cancelledFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.cancelledAt,
  );
  const amountText =
    typeof reservationDetail?.amount === 'number'
      ? `${reservationDetail.amount.toLocaleString()}원`
      : '-';
  const cancelledAmountText =
    typeof reservationDetail?.cancelledAmount === 'number'
      ? `${reservationDetail.cancelledAmount.toLocaleString()}원`
      : '-';
  const cancelFeeText =
    typeof reservationDetail?.amount === 'number' &&
    typeof reservationDetail?.cancelledAmount === 'number'
      ? `${(
          reservationDetail.amount - reservationDetail.cancelledAmount
        ).toLocaleString()}원`
      : '-';
  const paymentTypeText = useMemo(() => {
    return PAYMENT_TYPE_LABEL[reservationDetail?.paymentType] || '-';
  }, [reservationDetail?.paymentType]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header
        title="예약 취소"
        onPress={fromCancelSuccess ? handleBackPress : null}
      />

      {loading ? (
        <Loading title="예약 정보를 불러오고 있어요." />
      ) : (
        <>
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

          <Text style={[FONTS.fs_12_medium, styles.subText]}>
            취소일시 {cancelledFormatted.date} {cancelledFormatted.time}
          </Text>

          {/* 취소 정보 */}
          <View style={styles.paymentBox}>
            <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
              취소/환불 정보
            </Text>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                실 결제 금액
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                (취소){' '}
                <Text style={styles.strikeThrough}>{amountText}</Text>
              </Text>
            </View>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                취소 수수료
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                {cancelFeeText}
              </Text>
            </View>
          </View>

          <View style={styles.divide}/>

          <View style={styles.paymentBox}>
            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                환불 방법
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue, {color:COLORS.primary_orange}]}>
                {paymentTypeText}
              </Text>
            </View>

            <View style={styles.priceInfoRow}>
              <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                최종 환불 금액
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.priceValue, {color:COLORS.primary_orange}]}>
                {cancelledAmountText}
              </Text>
            </View>
          </View>
          
          <View>
            <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
              취소 사유
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.reasonText]}>
              {reservationDetail?.cancelReason || '-'}
            </Text>
          </View>

        </View>

        <View style={styles.warningBox}>
          <Text style={[FONTS.fs_14_semibold, styles.warningText]}>
            예약취소 되었습니다. 환불은 주말/공휴일을 제외한 영업일 기준 3-5일 소요될 수 있습니다.
          </Text>
        </View>
        </>
      )}
    </ScrollView>
  );
}
