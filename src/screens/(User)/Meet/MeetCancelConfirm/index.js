import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import styles from './MeetCancelConfirm.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';
import Header from '@components/Header';
import TermsModal from '@components/modals/TermsModal';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import Toast from 'react-native-toast-message';

import CheckOrange from '@assets/images/check_orange.svg';
import CheckGray from '@assets/images/check_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';

const MeetCancelConfirm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const cancelContext = route?.params?.cancelContext ?? null;
  const reservationId = route?.params?.reservationId ?? null;
  const [reservationDetail, setReservationDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const reasons = ['단순변심', '예약착오', '가격차이', '기타'];
  const nowText = dayjs().format('YYYY. MM. DD (dd) HH:mm');
  const [termsOpen, setTermsOpen] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  useEffect(() => {
    const fetchReservationDetail = async () => {
      if (!reservationId) return;
      try {
        setDetailLoading(true);
        const res = await reservationPaymentApi.getPartyReservationDetail(
          reservationId,
        );
        setReservationDetail(res.data);
      } catch (error) {
        setReservationDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchReservationDetail();
  }, [reservationId]);

  const viewData = useMemo(() => {
    const paymentLabel =
      PAYMENT_TYPE_LABEL[reservationDetail?.paymentType] ?? '';
    const paidAmount =
      typeof reservationDetail?.totalAmount === 'number'
        ? reservationDetail.totalAmount
        : typeof reservationDetail?.amount === 'number'
          ? reservationDetail.amount
          : typeof cancelContext?.paidAmount === 'number'
            ? cancelContext.paidAmount
            : 0;
    const cancelFee =
      typeof cancelContext?.cancelFee === 'number' ? cancelContext.cancelFee : 0;
    const computedRefundAmount = paidAmount - cancelFee;
    const refundAmount =
      typeof cancelContext?.refundAmount === 'number'
        ? cancelContext.refundAmount
        : computedRefundAmount;
    const refundMethod =
      cancelContext?.refundMethod ||
      (paymentLabel ? `${paymentLabel} 환불` : '');

    const startDateTime =
      reservationDetail?.startDateTime ?? cancelContext?.startDateTime ?? null;
    const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      startDateTime,
    );
    const locationText =
      trimJejuPrefix(reservationDetail?.partyLocation ?? '') ||
      reservationDetail?.meetingPlace ||
      cancelContext?.partyLocation ||
      cancelContext?.meetingPlace ||
      '';

    return {
      partyTitle:
        reservationDetail?.partyTitle ?? cancelContext?.partyTitle ?? '',
      partyImage: reservationDetail?.partyImage ?? cancelContext?.partyImage ?? null,
      guesthouseName:
        reservationDetail?.guesthouse ?? cancelContext?.guesthouseName ?? '',
      location: locationText,
      startDateTime,
      startDate: startFormatted.date,
      startTime: startFormatted.time,
      paidAmount,
      cancelFee,
      refundAmount,
      refundMethod,
    };
  }, [reservationDetail, cancelContext]);
  const refundAmount = viewData.refundAmount;
  const startDateTimeText = viewData.startDateTime
    ? dayjs(viewData.startDateTime).format('YY.MM.DD (dd) HH:mm')
    : '-';

  const handleCancelConfirm = async () => {
    if (!reservationId || cancelSubmitting) return;
    try {
      setCancelSubmitting(true);
      const res = await reservationPaymentApi.cancelReservation(
        reservationId,
        'PARTY',
        selectedReason,
      );
      const cancelDetail = res?.data ?? null;
      const nextReservationId =
        cancelDetail?.reservationId ?? reservationId;
      const reservationItem = {
        ...cancelDetail,
        partyTitle: viewData.partyTitle,
        partyImage: viewData.partyImage,
        guesthouseName: viewData.guesthouseName,
        startDateTime: viewData.startDateTime,
        startDate: viewData.startDate,
        startTime: viewData.startTime,
        location: viewData.location,
        partyLocation:
          reservationDetail?.partyLocation ?? cancelContext?.partyLocation ?? null,
        meetingPlace:
          reservationDetail?.meetingPlace ?? cancelContext?.meetingPlace ?? null,
      };
      navigation.replace('MeetCancelSuccess', {
        reservationId: nextReservationId,
        reservationItem,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '예약 취소에 실패했습니다.',
        position: 'top',
        visibilityTime: 2000,
      });
    } finally {
      setCancelSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {detailLoading ? (
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator />
          <Text style={[FONTS.fs_14_medium, {marginTop: 10, color: COLORS.grayscale_500}]}>
            불러오는 중...
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Header title='예약취소'/>
            <View style={styles.body}>
          {/* 안내 배너 */}
          <View style={styles.noticeBox}>
            <Text style={[FONTS.fs_14_semibold, styles.noticeText]}>
              상세 내역을 확인하고 예약을 취소해주세요!
            </Text>
          </View>

          {/* 현재 날짜 및 시간 */}
          <Text style={[FONTS.fs_12_medium, styles.todayText]}>
            {nowText} 기준
          </Text>

          {/* 예약 카드 */}
          <View style={styles.card}>
            {viewData.partyImage ? (
              <Image
                source={{uri: viewData.partyImage}}
                style={styles.thumbnail}
              />
            ) : null}

            <View style={styles.cardInfo}>
              <Text style={[FONTS.fs_16_semibold]}>
                {viewData.partyTitle}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.timeText]}>{startDateTimeText}</Text>
              {/* <Text>
                숙박객 어쩌구 글씨
              </Text> */}
            </View>
          </View>

          <View style={styles.devide}/>

          {/* 환불 정보 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_semibold, {marginBottom: 12}]}>환불 예상 정보</Text>

            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>실 결제 금액</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {viewData.paidAmount.toLocaleString()}원
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>예상 취소 수수료</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {viewData.cancelFee.toLocaleString()}원
              </Text>
            </View>
          </View>

          <View style={styles.devide}/>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>환불 방법</Text>
              <Text style={[FONTS.fs_14_medium, styles.refundMethod]}>
                {viewData.refundMethod}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>최종 환불 금액</Text>
              <Text style={styles.refundAmount}>
                {refundAmount.toLocaleString()}<Text style={{color: COLORS.grayscale_900}}>원</Text>
              </Text>
            </View>
          </View>

          {/* 취소 사유 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_semibold, {marginTop: 12}]}>취소 사유</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setReasonOpen(!reasonOpen)}
            >
              <Text
                style={[
                  FONTS.fs_14_medium,
                  {color: selectedReason ? COLORS.black : COLORS.grayscale_400},
                ]}
              >
                {selectedReason || '취소 사유를 선택해 주세요'}
              </Text>
              {reasonOpen ? (
                <ChevronUp width={24} height={24} />
              ) : (
                <ChevronDown width={24} height={24} />
              )}
            </TouchableOpacity>

            {reasonOpen && (
              <View style={styles.dropdownList}>
                {reasons.map((r, index) => (
                  <React.Fragment key={r}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedReason(r);
                        setReasonOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          selectedReason === r && FONTS.fs_14_semibold,
                          {
                            color:
                              selectedReason === r
                                ? COLORS.primary_orange
                                : COLORS.black,
                          },
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>

                    {index < reasons.length - 1 && (
                      <View style={styles.dropdownDivide} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}

          </View>

          {/* 약관 동의 */}
          <View style={styles.agreeRow}>
            <TouchableOpacity
              style={styles.agreeBox}
              onPress={() => setChecked(!checked)}
            >
              <View
                style={[
                  styles.checkBox,
                  {
                    borderColor: checked
                      ? COLORS.primary_orange
                      : COLORS.grayscale_300,
                  },
                ]}
              >
                {checked ? (
                  <CheckOrange width={20} height={20} />
                ) : (
                  <CheckGray width={20} height={20} />
                )}
              </View>
              <Text style={[styles.agreeText, FONTS.fs_14_regular]}>
                <Text style={[styles.required, FONTS.fs_14_semibold]}>[필수]</Text> 이벤트 취소 / 환불
                규정에 동의합니다.
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTermsOpen(true)}>
              <Text style={[styles.required, FONTS.fs_12_medium]}>보기</Text>
            </TouchableOpacity>
          </View>
          
            </View>
          </ScrollView>

          <TermsModal
            visible={termsOpen}
            onClose={() => setTermsOpen(false)}
            title="이벤트 취소 / 환불 규정"
            content="약관 내용은 준비 중입니다."
            onAgree={() => setTermsOpen(false)}
          />

          {/* 하단 버튼 */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!checked || !selectedReason || cancelSubmitting) && {
                backgroundColor: COLORS.grayscale_300,
              },
            ]}
            disabled={!checked || !selectedReason || cancelSubmitting}
            onPress={handleCancelConfirm}
          >
            <Text style={[styles.submitText, FONTS.fs_14_medium]}>취소 요청하기</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default MeetCancelConfirm;
