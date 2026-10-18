import {useTranslation} from 'react-i18next';
import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import styles from './GuesthouseCancelConfirm.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import {formatLocalDateToDotWithDay} from '@utils/formatDate';
import {
  applyRefundPoliciesToAgreementHtml,
  normalizeRefundPolicies,
} from '@utils/refundPolicyAgreement';
import {getRefundPolicyResult, REFUND_POLICY_RESULT} from '@utils/refundPolicy';
import {AGREEMENT_CONTENT} from '@data/agreeContents';
import Header from '@components/Header';
import TermsModal from '@components/modals/TermsModal';
import ReservationCancelConfirmModal from '@components/modals/Guesthouse/ReservationCancelConfirmModal';
import AlertModal from '@components/modals/AlertModal';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import Toast from 'react-native-toast-message';
import AppImage from '@components/AppImage';

import CheckOrange from '@assets/images/check_orange.svg';
import CheckGray from '@assets/images/check_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';

const GuesthouseCancelConfirm = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const cancelContext = route?.params?.cancelContext ?? null;
  const reservationId = route?.params?.reservationId ?? null;
  const [reservationDetail, setReservationDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const reasons = [
    t('common.simpleChangeOfMind'),
    t('common.reservationError'),
    t('common.priceDifference'),
    t('common.etc'),
  ];
  const nowText = dayjs().format('YYYY. MM. DD (dd) HH:mm');
  const [termsOpen, setTermsOpen] = useState(false);
  const [isPolicyExpanded, setIsPolicyExpanded] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [refundlessAlertOpen, setRefundlessAlertOpen] = useState(false);
  const [refundlessAlertContent, setRefundlessAlertContent] = useState({
    title: '',
    message: '',
    highlightText: t('guesthouse.withoutRefund'),
  });

  useEffect(() => {
    const fetchReservationDetail = async () => {
      if (!reservationId) return;
      try {
        setDetailLoading(true);
        const res = await reservationPaymentApi.getReservationPaymentDetail(
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

  const isPendingReservation =
    reservationDetail?.reservationStatus === 'PENDING' ||
    reservationDetail?.approvalStatus === 'WAITING_HOST' ||
    cancelContext?.reservationStatus === 'PENDING' ||
    cancelContext?.approvalStatus === 'WAITING_HOST';

  const viewData = useMemo(() => {
    const paymentLabel =
      PAYMENT_TYPE_LABEL[reservationDetail?.paymentType] ?? '';
    const couponDiscountAmount =
      typeof reservationDetail?.couponDiscountAmount === 'number'
        ? reservationDetail.couponDiscountAmount
        : 0;
    const pointDiscountAmount =
      typeof reservationDetail?.pointDiscountAmount === 'number'
        ? reservationDetail.pointDiscountAmount
        : 0;
    const paidAmount =
      typeof reservationDetail?.totalAmount === 'number'
        ? reservationDetail.totalAmount
        : typeof reservationDetail?.amount === 'number'
        ? reservationDetail.amount
        : typeof cancelContext?.paidAmount === 'number'
        ? cancelContext.paidAmount
        : 0;
    const refundRateApplied = isPendingReservation
      ? 100
      : typeof reservationDetail?.refundRateApplied === 'number'
      ? reservationDetail.refundRateApplied
      : typeof cancelContext?.refundRateApplied === 'number'
      ? cancelContext.refundRateApplied
      : null;
    const computedRefundAmount =
      refundRateApplied !== null
        ? Math.floor((paidAmount * refundRateApplied) / 100)
        : typeof cancelContext?.refundAmount === 'number'
        ? cancelContext.refundAmount
        : paidAmount;
    const cancelFee =
      refundRateApplied !== null
        ? Math.max(paidAmount - computedRefundAmount, 0)
        : typeof cancelContext?.cancelFee === 'number'
        ? cancelContext.cancelFee
        : 0;
    const refundAmount = isPendingReservation
      ? paidAmount
      : typeof reservationDetail?.refundRateApplied === 'number'
      ? computedRefundAmount
      : typeof cancelContext?.refundAmount === 'number'
      ? cancelContext.refundAmount
      : computedRefundAmount;
    const refundMethod =
      cancelContext?.refundMethod ||
      (paymentLabel
        ? t('common.valueRefund', {paymentLabel: paymentLabel})
        : '');

    return {
      guesthouseName:
        reservationDetail?.guesthouse ?? cancelContext?.guesthouseName ?? '',
      guesthouseImage: cancelContext?.guesthouseImage ?? null,
      roomName: reservationDetail?.roomName ?? cancelContext?.roomName ?? '',
      roomDesc: cancelContext?.roomDesc ?? '',
      checkInDate: reservationDetail?.checkIn
        ? formatLocalDateToDotWithDay(reservationDetail.checkIn)
        : cancelContext?.checkInDate ?? '',
      checkInTime:
        cancelContext?.checkInTime ??
        (reservationDetail?.checkIn?.includes('T')
          ? reservationDetail.checkIn.split('T')[1].slice(0, 5)
          : ''),
      checkOutDate: reservationDetail?.checkOut
        ? formatLocalDateToDotWithDay(reservationDetail.checkOut)
        : cancelContext?.checkOutDate ?? '',
      checkOutTime:
        cancelContext?.checkOutTime ??
        (reservationDetail?.checkOut?.includes('T')
          ? reservationDetail.checkOut.split('T')[1].slice(0, 5)
          : ''),
      originalAmount: paidAmount + couponDiscountAmount + pointDiscountAmount,
      paidAmount,
      couponDiscountAmount,
      pointDiscountAmount,
      refundRateApplied,
      cancelFee,
      refundAmount,
      refundMethod,
    };
  }, [reservationDetail, cancelContext, isPendingReservation, t]);
  const formatPrice = n =>
    t('common.valueWon', {value1: Number(n || 0).toLocaleString('ko-KR')});
  const formatPoint = n => `${Number(n || 0).toLocaleString('ko-KR')}P`;
  const cancelPolicyDoc = AGREEMENT_CONTENT.USER?.GUESTHOUSE_RESERVATION_POLICY;
  const refundPolicies = normalizeRefundPolicies(
    reservationDetail?.refundPolicy?.policies ??
      reservationDetail?.refundPolicies ??
      cancelContext?.refundPolicies,
  );
  const cancelPolicyContent = (cancelPolicyDoc?.detail || '').replace(
    /{{guesthouseName}}/g,
    viewData?.guesthouseName || t('common.theGuesthouse'),
  );
  const cancelPolicyHtml = applyRefundPoliciesToAgreementHtml(
    cancelPolicyDoc?.detailHtml || '',
    refundPolicies,
  ).replace(
    /{{guesthouseName}}/g,
    viewData?.guesthouseName || t('common.theGuesthouse'),
  );
  const freeCancelUntil = useMemo(() => {
    if (cancelContext?.freeCancelUntil) {
      return cancelContext.freeCancelUntil;
    }

    if (!reservationDetail?.approvedAt) {
      return null;
    }

    const approvedAt = dayjs(reservationDetail.approvedAt);
    return approvedAt.isValid()
      ? approvedAt.add(10, 'minute').toISOString()
      : null;
  }, [cancelContext, reservationDetail]);

  const cancelPolicyInfo = useMemo(() => {
    if (isPendingReservation) {
      return {
        text: t('guesthouse.cancellationBeforeApproval100Refund'),
        dailyInfo: null,
        totalNights: 1,
      };
    }

    const appliedRate = viewData.refundRateApplied;
    if (appliedRate === null)
      return {text: '-', dailyInfo: null, totalNights: 1};

    const freeCancelDeadline =
      reservationDetail?.freeCancelDeadlineAt ??
      cancelContext?.freeCancelDeadlineAt;
    const cancelTimeStr =
      reservationDetail?.cancelledAt ?? new Date().toISOString();
    const isFreeCancel =
      freeCancelDeadline &&
      dayjs(cancelTimeStr).isBefore(dayjs(freeCancelDeadline).add(1, 'minute'));

    let checkInDateObj = null;
    let checkOutDateObj = null;
    const checkInStr = reservationDetail?.checkIn ?? cancelContext?.checkInDate;
    const checkOutStr =
      reservationDetail?.checkOut ?? cancelContext?.checkOutDate;
    if (checkInStr) {
      checkInDateObj = dayjs(
        checkInStr.replace(/\. /g, '-').replace(/\./g, '-'),
      ).startOf('day');
    }
    if (checkOutStr) {
      checkOutDateObj = dayjs(
        checkOutStr.replace(/\. /g, '-').replace(/\./g, '-'),
      ).startOf('day');
    }
    const cancelDateObj = dayjs(cancelTimeStr).startOf('day');

    const totalNights =
      checkInDateObj && checkOutDateObj
        ? checkOutDateObj.diff(checkInDateObj, 'day')
        : 1;

    if (totalNights <= 1 || isFreeCancel) {
      let diffDays = checkInDateObj
        ? checkInDateObj.diff(cancelDateObj, 'day')
        : null;
      let text = t('common.cancellationValueRefund', {
        appliedRate: appliedRate,
      });
      if (isFreeCancel) {
        text = t('common.cancellationWithinFreeCancellationPeriodValueRefund', {
          appliedRate: appliedRate,
        });
      } else if (diffDays !== null) {
        if (diffDays <= 0)
          text = t('common.cancellationOnTheDayOfCheckInValueRefund', {
            appliedRate: appliedRate,
          });
        else
          text = t('common.cancellationValueDaysInAdvanceValueRefund', {
            diffDays: diffDays,
            appliedRate: appliedRate,
          });
      }
      return {text, dailyInfo: null, totalNights};
    }

    const policyData =
      reservationDetail?.refundPolicy ?? cancelContext?.refundPolicy;
    const policies = normalizeRefundPolicies(
      policyData?.policies ??
        reservationDetail?.refundPolicies ??
        cancelContext?.refundPolicies,
    );

    const dailyInfo = [];
    const basePrice = Math.round(viewData.paidAmount / totalNights);
    let accumulatedPrice = 0;
    let totalFrontendRefundAmount = 0;

    for (let i = 0; i < totalNights; i++) {
      const currentNightDate = checkInDateObj.add(i, 'day');
      const diffDays = currentNightDate.diff(cancelDateObj, 'day');

      let rate = 0;
      let label = '';
      if (isFreeCancel) {
        rate = 100;
        label = t('common.cancelWithinTheFreeCancellationDeadline');
      } else if (diffDays <= 0) {
        rate = policyData?.sameDayRefundRate ?? 0;
        label = t('common.cancellationOnTheDayOfCheckIn');
      } else {
        if (policies.length > 0 && diffDays > policies[0].daysBeforeCheckin) {
          rate = policyData?.defaultRefundRate ?? 100;
        } else {
          const matched = policies.find(p => p.daysBeforeCheckin <= diffDays);
          if (matched) rate = matched.refundRate;
          else rate = policyData?.sameDayRefundRate ?? 0;
        }
        label = t('common.cancelValueDaysAgo', {diffDays: diffDays});
      }

      let dailyAmount = basePrice;
      if (i === totalNights - 1) {
        dailyAmount = viewData.paidAmount - accumulatedPrice;
      }
      accumulatedPrice += dailyAmount;

      const refundAmt = Math.floor(dailyAmount * (rate / 100));
      totalFrontendRefundAmount += refundAmt;

      dailyInfo.push({
        nightIndex: i + 1,
        dateStr: currentNightDate.format('MM.DD'),
        daysBeforeLabel: label,
        rate,
        refundAmt,
      });
    }

    return {
      text: t('common.differentialFeesApply'),
      dailyInfo,
      totalNights,
      totalFrontendRefundAmount,
    };
  }, [
    isPendingReservation,
    viewData.refundRateApplied,
    viewData.paidAmount,
    reservationDetail,
    cancelContext,
    t,
  ]);

  const refundAmount = cancelPolicyInfo?.dailyInfo
    ? cancelPolicyInfo.totalFrontendRefundAmount
    : viewData.refundAmount;

  const cancelFee = cancelPolicyInfo?.dailyInfo
    ? viewData.paidAmount - cancelPolicyInfo.totalFrontendRefundAmount
    : viewData.cancelFee;

  const handlePressSubmit = () => {
    if (isPendingReservation) {
      setCancelConfirmOpen(true);
      return;
    }

    const result = getRefundPolicyResult({
      checkInDate: reservationDetail?.checkIn ?? cancelContext?.checkInDate,
      checkInTime: cancelContext?.checkInTime,
      freeCancelUntil,
    });
    const isRefundUnavailable = refundAmount === 0;

    if (!isRefundUnavailable) {
      setCancelConfirmOpen(true);
      return;
    }

    if (
      result === REFUND_POLICY_RESULT.CHECKIN_DAY ||
      result === REFUND_POLICY_RESULT.AFTER_CHECKIN_TIME
    ) {
      setRefundlessAlertContent({
        title: t('common.onTheDayOfCheckIn'),
        message: t('guesthouse.refundsAreNotPossibleOnTheDayOfCheckIn'),

        highlightText: t('guesthouse.withoutRefund'),
      });
      setRefundlessAlertOpen(true);
      return;
    }

    if (result === REFUND_POLICY_RESULT.FREE_CANCEL_EXPIRED) {
      setRefundlessAlertContent({
        title: t('guesthouse.noRefundAmount'),
        message: t(
          'guesthouse.thereAreNoRefundsAvailableUnderOurCurrentCancellationPolicy',
        ),

        highlightText: t('guesthouse.withoutRefund'),
      });
      setRefundlessAlertOpen(true);
      return;
    }

    setCancelConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!reservationId || cancelSubmitting) return;
    try {
      setCancelSubmitting(true);
      const res = await reservationPaymentApi.cancelReservation(
        reservationId,
        'GUESTHOUSE',
        selectedReason,
      );
      const cancelDetail = res?.data ?? null;
      const nextReservationId = cancelDetail?.reservationId ?? reservationId;
      const reservationItem = {
        ...cancelDetail,
        guesthouseImage: viewData.guesthouseImage,
        roomDesc: viewData.roomDesc,
        guesthouseCheckIn: viewData.checkInTime,
        guesthouseCheckOut: viewData.checkOutTime,
        reservationStatus:
          cancelDetail?.reservationStatus ??
          reservationDetail?.reservationStatus ??
          cancelContext?.reservationStatus,
        approvalStatus:
          cancelDetail?.approvalStatus ??
          reservationDetail?.approvalStatus ??
          cancelContext?.approvalStatus,
        isCancelledBeforeHostApproval: isPendingReservation,
      };
      setCancelConfirmOpen(false);
      navigation.replace('GuesthouseCancelSuccess', {
        reservationId: nextReservationId,
        reservationItem,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.cancellationOfReservationFailed'),
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
        <View
          style={[
            styles.container,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <ActivityIndicator />
          <Text
            style={[
              FONTS.fs_14_medium,
              {marginTop: 10, color: COLORS.grayscale_500},
            ]}>
            {t('common.loading_c21bd6')}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Header title={t('common.cancelReservation_fb9a3e')} />
            <View style={styles.body}>
              {/* 안내 배너 */}
              <View style={styles.noticeBox}>
                <Text style={[FONTS.fs_14_semibold, styles.noticeText]}>
                  {t(
                    'guesthouse.pleaseCheckTheDetailsAndCancelYourReservation',
                  )}
                </Text>
              </View>

              {/* 현재 날짜 및 시간 */}
              <Text style={[FONTS.fs_12_medium, styles.todayText]}>
                {nowText}
                {t('common.standard')}
              </Text>

              {/* 예약 카드 */}
              <View style={styles.card}>
                {viewData.guesthouseImage ? (
                  <AppImage
                    uri={viewData.guesthouseImage}
                    style={styles.thumbnail}
                  />
                ) : null}

                <View style={styles.cardInfo}>
                  <Text style={[FONTS.fs_16_semibold]}>
                    {viewData.guesthouseName}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.roomName]}>
                    {viewData.roomName}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.roomDesc]}>
                    {viewData.roomDesc}
                  </Text>
                </View>
              </View>

              {/* 날짜 */}
              <View style={styles.dateRow}>
                <View style={{flex: 1}}>
                  <Text style={[FONTS.fs_14_semibold]}>
                    {viewData.checkInDate}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.time]}>
                    {viewData.checkInTime}
                  </Text>
                </View>

                <View style={styles.dateDivider} />

                <View style={{flex: 1, paddingLeft: '8%'}}>
                  <Text style={[FONTS.fs_14_semibold]}>
                    {viewData.checkOutDate}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.time]}>
                    {viewData.checkOutTime}
                  </Text>
                </View>
              </View>

              <View style={styles.devide} />

              {/* 환불 정보 */}
              <View style={styles.section}>
                <Text style={[FONTS.fs_16_semibold, {marginBottom: 12}]}>
                  {t('guesthouse.refundExpectationInformation')}
                </Text>

                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.actualPaymentAmount')}
                  </Text>
                  <View style={styles.valueInline}>
                    <Text style={[FONTS.fs_14_semibold, styles.value]}>
                      {formatPrice(viewData.paidAmount)}
                    </Text>
                    <Text style={[FONTS.fs_14_regular, styles.valueStrike]}>
                      {formatPrice(viewData.originalAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.applicableRegulations')}
                  </Text>
                  {cancelPolicyInfo.dailyInfo ? (
                    <TouchableOpacity
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => setIsPolicyExpanded(!isPolicyExpanded)}>
                      <Text
                        style={[
                          FONTS.fs_14_semibold,
                          styles.value,
                          {color: COLORS.semantic_red, marginRight: 4},
                        ]}>
                        {cancelPolicyInfo.text}
                      </Text>
                      {isPolicyExpanded ? (
                        <ChevronUp width={16} height={16} />
                      ) : (
                        <ChevronDown width={16} height={16} />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <Text
                      style={[
                        FONTS.fs_14_semibold,
                        styles.value,
                        {color: COLORS.semantic_red},
                      ]}>
                      {cancelPolicyInfo.text}
                    </Text>
                  )}
                </View>

                {isPolicyExpanded && cancelPolicyInfo.dailyInfo && (
                  <View style={styles.dailyPolicyContainer}>
                    {cancelPolicyInfo.dailyInfo.map((info, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.dailyPolicyRow,
                          idx !== 0 && styles.dailyPolicyBorder,
                        ]}>
                        <View>
                          <Text
                            style={[
                              FONTS.fs_14_semibold,
                              styles.dailyPolicyTitle,
                            ]}>
                            {info.nightIndex}
                            {t('common.tea')}
                            {info.dateStr})
                          </Text>
                          <Text
                            style={[FONTS.fs_12_medium, styles.dailyPolicySub]}>
                            {info.daysBeforeLabel}
                          </Text>
                        </View>
                        <Text
                          style={[
                            FONTS.fs_14_medium,
                            styles.dailyPolicyAmount,
                          ]}>
                          {info.rate === 0
                            ? t('common.noRefundAmount0Won')
                            : t('common.valueRefundValue', {
                                info_rate: info.rate,
                                value2: formatPrice(info.refundAmt),
                              })}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.couponDiscount')}
                  </Text>
                  <Text style={[FONTS.fs_14_semibold, styles.value]}>
                    {formatPrice(viewData.couponDiscountAmount)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.applyPoints')}
                  </Text>
                  <Text style={[FONTS.fs_14_semibold, styles.value]}>
                    {formatPoint(viewData.pointDiscountAmount)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.estimatedCancellationFee')}
                  </Text>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.value,
                      {color: COLORS.semantic_red},
                    ]}>
                    {formatPrice(cancelFee)}
                  </Text>
                </View>
              </View>

              <View style={styles.devide} />

              <View style={styles.section}>
                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.refundMethod')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.refundMethod]}>
                    {viewData.refundMethod}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    {t('common.finalRefundAmount')}
                  </Text>
                  <Text style={styles.refundAmount}>
                    {Number(refundAmount || 0).toLocaleString('ko-KR')}
                    <Text style={{color: COLORS.grayscale_900}}>
                      {t('common.won')}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* 취소 사유 */}
              <View style={styles.section}>
                <Text style={[FONTS.fs_16_semibold, {marginTop: 12}]}>
                  {t('common.reasonForCancellation')}
                </Text>

                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.dropdown}
                  onPress={() => setReasonOpen(!reasonOpen)}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      {
                        color: selectedReason
                          ? COLORS.grayscale_900
                          : COLORS.grayscale_400,
                      },
                    ]}>
                    {selectedReason ||
                      t('common.pleaseSelectAReasonForCancellation')}
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
                          activeOpacity={1}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedReason(r);
                            setReasonOpen(false);
                          }}>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              selectedReason === r && FONTS.fs_14_semibold,
                              {
                                color:
                                  selectedReason === r
                                    ? COLORS.primary_orange
                                    : COLORS.grayscale_900,
                              },
                            ]}>
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
                  activeOpacity={1}
                  style={styles.agreeBox}
                  onPress={() => setChecked(!checked)}>
                  <View
                    style={[
                      styles.checkBox,
                      {
                        borderColor: checked
                          ? COLORS.primary_orange
                          : COLORS.grayscale_300,
                      },
                    ]}>
                    {checked ? (
                      <CheckOrange width={20} height={20} />
                    ) : (
                      <CheckGray width={20} height={20} />
                    )}
                  </View>
                  <Text style={[styles.agreeText, FONTS.fs_14_regular]}>
                    <Text style={[styles.required, FONTS.fs_14_semibold]}>
                      {t('common.required')}
                    </Text>
                    {t(
                      'guesthouse.iAgreeToTheAccommodationCancellationRefundPolicy_217d59',
                    )}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setTermsOpen(true)}>
                  <Text style={[styles.required, FONTS.fs_12_medium]}>
                    {t('common.view')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <TermsModal
            visible={termsOpen}
            onClose={() => setTermsOpen(false)}
            title={
              cancelPolicyDoc?.title ||
              t('guesthouse.accommodationCancellationRefundPolicy')
            }
            content={cancelPolicyContent}
            contentHtml={cancelPolicyHtml}
            onAgree={() => setTermsOpen(false)}
          />

          <ReservationCancelConfirmModal
            visible={cancelConfirmOpen}
            onClose={() => setCancelConfirmOpen(false)}
            onConfirm={handleCancelConfirm}
            data={{
              paidAmount: viewData.paidAmount,
              cancelFee: cancelFee,
              refundAmount,
              payMethodLabel: viewData.refundMethod
                ? viewData.refundMethod.replace(t('guesthouse.refund'), '')
                : '',
              refundMethodLabel: viewData.refundMethod,
              appliedPolicyText: cancelPolicyInfo?.text,
              dailyInfo: cancelPolicyInfo?.dailyInfo,
            }}
          />

          <AlertModal
            visible={refundlessAlertOpen}
            title={refundlessAlertContent.title}
            message={refundlessAlertContent.message}
            highlightText={refundlessAlertContent.highlightText}
            buttonText={t('guesthouse.cancelWithoutRefund')}
            buttonText2={t('guesthouse.maintain')}
            onPress={() => {
              setRefundlessAlertOpen(false);
              handleCancelConfirm();
            }}
            onPress2={() => setRefundlessAlertOpen(false)}
          />

          {/* 하단 버튼 */}
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.submitButton,
              (!checked || !selectedReason || cancelSubmitting) && {
                backgroundColor: COLORS.grayscale_300,
              },
            ]}
            disabled={!checked || !selectedReason || cancelSubmitting}
            onPress={handlePressSubmit}>
            <Text style={[styles.submitText, FONTS.fs_14_medium]}>
              {t('common.requestCancellation')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default GuesthouseCancelConfirm;
