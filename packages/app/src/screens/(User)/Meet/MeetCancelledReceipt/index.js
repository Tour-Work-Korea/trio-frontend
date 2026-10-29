import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, ScrollView, BackHandler} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Header from '@components/Header';
import styles from './MeetCancelledReceipt.styles';
import ScreenSkeleton from './LoadingSkeleton';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import AppImage from '@components/AppImage';

export default function MeetCancelledReceipt() {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {reservationId, reservationItem, fromCancelSuccess} =
    route.params ?? {};
  const [reservationDetail, setReservationDetail] = useState(
    reservationItem ?? null,
  );
  const [loading, setLoading] = useState(false);

  const fetchReservationDetail = useCallback(async () => {
    if (!reservationId) return;
    try {
      setLoading(true);
      const {data} = await reservationPaymentApi.getPartyReservationDetail(
        reservationId,
      );
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
  const endFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.endDateTime,
  );
  const cancelledAt =
    reservationDetail?.cancelledAt ?? reservationDetail?.approvalDeadlineAt;
  const cancelledFormatted = cancelledAt
    ? formatLocalDateTimeToDotAndTimeWithDay(cancelledAt)
    : null;
  const formatPrice = value =>
    t('common.valueWon', {value1: Number(value || 0).toLocaleString('ko-KR')});
  const formatPoint = value => `${Number(value || 0).toLocaleString('ko-KR')}P`;
  const paidAmount =
    typeof reservationDetail?.totalAmount === 'number'
      ? reservationDetail.totalAmount
      : typeof reservationDetail?.amount === 'number'
      ? reservationDetail.amount
      : 0;
  const couponDiscountAmount =
    typeof reservationDetail?.couponDiscountAmount === 'number'
      ? reservationDetail.couponDiscountAmount
      : 0;
  const pointDiscountAmount =
    typeof reservationDetail?.pointDiscountAmount === 'number'
      ? reservationDetail.pointDiscountAmount
      : 0;
  const cancelledAmountText =
    typeof reservationDetail?.cancelledAmount === 'number'
      ? t('common.valueWon', {
          value1: reservationDetail.cancelledAmount.toLocaleString(),
        })
      : '-';
  const cancelFeeText =
    typeof paidAmount === 'number' &&
    typeof reservationDetail?.cancelledAmount === 'number'
      ? t('common.valueWon', {
          value1: (
            paidAmount - reservationDetail.cancelledAmount
          ).toLocaleString(),
        })
      : '-';
  const paymentTypeText = useMemo(() => {
    return PAYMENT_TYPE_LABEL[reservationDetail?.paymentType] || '-';
  }, [reservationDetail?.paymentType]);
  const isRejected = reservationDetail?.approvalStatus === 'REJECTED';
  const isExpired = reservationDetail?.approvalStatus === 'EXPIRED';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header
        title={
          isRejected
            ? t('common.applicationRejected')
            : isExpired
            ? t('common.applicationExpires')
            : t('common.cancelApplication_1ffccc')
        }
        onPress={fromCancelSuccess ? handleBackPress : null}
      />

      {loading ? (
        <ScreenSkeleton layout={styles} title={t('meet.retrievingApplicationInformation')} />
      ) : (
        <>
          <View style={styles.body}>
            {/* 콘텐츠 제목, 사진 */}
            <View style={styles.card}>
              <Text style={[FONTS.fs_18_medium, styles.title]}>
                {reservationDetail?.partyTitle || '-'}
              </Text>

              {reservationDetail?.partyImage ? (
                <AppImage
                  uri={reservationDetail.partyImage}
                  style={styles.image}
                />
              ) : null}
            </View>

            <View style={styles.divide} />

            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.date')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {startFormatted.date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.hour')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {startFormatted.time}
                {endFormatted.time ? ` ~ ${endFormatted.time}` : ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.location_962eeb')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {trimJejuPrefix(
                  reservationDetail?.partyLocation ||
                    reservationDetail?.meetingPlace,
                ) || '-'}
              </Text>
            </View>

            {cancelledFormatted ? (
              <Text style={[FONTS.fs_12_medium, styles.subText]}>
                {isExpired
                  ? t('meet.expirationDateAndTime')
                  : t('meet.cancellationDateAndTime_64dad5')}{' '}
                {cancelledFormatted.date} {cancelledFormatted.time}
              </Text>
            ) : null}

            {(paidAmount > 0 || reservationDetail?.paymentType) && (
              <View>
                <View style={styles.paymentBox}>
                  <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
                    {t('common.cancellationRefundInformation')}
                  </Text>

                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                      {t('common.actualPaymentAmount')}
                    </Text>
                    <View style={styles.priceValueInline}>
                      <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                        {formatPrice(paidAmount)}
                      </Text>
                      <Text style={[FONTS.fs_14_medium, styles.strikeThrough]}>
                        {formatPrice(
                          paidAmount +
                            couponDiscountAmount +
                            pointDiscountAmount,
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                      {t('common.couponDiscount')}
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                      {formatPrice(couponDiscountAmount)}
                    </Text>
                  </View>

                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                      {t('common.applyPoints')}
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                      {formatPoint(pointDiscountAmount)}
                    </Text>
                  </View>

                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                      {t('common.cancellationFee')}
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                      {cancelFeeText}
                    </Text>
                  </View>
                </View>

                <View style={styles.divide} />

                <View style={styles.paymentBox}>
                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                      {t('common.refundMethod')}
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.priceValue,
                        {color: COLORS.primary_orange},
                      ]}>
                      {paymentTypeText === '-'
                        ? '-'
                        : t('meet.valueRefund', {
                            paymentTypeText: paymentTypeText,
                          })}
                    </Text>
                  </View>

                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_medium, styles.priceLabel]}>
                      {t('common.finalRefundAmount')}
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.priceValue,
                        {color: COLORS.primary_orange},
                      ]}>
                      {cancelledAmountText}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View>
              <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
                {t('common.reasonForCancellation')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.reasonText]}>
                {reservationDetail?.cancelReason || '-'}
              </Text>
            </View>
          </View>

          {/* <View style={styles.warningBox}>
           <Text style={[FONTS.fs_14_semibold, styles.warningText]}>
             예약취소 되었습니다. 환불은 주말/공휴일을 제외한 영업일 기준 3-5일 소요될 수 있습니다.
           </Text>
          </View> */}

          <View style={styles.warningBox}>
            <Text style={[FONTS.fs_14_semibold, styles.warningText]}>
              {isRejected
                ? t('meet.yourApplicationHasBeenRejected')
                : isExpired
                ? t('meet.yourApplicationHasExpired')
                : t('meet.applicationHasBeenCanceled')}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
